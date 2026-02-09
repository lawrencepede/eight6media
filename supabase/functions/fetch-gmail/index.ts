import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GMAIL_API_URL = 'https://www.googleapis.com/gmail/v1'
const BATCH_SIZE = 25
const MAX_DRAFTS = 500

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

function parseMessageDetail(detail: any, idOverride?: string) {
  const headers = detail.payload?.headers || []
  const getHeader = (name: string) =>
    headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || ''

  return {
    id: idOverride || detail.id,
    threadId: detail.threadId,
    subject: decodeHtmlEntities(getHeader('Subject') || '(No subject)'),
    from: getHeader('From'),
    to: getHeader('To'),
    date: getHeader('Date') || new Date().toISOString(),
    snippet: decodeHtmlEntities(detail.snippet),
  }
}

// Fetch message details in parallel batches
async function fetchMessageDetailsBatched(
  messageIds: string[],
  accessToken: string
): Promise<any[]> {
  const emails: any[] = []

  for (let i = 0; i < messageIds.length; i += BATCH_SIZE) {
    const batch = messageIds.slice(i, i + BATCH_SIZE)
    const results = await Promise.all(
      batch.map(async (id) => {
        try {
          const res = await fetch(
            `${GMAIL_API_URL}/users/me/messages/${id}?format=metadata&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Subject&metadataHeaders=Date`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          )
          if (res.ok) return parseMessageDetail(await res.json())
          await res.text() // consume body
        } catch (e) {
          console.error(`Error fetching message ${id}:`, e)
        }
        return null
      })
    )
    emails.push(...results.filter(Boolean))
  }

  return emails
}

// Fetch draft details in parallel batches
async function fetchDraftDetailsBatched(
  drafts: any[],
  accessToken: string
): Promise<any[]> {
  const emails: any[] = []

  for (let i = 0; i < drafts.length; i += BATCH_SIZE) {
    const batch = drafts.slice(i, i + BATCH_SIZE)
    const results = await Promise.all(
      batch.map(async (draft) => {
        try {
          const res = await fetch(
            `${GMAIL_API_URL}/users/me/drafts/${draft.id}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          )
          if (!res.ok) { await res.text(); return null }

          const draftData = await res.json()
          const message = draftData.message
          if (!message) return null

          const msgRes = await fetch(
            `${GMAIL_API_URL}/users/me/messages/${message.id}?format=metadata&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Subject&metadataHeaders=Date`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          )
          if (!msgRes.ok) { await msgRes.text(); return null }

          return parseMessageDetail(await msgRes.json(), draft.id)
        } catch (e) {
          console.error(`Error fetching draft ${draft.id}:`, e)
          return null
        }
      })
    )
    emails.push(...results.filter(Boolean))
  }

  return emails
}

// Bulk upsert emails into talent_updates
async function upsertEmailsBulk(
  supabaseAdmin: any,
  emails: any[],
  source: string,
  userId: string
): Promise<number> {
  if (emails.length === 0) return 0

  const rows = emails.map((email) => ({
    source,
    source_id: email.id,
    sender: source === 'gmail-draft' ? (email.to || email.from) : email.from,
    subject: email.subject,
    content: email.snippet,
    received_at: new Date(email.date).toISOString(),
    fetched_by: userId,
    metadata: { threadId: email.threadId },
  }))

  let count = 0
  // Upsert in chunks of 100 rows
  for (let i = 0; i < rows.length; i += 100) {
    const chunk = rows.slice(i, i + 100)
    const { error, data } = await supabaseAdmin
      .from('talent_updates')
      .upsert(chunk, { onConflict: 'source,source_id' })
      .select('id')

    if (error) {
      console.error(`Bulk upsert error (${source}):`, error.message)
    } else {
      count += data?.length || chunk.length
    }
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

    // ---- INBOX MESSAGES (paginated + batched) ----
    console.log('Fetching all inbox messages...')
    const allMessages = await fetchAllIds(
      `${GMAIL_API_URL}/users/me/messages?maxResults=500&q=is:inbox after:2025/12/01`,
      accessToken,
      'messages'
    )
    console.log(`Found ${allMessages.length} inbox messages, fetching details in batches of ${BATCH_SIZE}...`)

    const inboxEmails = await fetchMessageDetailsBatched(
      allMessages.map((m: any) => m.id),
      accessToken
    )
    const inboxUpserted = await upsertEmailsBulk(supabaseAdmin, inboxEmails, 'gmail', user.id)
    console.log(`Upserted ${inboxUpserted} inbox messages`)

    // ---- DRAFTS (paginated + batched, capped) ----
    console.log('Fetching drafts...')
    const allDrafts = await fetchAllIds(
      `${GMAIL_API_URL}/users/me/drafts?maxResults=500`,
      accessToken,
      'drafts'
    )
    console.log(`Found ${allDrafts.length} drafts total`)

    const draftsToFetch = allDrafts.slice(0, MAX_DRAFTS)
    console.log(`Fetching details for ${draftsToFetch.length} most recent drafts in batches of ${BATCH_SIZE}...`)

    const draftEmails = await fetchDraftDetailsBatched(draftsToFetch, accessToken)
    const draftsUpserted = await upsertEmailsBulk(supabaseAdmin, draftEmails, 'gmail-draft', user.id)
    console.log(`Upserted ${draftsUpserted} drafts`)

    return new Response(
      JSON.stringify({
        success: true,
        inboxCount: inboxEmails.length,
        draftsCount: draftEmails.length,
        totalDraftsAvailable: allDrafts.length,
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
