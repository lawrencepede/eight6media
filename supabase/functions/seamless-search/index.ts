// Seamless.ai search/enrich proxy
// - action: "search"  -> POST /search/contacts (cheap, no credits per result)
// - action: "enrich"  -> POST /contacts/research + poll /contacts/research/poll
//   (1 credit per contact)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SEAMLESS_BASE = "https://api.seamless.ai/api/client/v1";

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

const IN_PROGRESS_STATUSES = new Set([
  "pending",
  "in_progress",
  "researching",
  "queued",
  "processing",
  "running",
  "started",
]);

function normalizedStatus(status: unknown) {
  return String(status ?? "").toLowerCase().replace(/[\s-]+/g, "_");
}

function isInProgress(status: unknown) {
  return IN_PROGRESS_STATUSES.has(normalizedStatus(status));
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function emailValue(item: any) {
  return firstString(item?.email, item?.emailAddress, item?.email_address, item?.address, item?.value);
}

function phoneValue(item: any) {
  return firstString(item?.phone, item?.number, item?.phoneNumber, item?.phone_number, item?.value);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const SEAMLESS_API_KEY = Deno.env.get("SEAMLESS_API_KEY");
    if (!SEAMLESS_API_KEY) return json({ error: "SEAMLESS_API_KEY not configured" }, 500);

    // Auth check
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
    const action = body?.action ?? "search";

    if (action === "search") {
      // Strip our own action field; pass everything else through.
      const { action: _a, ...payload } = body;
      const resp = await fetch(`${SEAMLESS_BASE}/search/contacts`, {
        method: "POST",
        headers: {
          "Token": SEAMLESS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const text = await resp.text();
      let data: any;
      try { data = JSON.parse(text); } catch { data = { raw: text }; }
      if (!resp.ok) {
        return json({ error: `Seamless ${resp.status}`, details: data }, resp.status);
      }

      // Normalize: try to surface results regardless of wrapper shape
      const results = data.results ?? data.data ?? data.contacts ?? data;
      const nextToken = data?.supplementalData?.nextToken ?? data?.nextToken ?? null;
      const credits = resp.headers.get("X-PublicAPI-Credits");

      // Flag duplicates
      const ids = (Array.isArray(results) ? results : [])
        .map((r: any) => r?.searchResultId ?? r?.id)
        .filter(Boolean);
      let imported = new Set<string>();
      if (ids.length) {
        const { data: existing } = await supabase
          .from("imported_contacts")
          .select("seamless_contact_id")
          .in("seamless_contact_id", ids);
        imported = new Set((existing ?? []).map((r: any) => r.seamless_contact_id));
      }

      const enriched = (Array.isArray(results) ? results : []).map((r: any) => ({
        ...r,
        _alreadyImported: imported.has(r?.searchResultId ?? r?.id),
      }));

      return json({ results: enriched, nextToken, credits, raw: data });
    }

    if (action === "enrich") {
      // Body shape: { action:"enrich", searchResultIds?: string[], contacts?: [...] }
      const payload: Record<string, unknown> = {};
      if (Array.isArray(body.searchResultIds) && body.searchResultIds.length) {
        payload.searchResultIds = body.searchResultIds.slice(0, 100);
      } else if (Array.isArray(body.contacts) && body.contacts.length) {
        payload.contacts = body.contacts.slice(0, 100);
      } else {
        return json({ error: "Provide searchResultIds[] or contacts[]" }, 400);
      }

      const r1 = await fetch(`${SEAMLESS_BASE}/contacts/research`, {
        method: "POST",
        headers: { "Token": SEAMLESS_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const t1 = await r1.text();
      let d1: any; try { d1 = JSON.parse(t1); } catch { d1 = { raw: t1 }; }
      if (!r1.ok) return json({ error: `Seamless research ${r1.status}`, details: d1 }, r1.status);

      const requestIds: string[] = d1.requestIds ?? [];
      if (!requestIds.length) return json({ error: "No requestIds returned", details: d1 }, 502);
      const requestedSearchIds = Array.isArray(payload.searchResultIds) ? payload.searchResultIds as string[] : [];
      const requestToSearchId = new Map(requestIds.map((requestId, index) => [requestId, requestedSearchIds[index]]));

      // Poll up to ~60s. Seamless uses "researching" while enrichment is still running.
      let pollData: any = null;
      for (let i = 0; i < 30; i++) {
        await new Promise((res) => setTimeout(res, 2000));
        const url = `${SEAMLESS_BASE}/contacts/research/poll?requestIds=${requestIds.join(",")}`;
        const rp = await fetch(url, { headers: { "Token": SEAMLESS_API_KEY } });
        const tp = await rp.text();
        try { pollData = JSON.parse(tp); } catch { pollData = { raw: tp }; }
        if (!rp.ok) continue;
        const items = pollData?.results ?? pollData?.data ?? [];
        const allDone = Array.isArray(items) && items.length > 0 &&
          items.every((it: any) => it?.status && !isInProgress(it.status));
        if (allDone) break;
      }

      // Normalize each enriched item so the client can find email/phone reliably.
      const rawItems = pollData?.results ?? pollData?.data ?? [];
      const normalized = (Array.isArray(rawItems) ? rawItems : []).map((r: any) => {
        const inner = r?.result?.contact ?? r?.result ?? r?.contact ?? r?.data ?? r;
        // Seamless returns emails as arrays of objects like { email, type, deliverable }
        const emailsArr = Array.isArray(inner?.emails) ? inner.emails :
          Array.isArray(inner?.emailAddresses) ? inner.emailAddresses :
          Array.isArray(inner?.email_addresses) ? inner.email_addresses : [];
        const phonesArr = Array.isArray(inner?.phones) ? inner.phones :
          Array.isArray(inner?.phoneNumbers) ? inner.phoneNumbers :
          Array.isArray(inner?.phone_numbers) ? inner.phone_numbers : [];
        const bestEmail =
          firstString(inner?.email, inner?.email1, inner?.emailAddress, inner?.businessEmail, inner?.workEmail, inner?.personalEmail, inner?.contactEmail) ??
          emailValue(emailsArr.find((e: any) => e?.deliverable === true || e?.deliverable === "valid" || e?.deliverable === "deliverable" || e?.status === "valid")) ??
          emailValue(emailsArr[0]) ??
          null;
        const bestPhone =
          firstString(inner?.phone, inner?.contactPhone1, inner?.companyPhone1, inner?.phoneNumber) ??
          phoneValue(phonesArr[0]) ??
          null;
        const requestId = r?.requestId;
        return {
          requestId,
          searchResultId: r?.searchResultId ?? inner?.searchResultId ?? requestToSearchId.get(requestId),
          status: r?.status,
          complete: !isInProgress(r?.status),
          result: {
            ...inner,
            email: bestEmail,
            phone: bestPhone,
            emails: emailsArr,
            phones: phonesArr,
          },
        };
      });
      return json({
        requestIds,
        complete: normalized.length > 0 && normalized.every((item: any) => item.complete),
        pendingCount: normalized.filter((item: any) => !item.complete).length,
        results: normalized,
        raw: pollData,
      });
    }

    return json({ error: `Unknown action: ${action}` }, 400);
  } catch (e: any) {
    console.error("seamless-search error:", e);
    return json({ error: e?.message ?? "Unknown error" }, 500);
  }
});
