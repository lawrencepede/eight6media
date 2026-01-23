import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get untagged updates (where talent_name is null)
    const { data: updates, error: fetchError } = await supabase
      .from("talent_updates")
      .select("id, sender, subject, content, metadata")
      .is("talent_name", null)
      .order("received_at", { ascending: false })
      .limit(20);

    if (fetchError) {
      console.error("Failed to fetch updates:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch updates" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!updates || updates.length === 0) {
      console.log("No untagged updates found");
      return new Response(
        JSON.stringify({ success: true, message: "No updates to tag", tagged: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing ${updates.length} untagged updates`);

    let taggedCount = 0;

    for (const update of updates) {
      const channelName = update.metadata?.channel_name || "";
      
      // Build context for AI
      const messageContext = `
Sender: ${update.sender || "Unknown"}
Subject/Channel: ${update.subject || channelName || "N/A"}
Content: ${update.content || ""}
`.trim();

      const prompt = `Analyze this message from a talent management agency. Extract:
1. talent_name: The name of a content creator/influencer being discussed (if any)
2. brand_name: The company/brand being discussed for potential partnership (if any)
3. is_noise: Whether this is marketing spam, newsletter, or irrelevant (true/false)

Message:
${messageContext}

Rules:
- talent_name should be a person's name (e.g., "Jenn Miller", "Dr. Nick", "Michael James")
- brand_name should be a company name (e.g., "Nike", "Koala Eco", "Instant Hydration")
- If channel name contains talent info (like #jenn-miller), use that as a hint
- Set is_noise=true for: marketing emails, newsletters, sales pitches, automated notifications
- Return null for talent_name or brand_name if not clearly mentioned`;

      try {
        const response = await fetch(AI_GATEWAY_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: "You extract structured data from messages. Always respond with valid JSON." },
              { role: "user", content: prompt },
            ],
            tools: [
              {
                type: "function",
                function: {
                  name: "tag_message",
                  description: "Tag a message with talent name, brand name, and noise flag",
                  parameters: {
                    type: "object",
                    properties: {
                      talent_name: { type: "string", description: "Name of the talent/creator mentioned, or null" },
                      brand_name: { type: "string", description: "Name of the brand/company mentioned, or null" },
                      is_noise: { type: "boolean", description: "True if this is marketing spam or irrelevant" },
                    },
                    required: ["is_noise"],
                  },
                },
              },
            ],
            tool_choice: { type: "function", function: { name: "tag_message" } },
          }),
        });

        if (!response.ok) {
          if (response.status === 429) {
            console.error("Rate limited, stopping processing");
            break;
          }
          console.error(`AI error for update ${update.id}:`, response.status);
          continue;
        }

        const aiResult = await response.json();
        const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
        
        if (toolCall?.function?.arguments) {
          const extracted = JSON.parse(toolCall.function.arguments);
          console.log(`Update ${update.id}: talent=${extracted.talent_name}, brand=${extracted.brand_name}, noise=${extracted.is_noise}`);

          // Update the record - use "NONE" for null to mark as processed
          const { error: updateError } = await supabase
            .from("talent_updates")
            .update({
              talent_name: extracted.talent_name || "NONE",
              metadata: {
                ...update.metadata,
                brand_name: extracted.brand_name || null,
                is_noise: extracted.is_noise || false,
              },
            })
            .eq("id", update.id);

          if (updateError) {
            console.error(`Failed to update ${update.id}:`, updateError);
          } else {
            taggedCount++;
          }
        }
      } catch (err) {
        console.error(`Error processing update ${update.id}:`, err);
      }
    }

    console.log(`Tagged ${taggedCount} updates`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Tagged ${taggedCount} of ${updates.length} updates`,
        tagged: taggedCount,
        total: updates.length,
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
