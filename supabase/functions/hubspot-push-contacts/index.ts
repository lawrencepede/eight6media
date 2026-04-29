// hubspot-push-contacts
// Accepts an array of normalized contacts and pushes them to HubSpot.
// - dedupe by email: update if exists, else create
// - find-or-create company by domain, associate to contact
// - log each push to imported_contacts
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

interface InputContact {
  seamless_contact_id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  title?: string;
  company?: string;
  companyDomain?: string;
  phone?: string;
  linkedinUrl?: string;
  city?: string;
  state?: string;
  country?: string;
  raw?: unknown;
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const HUBSPOT_API_KEY = Deno.env.get("HUBSPOT_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "LOVABLE_API_KEY not configured" }, 500);
    if (!HUBSPOT_API_KEY) return json({ error: "HUBSPOT_API_KEY not configured (connect HubSpot)" }, 500);

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
    const contacts: InputContact[] = body?.contacts ?? [];
    const ownerId: string | undefined = body?.ownerId;
    const lifecycleStage: string | undefined = body?.lifecycleStage; // e.g. "lead"
    const associateCompany: boolean = body?.associateCompany !== false;

    if (!Array.isArray(contacts) || !contacts.length) {
      return json({ error: "No contacts provided" }, 400);
    }

    const results: any[] = [];

    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    for (const c of contacts) {
      try {
        const email = (c.email ?? "").trim().toLowerCase();
        const firstname = c.firstName ?? (c.fullName?.split(" ")[0] ?? "");
        const lastname = c.lastName ?? (c.fullName?.split(" ").slice(1).join(" ") ?? "");

        if (!email || !EMAIL_RE.test(email)) {
          results.push({
            email: email || null,
            ok: false,
            skipped: true,
            error: email
              ? "Email returned by Seamless was not a valid address; not pushed to HubSpot"
              : "Missing email after enrichment; contact was not pushed to HubSpot",
            name: c.fullName ?? `${firstname} ${lastname}`.trim() ?? null,
            company: c.company ?? null,
          });
          continue;
        }

        const properties: Record<string, string> = {
          ...(email && { email }),
          ...(firstname && { firstname }),
          ...(lastname && { lastname }),
          ...(c.title && { jobtitle: c.title }),
          ...(c.company && { company: c.company }),
          ...(c.phone && { phone: c.phone }),
          ...(c.linkedinUrl && { hs_linkedin_url: c.linkedinUrl }),
          ...(c.city && { city: c.city }),
          ...(c.state && { state: c.state }),
          ...(c.country && { country: c.country }),
          hs_lead_status: "NEW",
          ...(lifecycleStage && { lifecyclestage: lifecycleStage }),
          ...(ownerId && { hubspot_owner_id: ownerId }),
        };

        // 1) Try to find existing contact by email
        let hubspotContactId: string | null = null;
        let action: "created" | "updated" = "created";

        if (email) {
          const search = await hs("/crm/v3/objects/contacts/search", {
            method: "POST",
            body: JSON.stringify({
              filterGroups: [{ filters: [{ propertyName: "email", operator: "EQ", value: email }] }],
              properties: ["email"],
              limit: 1,
            }),
          }, LOVABLE_API_KEY, HUBSPOT_API_KEY);

          const found = search.data?.results?.[0];
          if (found?.id) {
            hubspotContactId = found.id;
            action = "updated";
            await hs(`/crm/v3/objects/contacts/${hubspotContactId}`, {
              method: "PATCH",
              body: JSON.stringify({ properties }),
            }, LOVABLE_API_KEY, HUBSPOT_API_KEY);
          }
        }

        if (!hubspotContactId) {
          const create = await hs("/crm/v3/objects/contacts", {
            method: "POST",
            body: JSON.stringify({ properties }),
          }, LOVABLE_API_KEY, HUBSPOT_API_KEY);
          if (!create.ok) {
            results.push({ email, ok: false, error: `Create failed [${create.status}]`, details: create.data });
            continue;
          }
          hubspotContactId = create.data?.id ?? null;
        }

        // 2) Optionally associate company
        let companyId: string | null = null;
        if (associateCompany && c.companyDomain && hubspotContactId) {
          const domain = c.companyDomain.toLowerCase().trim();
          const compSearch = await hs("/crm/v3/objects/companies/search", {
            method: "POST",
            body: JSON.stringify({
              filterGroups: [{ filters: [{ propertyName: "domain", operator: "EQ", value: domain }] }],
              properties: ["domain", "name"],
              limit: 1,
            }),
          }, LOVABLE_API_KEY, HUBSPOT_API_KEY);

          companyId = compSearch.data?.results?.[0]?.id ?? null;

          if (!companyId) {
            const compCreate = await hs("/crm/v3/objects/companies", {
              method: "POST",
              body: JSON.stringify({
                properties: { domain, name: c.company ?? domain },
              }),
            }, LOVABLE_API_KEY, HUBSPOT_API_KEY);
            companyId = compCreate.data?.id ?? null;
          }

          if (companyId) {
            // v4 association: contact_to_company default type
            await hs(
              `/crm/v4/objects/contacts/${hubspotContactId}/associations/default/companies/${companyId}`,
              { method: "PUT", body: JSON.stringify([]) },
              LOVABLE_API_KEY, HUBSPOT_API_KEY,
            );
          }
        }

        // 3) Log to DB
        const { error: dbErr } = await supabase.from("imported_contacts").upsert({
          seamless_contact_id: c.seamless_contact_id ?? null,
          hubspot_contact_id: hubspotContactId,
          email: email || null,
          full_name: c.fullName ?? `${firstname} ${lastname}`.trim() ?? null,
          company: c.company ?? null,
          title: c.title ?? null,
          imported_by: user.id,
          status: action,
          raw_seamless_payload: c.raw ?? c,
          raw_hubspot_response: { contactId: hubspotContactId, companyId, action },
        }, { onConflict: "seamless_contact_id" });

        if (dbErr) console.error("DB log error:", dbErr);

        results.push({
          email,
          ok: true,
          action,
          hubspotContactId,
          companyId,
        });
      } catch (e: any) {
        console.error("Push error for contact:", e);
        results.push({ email: c.email, ok: false, error: e?.message ?? "unknown" });
      }
    }

    return json({
      ok: true,
      summary: {
        total: results.length,
        succeeded: results.filter((r) => r.ok).length,
        skipped: results.filter((r) => !r.ok && r.skipped).length,
        failed: results.filter((r) => !r.ok && !r.skipped).length,
      },
      results,
    });
  } catch (e: any) {
    console.error("hubspot-push-contacts error:", e);
    return json({ error: e?.message ?? "Unknown error" }, 500);
  }
});
