import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const stateParam = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  // HTML response helper
  const htmlResponse = (message: string, success: boolean) => `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${success ? 'Connected!' : 'Connection Failed'}</title>
        <style>
          body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0f0f0f; color: white; }
          .container { text-align: center; padding: 2rem; }
          h1 { color: ${success ? '#22c55e' : '#ef4444'}; }
          p { color: #9ca3af; margin-top: 1rem; }
          .close-btn { margin-top: 2rem; padding: 0.75rem 1.5rem; background: #3b82f6; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-size: 1rem; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>${success ? '✓ Instagram Connected!' : '✗ Connection Failed'}</h1>
          <p>${message}</p>
          <button class="close-btn" onclick="window.close()">Close Window</button>
        </div>
        <script>
          setTimeout(() => {
            if (window.opener) {
              window.opener.postMessage({ type: 'meta-oauth-complete', success: ${success} }, '*');
            }
          }, 1000);
        </script>
      </body>
    </html>
  `;

  try {
    if (error) {
      console.error('OAuth error:', error);
      
      // Handle specific error cases with user-friendly messages
      let errorMessage = `OAuth was denied: ${error}`;
      
      if (error === 'access_denied') {
        errorMessage = `Connection was denied. This usually happens because:

• The Instagram account is not a Professional account (Business or Creator)
• You didn't grant all required permissions

To connect, please ensure your Instagram account is switched to a Professional account in Instagram Settings → Account → Switch to Professional Account.`;
      }
      
      return new Response(htmlResponse(errorMessage, false), {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    if (!code || !stateParam) {
      return new Response(htmlResponse('Missing authorization code or state', false), {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    const META_APP_ID = Deno.env.get('META_APP_ID');
    const META_APP_SECRET = Deno.env.get('META_APP_SECRET');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!META_APP_ID || !META_APP_SECRET) {
      throw new Error('Meta app credentials not configured');
    }

    // Decode state
    let state: { creator_id?: string } = {};
    try {
      state = JSON.parse(atob(stateParam));
    } catch {
      console.warn('Could not decode state parameter');
    }

    const redirectUri = `${SUPABASE_URL}/functions/v1/meta-oauth-callback`;

    // Exchange code for access token
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?` +
      `client_id=${META_APP_ID}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `client_secret=${META_APP_SECRET}&` +
      `code=${code}`
    );

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    const shortLivedToken = tokenData.access_token;

    // Exchange for long-lived token
    const longLivedResponse = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?` +
      `grant_type=fb_exchange_token&` +
      `client_id=${META_APP_ID}&` +
      `client_secret=${META_APP_SECRET}&` +
      `fb_exchange_token=${shortLivedToken}`
    );

    if (!longLivedResponse.ok) {
      console.error('Long-lived token exchange failed');
      throw new Error('Failed to get long-lived token');
    }

    const longLivedData = await longLivedResponse.json();
    const accessToken = longLivedData.access_token;
    const expiresIn = longLivedData.expires_in || 5184000; // Default 60 days

    // Get user's pages
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}`
    );
    
    if (!pagesResponse.ok) {
      throw new Error('Failed to fetch pages');
    }

    const pagesData = await pagesResponse.json();
    const pages = pagesData.data || [];

    if (pages.length === 0) {
      return new Response(htmlResponse('No Facebook Pages found. Please ensure your Instagram Business account is connected to a Facebook Page.', false), {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Get Instagram Business Account for each page
    let instagramAccount = null;
    let selectedPage = null;

    for (const page of pages) {
      const igResponse = await fetch(
        `https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
      );
      
      if (igResponse.ok) {
        const igData = await igResponse.json();
        if (igData.instagram_business_account) {
          // Get Instagram account details
          const igDetailsResponse = await fetch(
            `https://graph.facebook.com/v19.0/${igData.instagram_business_account.id}?fields=id,username,profile_picture_url,followers_count,media_count&access_token=${page.access_token}`
          );
          
          if (igDetailsResponse.ok) {
            instagramAccount = await igDetailsResponse.json();
            selectedPage = page;
            break;
          }
        }
      }
    }

    if (!instagramAccount) {
      return new Response(htmlResponse('No Instagram Business Account found connected to your Facebook Pages.', false), {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Store in database
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    const { error: dbError } = await supabase
      .from('instagram_connections')
      .upsert({
        instagram_user_id: instagramAccount.id,
        instagram_username: instagramAccount.username,
        access_token: selectedPage.access_token, // Use page token for API calls
        token_expires_at: tokenExpiresAt,
        page_id: selectedPage.id,
        page_name: selectedPage.name,
        creator_id: state.creator_id || null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'instagram_user_id',
      });

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to save connection');
    }

    return new Response(
      htmlResponse(`Successfully connected @${instagramAccount.username}! You can close this window.`, true),
      { headers: { 'Content-Type': 'text/html' } }
    );

  } catch (error: unknown) {
    console.error('Error in meta-oauth-callback:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      htmlResponse(`An error occurred: ${message}`, false),
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
});
