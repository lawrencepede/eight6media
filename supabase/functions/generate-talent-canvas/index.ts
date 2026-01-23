import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SLACK_API_URL = "https://slack.com/api";
const AI_GATEWAY_URL = "https://ai-gateway.lovable.dev/v1/chat/completions";

interface Deal {
  talent_name: string;
  brand_name: string;
  status: string;
}

interface TalentUpdate {
  content: string;
  subject: string | null;
  sender: string | null;
  received_at: string;
  metadata: any;
}

interface DealSummary {
  brand: string;
  status: string;
  key_updates: string[];
  next_steps: string[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { talent_name, preview_only = false } = await req.json();

    if (!talent_name) {
      return new Response(
        JSON.stringify({ success: false, error: "talent_name is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Generating canvas for talent: ${talent_name} (preview: ${preview_only})`);

    console.log(`Generating canvas for talent: ${talent_name}`);

    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const slackBotToken = Deno.env.get("SLACK_BOT_TOKEN");
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }
    if (!slackBotToken) {
      throw new Error("SLACK_BOT_TOKEN is not configured");
    }
    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Step 1: Get deals for this talent
    const { data: deals, error: dealsError } = await supabase
      .from("deals")
      .select("talent_name, brand_name, status")
      .ilike("talent_name", `%${talent_name}%`);

    if (dealsError) {
      throw new Error(`Error fetching deals: ${dealsError.message}`);
    }

    console.log(`Found ${deals?.length || 0} deals for ${talent_name}`);

    if (!deals || deals.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `No deals found for talent: ${talent_name}` 
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Get recent updates mentioning this talent or their brands (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const brandNames = deals.map(d => d.brand_name);
    
    const { data: updates, error: updatesError } = await supabase
      .from("talent_updates")
      .select("content, subject, sender, received_at, metadata")
      .or(`talent_name.ilike.%${talent_name}%,content.ilike.%${talent_name}%`)
      .gte("received_at", sevenDaysAgo.toISOString())
      .order("received_at", { ascending: false })
      .limit(50);

    if (updatesError) {
      console.error("Error fetching updates:", updatesError);
    }

    console.log(`Found ${updates?.length || 0} recent updates`);

    // Step 3: Use AI to summarize updates per deal
    const dealSummaries: DealSummary[] = [];

    for (const deal of deals) {
      // Filter updates relevant to this specific deal (talent + brand)
      const relevantUpdates = (updates || []).filter(u => {
        const content = (u.content || "").toLowerCase();
        const subject = (u.subject || "").toLowerCase();
        const brandLower = deal.brand_name.toLowerCase();
        const talentLower = deal.talent_name.toLowerCase();
        
        return (content.includes(brandLower) || subject.includes(brandLower)) &&
               (content.includes(talentLower) || subject.includes(talentLower));
      });

      let key_updates: string[] = [];
      let next_steps: string[] = [];

      if (relevantUpdates.length > 0) {
        // Use AI to summarize
        const messagesText = relevantUpdates
          .slice(0, 10)
          .map(u => `[${u.sender || "Unknown"}] ${u.subject || ""}: ${u.content?.slice(0, 500) || ""}`)
          .join("\n\n");

        const aiPrompt = `Given these messages about ${deal.talent_name}'s deal with ${deal.brand_name}:

${messagesText}

Extract:
1. key_updates: 3-5 brief bullet points (max 10 words each) summarizing important developments
2. next_steps: 1-3 action items or next steps mentioned (max 10 words each)

If no clear updates or next steps, provide reasonable placeholders.

Return ONLY valid JSON (no markdown): { "key_updates": ["..."], "next_steps": ["..."] }`;

        try {
          const aiResponse = await fetch(AI_GATEWAY_URL, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${lovableApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [{ role: "user", content: aiPrompt }],
            }),
          });

          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            const responseText = aiData.choices?.[0]?.message?.content || "";
            
            // Parse JSON from response
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              key_updates = parsed.key_updates || [];
              next_steps = parsed.next_steps || [];
            }
          }
        } catch (aiError) {
          console.error("AI summarization error:", aiError);
        }
      }

      // Default values if AI didn't produce results
      if (key_updates.length === 0) {
        key_updates = ["No recent updates"];
      }
      if (next_steps.length === 0) {
        next_steps = ["Review deal status"];
      }

      dealSummaries.push({
        brand: deal.brand_name,
        status: deal.status,
        key_updates,
        next_steps,
      });
    }

    // Step 4: Build markdown table for this week's update
    const now = new Date();
    const weekLabel = now.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    
    // Calculate week range for header
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    const weekRangeStr = `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

    let weeklyUpdate = `## 📅 Week of ${weekRangeStr}\n`;
    weeklyUpdate += `*Generated: ${weekLabel}*\n\n`;
    weeklyUpdate += `| Brand | Status | Key Updates | Next Steps |\n`;
    weeklyUpdate += `|-------|--------|-------------|------------|\n`;

    for (const summary of dealSummaries) {
      // Filter out empty strings and join with bullets
      const validUpdates = summary.key_updates.filter(u => u && u.trim());
      const validSteps = summary.next_steps.filter(s => s && s.trim());
      const updatesStr = validUpdates.length > 0 ? validUpdates.map(u => `• ${u}`).join(" ") : "—";
      const stepsStr = validSteps.length > 0 ? validSteps.map(s => `• ${s}`).join(" ") : "—";
      weeklyUpdate += `| ${summary.brand} | ${summary.status} | ${updatesStr} | ${stepsStr} |\n`;
    }
    
    weeklyUpdate += `\n---\n\n`; // Separator between weeks

    // If preview_only, return the content without posting to Slack
    if (preview_only) {
      return new Response(
        JSON.stringify({
          success: true,
          preview: true,
          talent_name,
          deals_count: dealSummaries.length,
          canvas_content: weeklyUpdate,
          deal_summaries: dealSummaries,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Weekly update content generated:\n", weeklyUpdate);

    // Step 5: Find the talent's Slack channel
    // Convert "DR. JAIME SEEMAN" to "drjaime-seeman" (join "Dr." directly to first name)
    const channelName = talent_name
      .toLowerCase()
      .replace(/[.]+/g, "") // Remove periods
      .replace(/^dr\s+/i, "dr") // Join "DR " directly to first name (no hyphen)
      .replace(/\s+/g, "-") // Replace remaining spaces with hyphens
      .replace(/-+/g, "-") // Collapse multiple hyphens
      .replace(/^-|-$/g, ""); // Trim leading/trailing hyphens
    console.log(`Looking for Slack channel: #${channelName}`);

    // List channels to find the one matching the talent name
    const channelsResponse = await fetch(
      `${SLACK_API_URL}/conversations.list?types=public_channel,private_channel&limit=500`,
      { headers: { Authorization: `Bearer ${slackBotToken}` } }
    );
    const channelsData = await channelsResponse.json();

    if (!channelsData.ok) {
      throw new Error(`Failed to list Slack channels: ${channelsData.error}`);
    }

    const targetChannel = channelsData.channels?.find(
      (ch: any) => ch.name.toLowerCase() === channelName
    );

    if (!targetChannel) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Slack channel #${channelName} not found. Make sure the bot is a member of the channel.`,
          canvas_content: weeklyUpdate, // Return content anyway for debugging
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found channel: ${targetChannel.name} (${targetChannel.id})`);

    // Step 6: Check for existing canvas on the channel
    let canvasId: string | null = null;
    let canvasUpdated = false;
    let canvasCreated = false;

    // First, get channel info to check for existing canvas
    try {
      const channelInfoResponse = await fetch(
        `${SLACK_API_URL}/conversations.info?channel=${targetChannel.id}`,
        { headers: { Authorization: `Bearer ${slackBotToken}` } }
      );
      const channelInfo = await channelInfoResponse.json();
      
      if (channelInfo.ok && channelInfo.channel?.properties?.canvas?.canvas_id) {
        canvasId = channelInfo.channel.properties.canvas.canvas_id;
        console.log(`Found existing canvas: ${canvasId}`);
      }
    } catch (err) {
      console.warn("Could not check for existing canvas:", err);
    }

    // If canvas exists, prepend new content to it
    if (canvasId) {
      try {
        // Create a header for the talent if this is the first section
        const headerContent = `# Deal Updates: ${talent_name}\n\n`;
        
        const editResponse = await fetch(`${SLACK_API_URL}/canvases.edit`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${slackBotToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            canvas_id: canvasId,
            changes: [{
              operation: "insert_at_start",
              document_content: {
                type: "markdown",
                markdown: weeklyUpdate,
              },
            }],
          }),
        });

        const editData = await editResponse.json();
        console.log("Canvas edit response:", editData);

        if (editData.ok) {
          canvasUpdated = true;
          console.log(`Canvas updated: ${canvasId}`);
        } else {
          console.error("Canvas edit failed:", editData.error);
        }
      } catch (editError) {
        console.error("Canvas edit error:", editError);
      }
    } else {
      // No existing canvas, create a new one
      try {
        const fullContent = `# Deal Updates: ${talent_name}\n\n${weeklyUpdate}`;
        
        const createResponse = await fetch(
          `${SLACK_API_URL}/conversations.canvases.create`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${slackBotToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              channel_id: targetChannel.id,
              document_content: {
                type: "markdown",
                markdown: fullContent,
              },
            }),
          }
        );

        const createData = await createResponse.json();
        console.log("Canvas creation response:", createData);

        if (createData.ok) {
          canvasId = createData.canvas_id;
          canvasCreated = true;
          console.log(`Canvas created: ${canvasId}`);
        } else {
          console.error("Canvas creation failed:", createData.error);
        }
      } catch (createError) {
        console.error("Canvas creation error:", createError);
      }
    }

    // Step 7: Post notification message to the channel (optional - don't fail if this errors)
    let messageSent = false;
    const notificationMessage = canvasId
      ? `📋 Weekly Deal Updates have been ${canvasUpdated ? 'added to' : 'posted in'} your canvas.`
      : `📋 *Deal Updates: ${talent_name}*\n\n${weeklyUpdate}`;

    try {
      const postResponse = await fetch(`${SLACK_API_URL}/chat.postMessage`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${slackBotToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channel: targetChannel.id,
          text: notificationMessage,
          mrkdwn: true,
        }),
      });

      const postData = await postResponse.json();
      console.log("Message post response:", postData);
      
      if (postData.ok) {
        messageSent = true;
      } else {
        console.warn(`Could not post notification message: ${postData.error}. Needed scope: ${postData.needed || 'unknown'}`);
      }
    } catch (msgError) {
      console.warn("Failed to post notification message:", msgError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        talent_name,
        channel: `#${targetChannel.name}`,
        canvas_created: canvasCreated,
        canvas_updated: canvasUpdated,
        message_sent: messageSent,
        deals_count: dealSummaries.length,
        message: canvasUpdated
          ? `Successfully updated canvas for ${talent_name} in #${targetChannel.name}`
          : canvasCreated
          ? `Successfully created canvas for ${talent_name} in #${targetChannel.name}`
          : `Posted deal updates for ${talent_name} in #${targetChannel.name}`,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error generating canvas:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
