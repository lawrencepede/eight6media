import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GMAIL_API_URL = 'https://www.googleapis.com/gmail/v1'

// Decode common HTML entities in email subjects/snippets
const decodeHtmlEntities = (text: string): string => {
  if (!text) return text
  return text
    .replace(/&#39;/g, "'")
    .replace(/&#34;/g, '"')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
}

// Paginate through a Gmail list endpoint, collecting all IDs
async function fetchAllIds(
  url: string,
  accessToken: string,
  idKey: string = 'messages'
): Promise<any[]> {
  const allItems: any[] = []
  let pageToken: string | undefined

  while (true) {
    const pageUrl = pageToken ? `${url}&pageToken=${pageToken}` : url
    const res = await fetch(pageUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!res.ok) {
      console.error(`Gmail list API error (${res.status}):`, await res.text())
      break
    }

    const data = await res.json()
    const items = data[idKey] || []
    allItems.push(...items)

    if (data.nextPageToken) {
      pageToken = data.nextPageToken
    } else {
      break
    }
  }

  return allItems
}

// Fetch message metadata for a batch of message IDs
async function fetchMessageDetails(
  messageIds: string[],
  accessToken: string
): Promise<any[]> {
  const emails: any[] = []

  for (const id of messageIds) {
    const res = await fetch(
      `${GMAIL_API_URL}/users/me/messages/${id}?format=metadata&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Subject&metadataHeaders=Date`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )

    if (res.ok) {
      const detail = await res.json()
      const headers = detail.payload?.headers || []
      const getHeader = (name: string) =>
        headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || ''

      emails.push({
        id: detail.id,
        threadId: detail.threadId,
        subject: decodeHtmlEntities(getHeader('Subject') || '(No subject)'),
        from: getHeader('From'),
        to: getHeader('To'),
        date: getHeader('Date'),
        snippet: decodeHtmlEntities(detail.snippet),
      })
    }
  }

  return emails
}

// Upsert emails into talent_updates
async function upsertEmails(
  supabaseAdmin: any,
  emails: any[],
  source: string,
  userId: string
) {
  let count = 0
  for (const email of emails) {
    const { error } = await supabaseAdmin
      .from('talent_updates')
      .upsert({
        source,
        source_id: email.id,
        sender: source === 'gmail-draft' ? (email.to || email.from) : email.from,
        subject: email.subject,
        content: email.snippet,
        received_at: new Date(email.date).toISOString(),
        fetched_by: userId,
        metadata: { threadId: email.threadId },
      }, { onConflict: 'source,source_id' })

    if (!error) count++
    else console.log(`Upsert error (${source}):`, error.message)
  }
  return count
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    const supabaseUser = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Fetching Gmail for user:', user.id, user.email)

    // Get Gmail tokens
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('gmail_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (tokenError || !tokenData) {
      return new Response(
        JSON.stringify({ error: 'Gmail not connected', needsAuth: true, message: 'Please sign in with Google to access Gmail' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let accessToken = tokenData.access_token

    // Refresh token if expired
    const tokenExpiresAt = new Date(tokenData.token_expires_at)
    if (tokenExpiresAt <= new Date()) {
      console.log('Token expired, refreshing...')
      const googleClientId = Deno.env.get('GOOGLE_CLIENT_ID')
      const googleClientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')

      if (!googleClientId || !googleClientSecret) {
        return new Response(
          JSON.stringify({ error: 'Gmail configuration incomplete', needsAuth: true }),
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
        console.error('Token refresh failed:', await refreshResponse.text())
        return new Response(
          JSON.stringify({ error: 'Gmail session expired', needsAuth: true, message: 'Please sign in with Google again' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const refreshData = await refreshResponse.json()
      accessToken = refreshData.access_token

      await supabaseAdmin
        .from('gmail_tokens')
        .update({
          access_token: refreshData.access_token,
          token_expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
        })
        .eq('user_id', user.id)

      console.log('Token refreshed successfully')
    }

    // ---- INBOX MESSAGES (paginated) ----
    console.log('Fetching all inbox messages with pagination...')
    const allMessages = await fetchAllIds(
      `${GMAIL_API_URL}/users/me/messages?maxResults=500&q=is:inbox after:2025/12/01`,
      accessToken,
      'messages'
    )
    console.log(`Found ${allMessages.length} inbox messages total`)

    const inboxEmails = await fetchMessageDetails(
      allMessages.map((m: any) => m.id),
      accessToken
    )
    const inboxUpserted = await upsertEmails(supabaseAdmin, inboxEmails, 'gmail', user.id)
    console.log(`Upserted ${inboxUpserted} inbox messages`)

    // ---- DRAFTS (paginated) ----
    console.log('Fetching all drafts with pagination...')
    const allDrafts = await fetchAllIds(
      `${GMAIL_API_URL}/users/me/drafts?maxResults=500`,
      accessToken,
      'drafts'
    )
    console.log(`Found ${allDrafts.length} drafts total`)

    // Fetch each draft's message details
    const draftEmails: any[] = []
    for (const draft of allDrafts) {
      const res = await fetch(
        `${GMAIL_API_URL}/users/me/drafts/${draft.id}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )

      if (res.ok) {
        const draftData = await res.json()
        const message = draftData.message
        if (!message) continue

        // Fetch full message metadata
        const msgRes = await fetch(
          `${GMAIL_API_URL}/users/me/messages/${message.id}?format=metadata&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Subject&metadataHeaders=Date`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        )

        if (msgRes.ok) {
          const detail = await msgRes.json()
          const headers = detail.payload?.headers || []
          const getHeader = (name: string) =>
            headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || ''

          draftEmails.push({
            id: draft.id, // Use draft ID as source_id for drafts
            threadId: detail.threadId,
            subject: decodeHtmlEntities(getHeader('Subject') || '(No subject)'),
            from: getHeader('From'),
            to: getHeader('To'),
            date: getHeader('Date') || new Date().toISOString(),
            snippet: decodeHtmlEntities(detail.snippet),
          })
        }
      }
    }

    const draftsUpserted = await upsertEmails(supabaseAdmin, draftEmails, 'gmail-draft', user.id)
    console.log(`Upserted ${draftsUpserted} drafts`)

    return new Response(
      JSON.stringify({
        success: true,
        inboxCount: inboxEmails.length,
        draftsCount: draftEmails.length,
        totalCount: inboxEmails.length + draftEmails.length,
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
