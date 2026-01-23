import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GMAIL_API_URL = 'https://www.googleapis.com/gmail/v1'

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('Missing authorization header')
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create admin client for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    
    // Create user client to get user info
    const supabaseUser = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    })
    
    // Get current user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()
    if (userError || !user) {
      console.error('Failed to get user:', userError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Fetching Gmail for user:', user.id, user.email)

    // Get the user's Gmail tokens
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('gmail_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (tokenError || !tokenData) {
      console.log('No Gmail tokens found for user')
      return new Response(
        JSON.stringify({ 
          error: 'Gmail not connected', 
          needsAuth: true,
          message: 'Please sign in with Google to access Gmail' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let accessToken = tokenData.access_token

    // Check if token is expired and refresh if needed
    const tokenExpiresAt = new Date(tokenData.token_expires_at)
    if (tokenExpiresAt <= new Date()) {
      console.log('Token expired, attempting refresh...')
      
      const googleClientId = Deno.env.get('GOOGLE_CLIENT_ID')
      const googleClientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')
      
      if (!googleClientId || !googleClientSecret) {
        console.error('Google OAuth credentials not configured')
        return new Response(
          JSON.stringify({ 
            error: 'Gmail configuration incomplete',
            needsAuth: true 
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: googleClientId,
          client_secret: googleClientSecret,
          refresh_token: tokenData.refresh_token,
          grant_type: 'refresh_token',
        }),
      })

      if (!refreshResponse.ok) {
        console.error('Failed to refresh token:', await refreshResponse.text())
        return new Response(
          JSON.stringify({ 
            error: 'Gmail session expired', 
            needsAuth: true,
            message: 'Please sign in with Google again' 
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const refreshData = await refreshResponse.json()
      accessToken = refreshData.access_token
      
      // Update token in database
      await supabaseAdmin
        .from('gmail_tokens')
        .update({
          access_token: refreshData.access_token,
          token_expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
        })
        .eq('user_id', user.id)
      
      console.log('Token refreshed successfully')
    }

    // Fetch recent emails
    console.log('Fetching messages from Gmail API...')
    const messagesResponse = await fetch(
      `${GMAIL_API_URL}/users/me/messages?maxResults=20&q=is:inbox`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    )

    if (!messagesResponse.ok) {
      const errorText = await messagesResponse.text()
      console.error('Gmail API error:', errorText)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch emails',
          needsAuth: messagesResponse.status === 401 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const messagesData = await messagesResponse.json()
    const messageIds = messagesData.messages || []
    
    console.log(`Found ${messageIds.length} messages`)

    // Helper function to decode HTML entities
    const decodeHtmlEntities = (text: string): string => {
      if (!text) return text;
      return text
        .replace(/&#39;/g, "'")
        .replace(/&#34;/g, '"')
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&nbsp;/g, " ")
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, "/");
    };

    // Fetch details for each message
    const emails = []
    for (const msg of messageIds.slice(0, 10)) { // Limit to 10 for performance
      const detailResponse = await fetch(
        `${GMAIL_API_URL}/users/me/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )
      
      if (detailResponse.ok) {
        const detail = await detailResponse.json()
        const headers = detail.payload?.headers || []
        
        const getHeader = (name: string) => 
          headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || ''
        
        emails.push({
          id: detail.id,
          threadId: detail.threadId,
          subject: decodeHtmlEntities(getHeader('Subject') || '(No subject)'),
          from: getHeader('From'),
          date: getHeader('Date'),
          snippet: decodeHtmlEntities(detail.snippet),
        })
      }
    }

    // Save to talent_updates table
    for (const email of emails) {
      const { error: insertError } = await supabaseAdmin
        .from('talent_updates')
        .upsert({
          source: 'gmail',
          source_id: email.id,
          sender: email.from,
          subject: email.subject,
          content: email.snippet,
          received_at: new Date(email.date).toISOString(),
          fetched_by: user.id,
          metadata: { threadId: email.threadId }
        }, {
          onConflict: 'source,source_id'
        })
      
      if (insertError) {
        console.log('Insert error (may be duplicate):', insertError.message)
      }
    }

    console.log(`Successfully processed ${emails.length} emails`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        count: emails.length,
        emails 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    console.error('Unexpected error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
