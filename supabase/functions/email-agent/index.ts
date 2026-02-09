import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, history } = await req.json();
    if (!query) {
      return new Response(JSON.stringify({ error: "Missing query" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Create supabase client with service role to read data
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch recent talent_updates (last 30 days, up to 500)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [updatesRes, dealsRes] = await Promise.all([
      supabase
        .from("talent_updates")
        .select("source, subject, sender, content, talent_name, received_at")
        .gte("received_at", thirtyDaysAgo.toISOString())
        .order("received_at", { ascending: false })
        .limit(500),
      supabase
        .from("deals")
        .select("talent_name, brand_name, status, notes, updated_at")
        .order("updated_at", { ascending: false })
        .limit(300),
    ]);

    const updates = updatesRes.data || [];
    const deals = dealsRes.data || [];

    const dataContext = `
## Available Data Context

### Recent Communications (${updates.length} items, last 30 days)
${updates.map((u) => `- [${u.source}] ${u.received_at} | From: ${u.sender || "unknown"} | Subject: ${u.subject || "none"} | Talent: ${u.talent_name || "untagged"}\n  Content preview: ${(u.content || "").slice(0, 200)}`).join("\n")}

### Deals (${deals.length} total)
${deals.map((d) => `- ${d.talent_name} × ${d.brand_name} | Status: ${d.status} | Notes: ${(d.notes || "none").slice(0, 150)} | Updated: ${d.updated_at}`).join("\n")}
`;

    const systemPrompt = `You are an AI assistant for a talent management team. You have access to their synced emails, Slack messages, and deal data.

Answer questions about their communications and deals accurately based on the data provided. If the data doesn't contain enough information to answer, say so clearly.

Be concise and actionable. Use bullet points and bold text for readability. When listing items, include relevant dates and context.

Today's date is ${new Date().toISOString().split("T")[0]}.

${dataContext}`;

    // Build messages with optional conversation history
    const messages: Array<{ role: string; content: string }> = [
      { role: "system", content: systemPrompt },
    ];
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        messages.push({ role: msg.role, content: msg.content });
      }
    }
    messages.push({ role: "user", content: query });

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages,
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits in workspace settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("email-agent error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
