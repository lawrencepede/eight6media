// hubspot-check-existing
// Hybrid duplicate check:
//  1) Looks up the supplied emails directly in HubSpot's contacts search
//     (chunked into batches of 100 per HubSpot's filter limit).
//  2) Looks up the supplied (firstName, lastName, company) tuples in our
//     local imported_contacts table to catch rows that haven't been
//     enriched yet (no email available to query HubSpot with).
// Returns:
//  - emailsInHubSpot: string[] of lowercased emails present in HubSpot
//  - localMatches: Array<{ key: string }> where key is `${first}|${last}|${company}`
//                  lowercased — frontend uses this to flag rows by identity.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const HS_GATEWAY = "https://connector-gateway.lovable.dev/hubspot";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function hs(path: string, init: RequestInit, lk: string, hk: string) {
  const resp = await fetch(`${HS_GATEWAY}${path}`, {
    ...init,
    headers: {
      "Authorization": `Bearer ${lk}`,
      "X-Connection-Api-Key": hk,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const text = await resp.text();
  let data: any; try { data = JSON.parse(text); } catch { data = { raw: text }; }
  return { ok: resp.ok, status: resp.status, data };
}

function nameKey(first?: string, last?: string, company?: string) {
  const f = (first ?? "").trim().toLowerCase();
  const l = (last ?? "").trim().toLowerCase();
  const c = (company ?? "").trim().toLowerCase();
  if (!f && !l) return "";
  return `${f}|${l}|${c}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const HUBSPOT_API_KEY = Deno.env.get("HUBSPOT_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "LOVABLE_API_KEY not configured" }, 500);
    if (!HUBSPOT_API_KEY) return json({ error: "HUBSPOT_API_KEY not configured" }, 500);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);

    const body = await req.json();
    const emails: string[] = Array.isArray(body?.emails)
      ? body.emails.map((e: any) => String(e ?? "").trim().toLowerCase()).filter(Boolean)
      : [];
    const identities: Array<{ firstName?: string; lastName?: string; company?: string }> =
      Array.isArray(body?.identities) ? body.identities : [];

    // 1) HubSpot email search — chunked. HubSpot's search endpoint allows
    // up to 100 values in an IN filter and 200 results per page; we never
    // exceed 100 so a single page is enough per batch.
    const emailsInHubSpot = new Set<string>();
    const uniqueEmails = Array.from(new Set(emails));
    const CHUNK = 100;
    for (let i = 0; i < uniqueEmails.length; i += CHUNK) {
      const batch = uniqueEmails.slice(i, i + CHUNK);
      if (!batch.length) continue;
      const resp = await hs("/crm/v3/objects/contacts/search", {
        method: "POST",
        body: JSON.stringify({
          filterGroups: [{
            filters: [{
              propertyName: "email",
              operator: "IN",
              values: batch,
            }],
          }],
          properties: ["email"],
          limit: 100,
        }),
      }, LOVABLE_API_KEY, HUBSPOT_API_KEY);
      if (!resp.ok) {
        console.error("HubSpot search failed", resp.status, resp.data);
        continue;
      }
      for (const r of (resp.data?.results ?? [])) {
        const e = String(r?.properties?.email ?? "").trim().toLowerCase();
        if (e) emailsInHubSpot.add(e);
      }
    }

    // 2) Local fallback for rows that don't have an email yet — match by
    // (first, last, company) tuple against imported_contacts.
    const localKeys = new Set<string>();
    if (identities.length) {
      // Pull a generously-scoped set of recent imports and intersect in code.
      // This avoids OR-blowup queries against Postgres for every identity.
      const { data: prior } = await supabase
        .from("imported_contacts")
        .select("full_name, company, email")
        .not("hubspot_contact_id", "is", null)
        .order("imported_at", { ascending: false })
        .limit(2000);
      const priorKeys = new Set<string>();
      const priorEmailKeys = new Set<string>();
      for (const row of prior ?? []) {
        const fullName = String((row as any).full_name ?? "").trim();
        const [first, ...rest] = fullName.split(/\s+/);
        const last = rest.join(" ");
        const company = String((row as any).company ?? "");
        const k = nameKey(first, last, company);
        if (k) priorKeys.add(k);
        // Also a name-only key (no company) as a softer fallback
        const kNoCo = nameKey(first, last, "");
        if (kNoCo) priorEmailKeys.add(kNoCo);
      }
      for (const id of identities) {
        const k = nameKey(id.firstName, id.lastName, id.company);
        const kNoCo = nameKey(id.firstName, id.lastName, "");
        if (k && priorKeys.has(k)) localKeys.add(k);
        else if (kNoCo && priorEmailKeys.has(kNoCo)) localKeys.add(k || kNoCo);
      }
    }

    return json({
      ok: true,
      emailsInHubSpot: Array.from(emailsInHubSpot),
      localMatches: Array.from(localKeys).map((key) => ({ key })),
    });
  } catch (e: any) {
    console.error("hubspot-check-existing error:", e);
    return json({ error: e?.message ?? "Unknown error" }, 500);
  }
});
