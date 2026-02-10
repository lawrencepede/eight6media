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

    // Get basic account info
    const accountInfoResponse = await fetch(
      `https://graph.facebook.com/v19.0/${igAccountId}?fields=followers_count,media_count,username&access_token=${META_SYSTEM_USER_TOKEN}`
    );

    if (!accountInfoResponse.ok) {
      const errText = await accountInfoResponse.text();
      console.error('Failed to fetch account info:', errText);
      throw new Error('Failed to fetch account info');
    }

    const accountInfo = await accountInfoResponse.json();

    // Get insights
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

    const engagementRate = accountInfo.followers_count > 0
      ? ((insights.reach || 0) / accountInfo.followers_count * 100).toFixed(2)
      : 0;

    const today = new Date().toISOString().split('T')[0];

    const { error: insertError } = await supabase
      .from('instagram_insights')
      .upsert({
        connection_id,
        metric_date: today,
        followers_count: accountInfo.followers_count,
        media_count: accountInfo.media_count,
        impressions: insights.impressions || null,
        reach: insights.reach || null,
        profile_views: insights.profile_views || null,
        website_clicks: insights.website_clicks || null,
        engagement_rate: parseFloat(engagementRate as string) || null,
        raw_data: {
          account_info: accountInfo,
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
        username: accountInfo.username,
        followers_count: accountInfo.followers_count,
        media_count: accountInfo.media_count,
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
