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

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const META_SYSTEM_USER_TOKEN = Deno.env.get('META_SYSTEM_USER_TOKEN');

    if (!META_SYSTEM_USER_TOKEN) {
      throw new Error('META_SYSTEM_USER_TOKEN not configured');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const { connection_id } = await req.json();

    if (!connection_id) {
      throw new Error('connection_id is required');
    }

    const { data: connection, error: connError } = await supabase
      .from('instagram_connections')
      .select('*')
      .eq('id', connection_id)
      .single();

    if (connError || !connection) {
      throw new Error('Connection not found');
    }

    let igAccountId = connection.ig_business_account_id;
    const pageId = connection.page_id;

    // If we have a page_id but no valid ig_business_account_id, resolve it
    if (pageId && !igAccountId) {
      const pageRes = await fetch(
        `https://graph.facebook.com/v19.0/${pageId}?fields=instagram_business_account&access_token=${META_SYSTEM_USER_TOKEN}`
      );
      if (pageRes.ok) {
        const pageData = await pageRes.json();
        igAccountId = pageData.instagram_business_account?.id || null;
        if (igAccountId) {
          // Update the stored ig_business_account_id
          await supabase
            .from('instagram_connections')
            .update({ ig_business_account_id: igAccountId })
            .eq('id', connection_id);
        }
      }
    }

    if (!igAccountId) {
      throw new Error('No Instagram Business Account ID available. Try reconnecting this account.');
    }

    console.log(`Fetching insights for IG account: ${igAccountId}`);

    // Get basic account info
    const accountInfoRes = await fetch(
      `https://graph.facebook.com/v19.0/${igAccountId}?fields=followers_count,media_count,username&access_token=${META_SYSTEM_USER_TOKEN}`
    );

    let followersCount: number | null = null;
    let mediaCount: number | null = null;
    let username: string = connection.instagram_username;

    if (accountInfoRes.ok) {
      const info = await accountInfoRes.json();
      followersCount = info.followers_count ?? null;
      mediaCount = info.media_count ?? null;
      username = info.username || username;
    } else {
      console.warn('Failed to fetch account info:', await accountInfoRes.text());
    }

    // Get insights
    const insightsMetrics = ['impressions', 'reach', 'profile_views', 'website_clicks'].join(',');
    const insightsRes = await fetch(
      `https://graph.facebook.com/v19.0/${igAccountId}/insights?metric=${insightsMetrics}&period=day&access_token=${META_SYSTEM_USER_TOKEN}`
    );

    let insights: Record<string, number> = {};
    if (insightsRes.ok) {
      const insightsData = await insightsRes.json();
      for (const metric of insightsData.data || []) {
        const values = metric.values || [];
        if (values.length > 0) {
          insights[metric.name] = values[values.length - 1].value;
        }
      }
    } else {
      console.warn('Could not fetch insights:', await insightsRes.text());
    }

    const engagementRate = followersCount && followersCount > 0
      ? ((insights.reach || 0) / followersCount * 100).toFixed(2)
      : '0';

    const today = new Date().toISOString().split('T')[0];

    const { error: insertError } = await supabase
      .from('instagram_insights')
      .upsert({
        connection_id,
        metric_date: today,
        followers_count: followersCount,
        media_count: mediaCount,
        impressions: insights.impressions || null,
        reach: insights.reach || null,
        profile_views: insights.profile_views || null,
        website_clicks: insights.website_clicks || null,
        engagement_rate: parseFloat(engagementRate) || null,
        raw_data: {
          account_info: { username, followers_count: followersCount, media_count: mediaCount },
          insights,
          fetched_at: new Date().toISOString(),
        },
      }, {
        onConflict: 'connection_id,metric_date',
      });

    if (insertError) {
      console.error('Failed to store insights:', insertError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        username,
        followers_count: followersCount,
        media_count: mediaCount,
        impressions: insights.impressions || 0,
        reach: insights.reach || 0,
        profile_views: insights.profile_views || 0,
        website_clicks: insights.website_clicks || 0,
        engagement_rate: engagementRate,
        fetched_at: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: unknown) {
    console.error('Error in fetch-instagram-insights:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
