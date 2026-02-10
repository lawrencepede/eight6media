import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const META_SYSTEM_USER_TOKEN = Deno.env.get('META_SYSTEM_USER_TOKEN');
    const META_BUSINESS_ID = Deno.env.get('META_BUSINESS_ID');

    if (!META_SYSTEM_USER_TOKEN || !META_BUSINESS_ID) {
      throw new Error('META_SYSTEM_USER_TOKEN and META_BUSINESS_ID must be configured');
    }

    const accounts: Array<{
      ig_account_id: string;
      username: string;
      followers_count: number;
      profile_picture_url: string | null;
    }> = [];

    const seen = new Set<string>();

    // Fetch owned Instagram accounts
    const ownedUrl = `https://graph.facebook.com/v19.0/${META_BUSINESS_ID}/owned_instagram_accounts?fields=id,username,followers_count,profile_picture_url&access_token=${META_SYSTEM_USER_TOKEN}`;
    const ownedRes = await fetch(ownedUrl);
    if (ownedRes.ok) {
      const ownedData = await ownedRes.json();
      for (const acct of ownedData.data || []) {
        if (!seen.has(acct.id)) {
          seen.add(acct.id);
          accounts.push({
            ig_account_id: acct.id,
            username: acct.username || 'unknown',
            followers_count: acct.followers_count || 0,
            profile_picture_url: acct.profile_picture_url || null,
          });
        }
      }
    } else {
      console.warn('Failed to fetch owned accounts:', await ownedRes.text());
    }

    // Fetch client/partner Instagram accounts
    const clientUrl = `https://graph.facebook.com/v19.0/${META_BUSINESS_ID}/client_instagram_accounts?fields=id,username,followers_count,profile_picture_url&access_token=${META_SYSTEM_USER_TOKEN}`;
    const clientRes = await fetch(clientUrl);
    if (clientRes.ok) {
      const clientData = await clientRes.json();
      for (const acct of clientData.data || []) {
        if (!seen.has(acct.id)) {
          seen.add(acct.id);
          accounts.push({
            ig_account_id: acct.id,
            username: acct.username || 'unknown',
            followers_count: acct.followers_count || 0,
            profile_picture_url: acct.profile_picture_url || null,
          });
        }
      }
    } else {
      console.warn('Failed to fetch client accounts:', await clientRes.text());
    }

    return new Response(
      JSON.stringify({ accounts }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: unknown) {
    console.error('Error in meta-discover-accounts:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
