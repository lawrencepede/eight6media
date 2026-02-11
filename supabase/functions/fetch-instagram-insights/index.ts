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

    // Get the connection details
    const { data: connection, error: connError } = await supabase
      .from('instagram_connections')
      .select('*')
      .eq('id', connection_id)
      .single();

    if (connError || !connection) {
      throw new Error('Connection not found');
    }

    const igAccountId = connection.ig_business_account_id;

    if (!igAccountId) {
      throw new Error('No Instagram Business Account ID stored for this connection');
    }

    // Try fetching account info - handle both IGUser and InstagramBusinessAsset node types
    let followersCount: number | null = null;
    let mediaCount: number | null = null;
    let username: string | null = connection.instagram_username;

    // First try with all fields (works for IGUser nodes)
    const fullInfoRes = await fetch(
      `https://graph.facebook.com/v19.0/${igAccountId}?fields=followers_count,media_count,username&access_token=${META_SYSTEM_USER_TOKEN}`
    );

    if (fullInfoRes.ok) {
      const info = await fullInfoRes.json();
      followersCount = info.followers_count ?? null;
      mediaCount = info.media_count ?? null;
      username = info.username || username;
    } else {
      // Likely an InstagramBusinessAsset - try with limited fields
      console.warn('Full field fetch failed, trying limited fields for partner asset...');
      const limitedRes = await fetch(
        `https://graph.facebook.com/v19.0/${igAccountId}?fields=username&access_token=${META_SYSTEM_USER_TOKEN}`
      );
      if (limitedRes.ok) {
        const info = await limitedRes.json();
        username = info.username || username;
      } else {
        console.warn('Limited field fetch also failed:', await limitedRes.text());
      }
    }

    // Get insights - this should work for both node types
    const insightsMetrics = ['impressions', 'reach', 'profile_views', 'website_clicks'].join(',');

    const insightsResponse = await fetch(
      `https://graph.facebook.com/v19.0/${igAccountId}/insights?metric=${insightsMetrics}&period=day&access_token=${META_SYSTEM_USER_TOKEN}`
    );

    let insights: Record<string, number> = {};

    if (insightsResponse.ok) {
      const insightsData = await insightsResponse.json();
      for (const metric of insightsData.data || []) {
        const values = metric.values || [];
        if (values.length > 0) {
          insights[metric.name] = values[values.length - 1].value;
        }
      }
    } else {
      console.warn('Could not fetch insights:', await insightsResponse.text());
    }

    // Try to get follower count from follower_count insight if not available from account info
    if (followersCount === null) {
      const followerRes = await fetch(
        `https://graph.facebook.com/v19.0/${igAccountId}?fields=followers_count&access_token=${META_SYSTEM_USER_TOKEN}`
      );
      if (followerRes.ok) {
        const fData = await followerRes.json();
        followersCount = fData.followers_count ?? null;
      }
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
