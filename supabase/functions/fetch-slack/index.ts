import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SLACK_API_URL = "https://slack.com/api";

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SLACK_BOT_TOKEN = Deno.env.get("SLACK_BOT_TOKEN");
    if (!SLACK_BOT_TOKEN) {
      console.error("SLACK_BOT_TOKEN is not configured");
      return new Response(
        JSON.stringify({ error: "Slack not configured", needsAuth: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      console.error("User auth error:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Fetching Slack messages for user: ${user.id}`);

    // Step 1: Get list of channels the bot is in
    const channelsResponse = await fetch(`${SLACK_API_URL}/conversations.list?types=public_channel,private_channel&limit=100`, {
      headers: { Authorization: `Bearer ${SLACK_BOT_TOKEN}` },
    });
    const channelsData = await channelsResponse.json();

    if (!channelsData.ok) {
      console.error("Failed to fetch channels:", channelsData.error);
      return new Response(
        JSON.stringify({ error: `Slack API error: ${channelsData.error}`, slackError: channelsData.error }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${channelsData.channels?.length || 0} channels`);

    // Filter to channels where bot is a member
    const botChannels = channelsData.channels?.filter((ch: any) => ch.is_member) || [];
    console.log(`Bot is member of ${botChannels.length} channels`);

    if (botChannels.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Bot is not a member of any channels. Invite the bot to a channel first.",
          messages: [] 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Build a user ID to name map
    const usersResponse = await fetch(`${SLACK_API_URL}/users.list?limit=200`, {
      headers: { Authorization: `Bearer ${SLACK_BOT_TOKEN}` },
    });
    const usersData = await usersResponse.json();

    const userMap: Record<string, string> = {};
    if (usersData.ok && usersData.members) {
      for (const member of usersData.members) {
        userMap[member.id] = member.real_name || member.profile?.display_name || member.name || member.id;
      }
    }
    console.log(`Built user map with ${Object.keys(userMap).length} users`);

  // Helper function to replace Slack user mentions with real names
  const resolveUserMentions = (text: string): string => {
    if (!text) return text;
    return text.replace(/<@([A-Z0-9]+)>/g, (match, userId) => {
      const userName = userMap[userId];
      return userName ? `@${userName}` : match;
    });
  };

  // Step 3: Fetch recent messages from each channel
  const allMessages: any[] = [];
  const oneDayAgo = Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000);

  for (const channel of botChannels) {
    console.log(`Fetching messages from #${channel.name}`);
    
    const historyResponse = await fetch(
      `${SLACK_API_URL}/conversations.history?channel=${channel.id}&oldest=${oneDayAgo}&limit=50`,
      { headers: { Authorization: `Bearer ${SLACK_BOT_TOKEN}` } }
    );
    const historyData = await historyResponse.json();

    if (!historyData.ok) {
      console.error(`Failed to fetch history for ${channel.name}:`, historyData.error);
      continue;
    }

    const messages = historyData.messages || [];
    console.log(`Found ${messages.length} messages in #${channel.name}`);

    for (const msg of messages) {
      // Skip bot messages and system messages
      if (msg.subtype === "bot_message" || msg.subtype === "channel_join" || msg.subtype === "channel_leave") {
        continue;
      }

      const senderName = userMap[msg.user] || msg.user || "Unknown";
      const timestamp = new Date(parseFloat(msg.ts) * 1000);
      
      // Resolve user mentions in message text
      const resolvedContent = resolveUserMentions(msg.text || "");

      allMessages.push({
        source: "slack",
        source_id: `slack_${channel.id}_${msg.ts}`,
        sender: senderName,
        subject: `#${channel.name}`,
        content: resolvedContent,
        received_at: timestamp.toISOString(),
        fetched_by: user.id,
        metadata: {
          channel_id: channel.id,
          channel_name: channel.name,
          user_id: msg.user,
          thread_ts: msg.thread_ts,
        },
      });
    }
  }

    console.log(`Total messages to upsert: ${allMessages.length}`);

    // Step 4: Upsert messages into talent_updates
    if (allMessages.length > 0) {
      const { error: upsertError } = await supabaseAdmin
        .from("talent_updates")
        .upsert(allMessages, { onConflict: "source_id" });

      if (upsertError) {
        console.error("Failed to upsert messages:", upsertError);
        return new Response(
          JSON.stringify({ error: "Failed to store messages", details: upsertError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Synced ${allMessages.length} messages from ${botChannels.length} channels`,
        channels: botChannels.map((ch: any) => ch.name),
        messageCount: allMessages.length,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Unexpected error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: "Internal server error", details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
