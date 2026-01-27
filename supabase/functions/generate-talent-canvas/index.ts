import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SLACK_API_URL = "https://slack.com/api";
const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

interface Deal {
  talent_name: string;
  brand_name: string;
  status: string;
}

interface TalentUpdate {
  id: string;
  content: string;
  subject: string | null;
  sender: string | null;
  received_at: string;
  metadata: {
    brand_name?: string;
    key_point?: string;
    action_items?: string[];
    is_noise?: boolean;
    channel_name?: string;
  } | null;
}

interface DealSummary {
  brand: string;
  status: string;
  key_updates: string[];
  next_steps: string[];
  is_new_opportunity?: boolean;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { talent_name, preview_only = false, edited_summaries } = await req.json();

    if (!talent_name) {
      return new Response(
        JSON.stringify({ success: false, error: "talent_name is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Generating canvas for talent: ${talent_name} (preview: ${preview_only})`);

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

    // Step 1: Get recent updates for this talent (last 7 days) - UPDATE-CENTRIC approach
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: updates, error: updatesError } = await supabase
      .from("talent_updates")
      .select("id, content, subject, sender, received_at, metadata")
      .or(`talent_name.ilike.%${talent_name}%,content.ilike.%${talent_name}%`)
      .gte("received_at", sevenDaysAgo.toISOString())
      .order("received_at", { ascending: false })
      .limit(100);

    if (updatesError) {
      console.error("Error fetching updates:", updatesError);
    }

    console.log(`Found ${updates?.length || 0} recent updates for ${talent_name}`);

    // Step 2: Get existing deals for this talent from Deal Tracker
    const { data: deals, error: dealsError } = await supabase
      .from("deals")
      .select("talent_name, brand_name, status")
      .ilike("talent_name", `%${talent_name}%`);

    if (dealsError) {
      console.error("Error fetching deals:", dealsError);
    }

    const existingDealBrands = new Set((deals || []).map(d => d.brand_name.toLowerCase()));
    console.log(`Found ${deals?.length || 0} existing deals, ${existingDealBrands.size} unique brands`);

    // Step 3: Group updates by brand (from metadata.brand_name)
    const brandUpdatesMap: Map<string, TalentUpdate[]> = new Map();
    const brandToOriginalName: Map<string, string> = new Map();

    for (const update of (updates || []) as TalentUpdate[]) {
      // Skip noise
      if (update.metadata?.is_noise) continue;
      
      const brandName = update.metadata?.brand_name;
      if (!brandName) continue;
      
      const brandLower = brandName.toLowerCase();
      if (!brandUpdatesMap.has(brandLower)) {
        brandUpdatesMap.set(brandLower, []);
        brandToOriginalName.set(brandLower, brandName);
      }
      brandUpdatesMap.get(brandLower)!.push(update);
    }

    console.log(`Grouped updates into ${brandUpdatesMap.size} brands`);

    // Step 4: Build deal summaries - combining existing deals + new opportunities
    const dealSummaries: DealSummary[] = [];

    // First, process existing deals from the Deal Tracker
    for (const deal of (deals || [])) {
      const brandLower = deal.brand_name.toLowerCase();
      const brandUpdates = brandUpdatesMap.get(brandLower) || [];
      
      let key_updates: string[] = [];
      let next_steps: string[] = [];

      // Try to use pre-extracted insights from metadata
      for (const update of brandUpdates) {
        if (update.metadata?.key_point) {
          key_updates.push(update.metadata.key_point);
        }
        if (update.metadata?.action_items?.length) {
          next_steps.push(...update.metadata.action_items);
        }
      }

      // If no pre-extracted data, fall back to AI summarization
      if (key_updates.length === 0 && brandUpdates.length > 0) {
        const aiSummary = await summarizeWithAI(brandUpdates, deal.talent_name, deal.brand_name, lovableApiKey);
        key_updates = aiSummary.key_updates;
        next_steps = aiSummary.next_steps;
      }

      // Dedupe and limit
      key_updates = [...new Set(key_updates)].slice(0, 5);
      next_steps = [...new Set(next_steps)].slice(0, 3);

      // Default values if empty
      if (key_updates.length === 0) key_updates = ["No recent updates"];
      if (next_steps.length === 0) next_steps = ["Review deal status"];

      dealSummaries.push({
        brand: deal.brand_name,
        status: deal.status,
        key_updates,
        next_steps,
        is_new_opportunity: false,
      });

      // Remove from map so we don't double-count
      brandUpdatesMap.delete(brandLower);
    }

    // Then, add NEW opportunities (brands found in updates but not in Deal Tracker)
    for (const [brandLower, brandUpdates] of brandUpdatesMap.entries()) {
      const originalBrandName = brandToOriginalName.get(brandLower) || brandLower;
      
      let key_updates: string[] = [];
      let next_steps: string[] = [];

      // Use pre-extracted insights
      for (const update of brandUpdates) {
        if (update.metadata?.key_point) {
          key_updates.push(update.metadata.key_point);
        }
        if (update.metadata?.action_items?.length) {
          next_steps.push(...update.metadata.action_items);
        }
      }

      // Fall back to AI if needed
      if (key_updates.length === 0 && brandUpdates.length > 0) {
        const aiSummary = await summarizeWithAI(brandUpdates, talent_name, originalBrandName, lovableApiKey);
        key_updates = aiSummary.key_updates;
        next_steps = aiSummary.next_steps;
      }

      // Dedupe and limit
      key_updates = [...new Set(key_updates)].slice(0, 5);
      next_steps = [...new Set(next_steps)].slice(0, 3);

      if (key_updates.length === 0) key_updates = ["New inquiry received"];
      if (next_steps.length === 0) next_steps = ["Add to Deal Tracker"];

      dealSummaries.push({
        brand: originalBrandName,
        status: "🆕 New Opportunity",
        key_updates,
        next_steps,
        is_new_opportunity: true,
      });
    }

    console.log(`Generated ${dealSummaries.length} deal summaries (${dealSummaries.filter(d => d.is_new_opportunity).length} new opportunities)`);

    if (dealSummaries.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `No deals or updates found for talent: ${talent_name}` 
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 5: Build markdown table
    const summariesToUse = edited_summaries && Array.isArray(edited_summaries) ? edited_summaries : dealSummaries;
    
    const now = new Date();
    const weekLabel = now.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    const weekRangeStr = `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

    let weeklyUpdate = `## 📅 Week of ${weekRangeStr}\n`;
    weeklyUpdate += `*Generated: ${weekLabel}*\n\n`;
    weeklyUpdate += `| Brand | Status | Key Updates | Next Steps |\n`;
    weeklyUpdate += `|-------|--------|-------------|------------|\n`;

    for (const summary of summariesToUse) {
      const validUpdates = (summary.key_updates || []).filter((u: string) => u && u.trim());
      const validSteps = (summary.next_steps || []).filter((s: string) => s && s.trim());
      const updatesStr = validUpdates.length > 0 ? validUpdates.map((u: string) => `• ${u}`).join(" ") : "—";
      const stepsStr = validSteps.length > 0 ? validSteps.map((s: string) => `• ${s}`).join(" ") : "—";
      weeklyUpdate += `| ${summary.brand} | ${summary.status} | ${updatesStr} | ${stepsStr} |\n`;
    }
    
    weeklyUpdate += `\n---\n\n`;

    // If preview_only, return the content without posting to Slack
    if (preview_only) {
      const newOpportunityCount = dealSummaries.filter(d => d.is_new_opportunity).length;
      return new Response(
        JSON.stringify({
          success: true,
          preview: true,
          talent_name,
          deals_count: summariesToUse.length,
          new_opportunities_count: newOpportunityCount,
          canvas_content: weeklyUpdate,
          week_range: weekRangeStr,
          deal_summaries: summariesToUse,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Weekly update content generated:\n", weeklyUpdate);

    // Step 6: Find the talent's Slack channel
    const channelName = talent_name
      .toLowerCase()
      .replace(/[.]+/g, "")
      .replace(/^dr\s+/i, "dr")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    console.log(`Looking for Slack channel: #${channelName}`);

    const channelsResponse = await fetch(
      `${SLACK_API_URL}/conversations.list?types=public_channel,private_channel&limit=500`,
      { headers: { Authorization: `Bearer ${slackBotToken}` } }
    );
    const channelsData = await channelsResponse.json();

    if (!channelsData.ok) {
      throw new Error(`Failed to list Slack channels: ${channelsData.error}`);
    }

    const targetChannel = channelsData.channels?.find(
      (ch: { name: string }) => ch.name.toLowerCase() === channelName
    );

    if (!targetChannel) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Slack channel #${channelName} not found. Make sure the bot is a member of the channel.`,
          canvas_content: weeklyUpdate,
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found channel: ${targetChannel.name} (${targetChannel.id})`);

    // Step 7: Check for existing canvas
    let canvasId: string | null = null;
    let canvasUpdated = false;
    let canvasCreated = false;

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

    // Prepend to existing canvas or create new
    if (canvasId) {
      try {
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

    // Step 8: Post notification message
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
        console.warn(`Could not post notification message: ${postData.error}`);
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
        new_opportunities_count: dealSummaries.filter(d => d.is_new_opportunity).length,
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

// Helper function to summarize updates with AI when pre-extracted data is missing
async function summarizeWithAI(
  updates: TalentUpdate[], 
  talentName: string, 
  brandName: string,
  apiKey: string
): Promise<{ key_updates: string[]; next_steps: string[] }> {
  try {
    const messagesText = updates
      .slice(0, 10)
      .map(u => `[${u.sender || "Unknown"}] ${u.subject || ""}: ${u.content?.slice(0, 500) || ""}`)
      .join("\n\n");

    const aiPrompt = `Given these messages about ${talentName}'s deal with ${brandName}:

${messagesText}

Extract:
1. key_updates: 3-5 brief bullet points (max 10 words each) summarizing important developments
2. next_steps: 1-3 action items or next steps mentioned (max 10 words each)

If no clear updates or next steps, provide reasonable placeholders.`;

    const aiResponse = await fetch(AI_GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: aiPrompt }],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_summary",
              description: "Extract key updates and next steps from messages",
              parameters: {
                type: "object",
                properties: {
                  key_updates: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "3-5 brief bullet points summarizing developments" 
                  },
                  next_steps: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "1-3 action items or next steps" 
                  },
                },
                required: ["key_updates", "next_steps"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_summary" } },
      }),
    });

    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      
      if (toolCall?.function?.arguments) {
        const parsed = JSON.parse(toolCall.function.arguments);
        return {
          key_updates: parsed.key_updates || [],
          next_steps: parsed.next_steps || [],
        };
      }
    }
  } catch (aiError) {
    console.error("AI summarization error:", aiError);
  }

  return { key_updates: [], next_steps: [] };
}
