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

const TERMINAL_STATUSES = new Set([
  "done",
  "complete",
  "completed",
  "finished",
  "success",
  "succeeded",
  "failed",
  "error",
  "no_data",
  "not_found",
  "skipped",
]);

const IN_PROGRESS_STATUSES = new Set([
  "pending",
  "in_progress",
  "researching",
  "queued",
  "processing",
  "running",
  "started",
  "submitted",
]);

function normalizedStatus(status: unknown) {
  return String(status ?? "").toLowerCase().replace(/[\s-]+/g, "_");
}

function isTerminal(status: unknown) {
  const s = normalizedStatus(status);
  if (!s) return false;
  if (TERMINAL_STATUSES.has(s)) return true;
  if (IN_PROGRESS_STATUSES.has(s)) return false;
  // Be conservative: unknown statuses are treated as still pending so we wait.
  return false;
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

function isAcceptableEmailStatus(s: unknown) {
  const v = String(s ?? "").toLowerCase();
  if (!v) return true; // unknown -> still allow
  return v === "valid" || v === "deliverable" || v === "risky" || v === "accept_all" || v === "catchall" || v === "catch_all" || v === "unknown";
}

function pickBestEmail(inner: any) {
  // Priority: explicit primary email fields, then numbered fields with valid AI status, then arrays.
  const direct = firstString(
    inner?.email,
    inner?.emailAddress,
    inner?.businessEmail,
    inner?.workEmail,
    inner?.personalEmail,
    inner?.contactEmail,
  );
  if (direct) return direct;

  // email1/email2/email3 with their *EmailAI validation, prefer "valid"
  const numbered: Array<{ email: any; ai: any; selected: any }> = [
    { email: inner?.email1, ai: inner?.email1EmailAI, selected: inner?.email1Selected },
    { email: inner?.email2, ai: inner?.email2EmailAI, selected: inner?.email2Selected },
    { email: inner?.email3, ai: inner?.email3EmailAI, selected: inner?.email3Selected },
  ];
  // selected first, then valid, then any non-empty
  const selected = numbered.find((n) => n.selected && typeof n.email === "string" && n.email.trim());
  if (selected) return selected.email.trim();
  const valid = numbered.find((n) => isAcceptableEmailStatus(n.ai) && typeof n.email === "string" && n.email.trim());
  if (valid) return valid.email.trim();
  const any = numbered.find((n) => typeof n.email === "string" && n.email.trim());
  if (any) return any.email.trim();

  // Arrays
  const emailsArr = Array.isArray(inner?.emails) ? inner.emails :
    Array.isArray(inner?.emailAddresses) ? inner.emailAddresses :
    Array.isArray(inner?.email_addresses) ? inner.email_addresses : [];
  const arrSelected = emailsArr.find((e: any) => e?.selected || e?.primary);
  if (arrSelected) return emailValue(arrSelected);
  const arrValid = emailsArr.find((e: any) => e?.deliverable === true || e?.deliverable === "valid" || e?.deliverable === "deliverable" || e?.status === "valid");
  if (arrValid) return emailValue(arrValid);
  if (emailsArr[0]) return emailValue(emailsArr[0]);
  return null;
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
      const { action: _a, ...payload } = body;
      const resp = await fetch(`${SEAMLESS_BASE}/search/contacts`, {
        method: "POST",
        headers: { "Token": SEAMLESS_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const text = await resp.text();
      let data: any;
      try { data = JSON.parse(text); } catch { data = { raw: text }; }
      if (!resp.ok) return json({ error: `Seamless ${resp.status}`, details: data }, resp.status);

      const results = data.results ?? data.data ?? data.contacts ?? data;
      const nextToken = data?.supplementalData?.nextToken ?? data?.nextToken ?? null;
      const credits = resp.headers.get("X-PublicAPI-Credits");

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
      const payload: Record<string, unknown> = {};
      if (Array.isArray(body.searchResultIds) && body.searchResultIds.length) {
        payload.searchResultIds = body.searchResultIds.slice(0, 100);
      } else if (Array.isArray(body.contacts) && body.contacts.length) {
        payload.contacts = body.contacts.slice(0, 100);
      } else {
        return json({ error: "Provide searchResultIds[] or contacts[]" }, 400);
      }

      // Allow client to pass an existing requestIds list to keep polling
      // (so we don't double-charge credits on retries).
      let requestIds: string[] = Array.isArray(body.requestIds) ? body.requestIds.filter((x: any) => typeof x === "string") : [];

      const requestedSearchIds = Array.isArray(payload.searchResultIds) ? payload.searchResultIds as string[] : [];
      let requestToSearchId = new Map<string, string>();

      if (!requestIds.length) {
        const r1 = await fetch(`${SEAMLESS_BASE}/contacts/research`, {
          method: "POST",
          headers: { "Token": SEAMLESS_API_KEY, "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const t1 = await r1.text();
        let d1: any; try { d1 = JSON.parse(t1); } catch { d1 = { raw: t1 }; }
        if (!r1.ok) return json({ error: `Seamless research ${r1.status}`, details: d1 }, r1.status);
        requestIds = d1.requestIds ?? [];
        if (!requestIds.length) return json({ error: "No requestIds returned", details: d1 }, 502);
        requestToSearchId = new Map(requestIds.map((rid, i) => [rid, requestedSearchIds[i]]));
      }

      // Poll up to ~90s. Seamless uses "researching" while still running.
      const maxIterations = Number(body.maxPollIterations ?? 45); // 45 * 2s = 90s
      let pollData: any = null;
      let allDone = false;
      for (let i = 0; i < maxIterations; i++) {
        await new Promise((res) => setTimeout(res, 2000));
        const url = `${SEAMLESS_BASE}/contacts/research/poll?requestIds=${requestIds.join(",")}`;
        const rp = await fetch(url, { headers: { "Token": SEAMLESS_API_KEY } });
        const tp = await rp.text();
        try { pollData = JSON.parse(tp); } catch { pollData = { raw: tp }; }
        if (!rp.ok) continue;
        const items = pollData?.results ?? pollData?.data ?? [];
        if (Array.isArray(items) && items.length === requestIds.length &&
            items.every((it: any) => isTerminal(it?.status))) {
          allDone = true;
          break;
        }
      }

      const rawItems = pollData?.results ?? pollData?.data ?? [];
      const normalized = (Array.isArray(rawItems) ? rawItems : []).map((r: any) => {
        const inner = r?.contact ?? r?.result?.contact ?? r?.result ?? r?.data ?? r;
        const emailsArr = Array.isArray(inner?.emails) ? inner.emails :
          Array.isArray(inner?.emailAddresses) ? inner.emailAddresses :
          Array.isArray(inner?.email_addresses) ? inner.email_addresses : [];
        const phonesArr = Array.isArray(inner?.phones) ? inner.phones :
          Array.isArray(inner?.phoneNumbers) ? inner.phoneNumbers :
          Array.isArray(inner?.phone_numbers) ? inner.phone_numbers : [];
        const bestEmail = pickBestEmail(inner);
        const bestPhone =
          firstString(inner?.phone, inner?.contactPhone1, inner?.companyPhone1, inner?.phoneNumber) ??
          phoneValue(phonesArr[0]) ??
          null;
        const requestId = r?.requestId;
        const searchResultId = r?.searchResultId ?? inner?.searchResultId ?? requestToSearchId.get(requestId);
        const terminal = isTerminal(r?.status);
        return {
          requestId,
          searchResultId,
          status: r?.status ?? null,
          message: r?.message ?? null,
          complete: terminal,
          hasEmail: Boolean(bestEmail),
          result: {
            ...inner,
            email: bestEmail,
            phone: bestPhone,
            emails: emailsArr,
            phones: phonesArr,
            searchResultId,
          },
        };
      });

      const pendingCount = normalized.filter((n) => !n.complete).length;
      const missingEmailCount = normalized.filter((n) => n.complete && !n.hasEmail).length;

      return json({
        requestIds,
        complete: allDone || (normalized.length > 0 && pendingCount === 0),
        pendingCount,
        missingEmailCount,
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
