import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const stateParam = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  // Default return URL (fallback)
  let returnUrl = 'https://eight6media.lovable.app/oauth/meta/result';

  // Decode state to get the return URL
  let state: { creator_id?: string; return_url?: string } = {};
  if (stateParam) {
    try {
      state = JSON.parse(atob(stateParam));
      if (state.return_url) {
        returnUrl = state.return_url;
      }
    } catch {
      console.warn('Could not decode state parameter');
    }
  }

  // Helper to redirect with result
  const redirectWithResult = (success: boolean, message: string) => {
    const resultUrl = new URL(returnUrl);
    resultUrl.searchParams.set('success', success ? 'true' : 'false');
    resultUrl.searchParams.set('message', message);
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': resultUrl.toString(),
      },
    });
  };

  try {
    if (error) {
      console.error('OAuth error:', error);
      
      let errorMessage = `OAuth was denied: ${error}`;
      
      if (error === 'access_denied') {
        errorMessage = `Connection was denied.

This usually happens because:
- The Instagram account is not a Professional account (Business or Creator)
- You didn't grant all required permissions

To connect, switch your Instagram account to a Professional account:
Instagram app -> Settings -> Account -> Switch to Professional Account`;
      }
      
      return redirectWithResult(false, errorMessage);
    }

    if (!code || !stateParam) {
      return redirectWithResult(false, 'Missing authorization code or state');
    }

    const META_APP_ID = Deno.env.get('META_APP_ID');
    const META_APP_SECRET = Deno.env.get('META_APP_SECRET');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!META_APP_ID || !META_APP_SECRET) {
      throw new Error('Meta app credentials not configured');
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
      const noPagesMessage = `No Facebook Pages found linked to your account.

To connect Instagram analytics, you need:
1. A Professional Instagram account (Business or Creator)
2. That account linked to a Facebook Page

To fix this:
1. Create a Facebook Page (or use an existing one)
2. In Instagram: Settings -> Account -> Linked Accounts
3. Connect your Facebook Page
4. Try connecting again`;
      return redirectWithResult(false, noPagesMessage);
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
      const noBusinessAccountMessage = `Your Instagram account must be a Professional account (Business or Creator) to connect.

To fix this:
1. Open Instagram app
2. Go to Settings -> Account
3. Tap "Switch to Professional Account"
4. Choose Business or Creator
5. Link it to a Facebook Page
6. Try connecting again`;
      return redirectWithResult(false, noBusinessAccountMessage);
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

    return redirectWithResult(true, `Successfully connected @${instagramAccount.username}!`);

  } catch (error: unknown) {
    console.error('Error in meta-oauth-callback:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return redirectWithResult(false, `An error occurred: ${message}`);
  }
});
