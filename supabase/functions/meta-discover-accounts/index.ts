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
      page_id: string | null;
      page_name: string | null;
    }> = [];

    const seen = new Set<string>();

    // Helper: fetch IG business account from a Page
    async function resolvePageToIG(pageId: string, pageName: string) {
      const url = `https://graph.facebook.com/v19.0/${pageId}?fields=instagram_business_account{id,username,followers_count,profile_picture_url}&access_token=${META_SYSTEM_USER_TOKEN}`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      const ig = data.instagram_business_account;
      if (ig && !seen.has(ig.id)) {
        seen.add(ig.id);
        accounts.push({
          ig_account_id: ig.id,
          username: ig.username || 'unknown',
          followers_count: ig.followers_count || 0,
          profile_picture_url: ig.profile_picture_url || null,
          page_id: pageId,
          page_name: pageName,
        });
      }
    }

    // 1. Owned Pages → IG accounts
    const ownedPagesUrl = `https://graph.facebook.com/v19.0/${META_BUSINESS_ID}/owned_pages?fields=id,name&limit=100&access_token=${META_SYSTEM_USER_TOKEN}`;
    console.log('Fetching owned_pages...');
    const ownedPagesRes = await fetch(ownedPagesUrl);
    if (ownedPagesRes.ok) {
      const pagesData = await ownedPagesRes.json();
      console.log(`Found ${(pagesData.data || []).length} owned pages`);
      for (const page of pagesData.data || []) {
        await resolvePageToIG(page.id, page.name);
      }
    } else {
      console.warn('Failed to fetch owned_pages:', await ownedPagesRes.text());
    }

    // 2. Client Pages (partner/agency) → IG accounts
    const clientPagesUrl = `https://graph.facebook.com/v19.0/${META_BUSINESS_ID}/client_pages?fields=id,name&limit=100&access_token=${META_SYSTEM_USER_TOKEN}`;
    console.log('Fetching client_pages...');
    const clientPagesRes = await fetch(clientPagesUrl);
    if (clientPagesRes.ok) {
      const pagesData = await clientPagesRes.json();
      console.log(`Found ${(pagesData.data || []).length} client pages`);
      for (const page of pagesData.data || []) {
        await resolvePageToIG(page.id, page.name);
      }
    } else {
      console.warn('Failed to fetch client_pages:', await clientPagesRes.text());
    }

    console.log(`Total discovered IG accounts: ${accounts.length}`);

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
