import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const META_APP_ID = Deno.env.get('META_APP_ID');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    
    if (!META_APP_ID) {
      throw new Error('META_APP_ID not configured');
    }

    const url = new URL(req.url);
    const creatorId = url.searchParams.get('creator_id');
    const returnUrl = url.searchParams.get('return_url') || `${SUPABASE_URL}/functions/v1/meta-oauth-callback`;

    // Build state parameter with creator_id for the callback
    const state = JSON.stringify({
      creator_id: creatorId,
      return_url: returnUrl,
    });

    const redirectUri = `${SUPABASE_URL}/functions/v1/meta-oauth-callback`;
    
    // Instagram/Facebook OAuth scopes we need
    const scopes = [
      'instagram_basic',
      'instagram_manage_insights',
      'pages_show_list',
      'pages_read_engagement',
    ].join(',');

    // Build the Facebook OAuth URL
    const authUrl = new URL('https://www.facebook.com/v19.0/dialog/oauth');
    authUrl.searchParams.set('client_id', META_APP_ID);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', scopes);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('state', btoa(state));

    return new Response(
      JSON.stringify({ auth_url: authUrl.toString() }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error: unknown) {
    console.error('Error in meta-oauth-start:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
