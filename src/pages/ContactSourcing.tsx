import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import PasswordGate from "@/components/PasswordGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Search, Sparkles, Upload, ExternalLink, LogOut, User, Download } from "lucide-react";

// Pull a bare domain out of any string fragment: bare URLs, markdown links,
// HTML anchors, angle-bracket-wrapped URLs, or tracking redirect wrappers.
function extractDomain(s: string): string {
  if (!s) return s;
  let v = s.trim();
  if (!v) return v;

  const hrefMatch = v.match(/href\s*=\s*["']([^"']+)["']/i);
  if (hrefMatch) v = hrefMatch[1];

  const mdMatch = v.match(/\]\(([^)]+)\)/);
  if (mdMatch) v = mdMatch[1];

  const urlMatch = v.match(/https?:\/\/[^\s<>"')]+/i);
  if (urlMatch) v = urlMatch[0];

  try {
    const u = new URL(v.startsWith("http") ? v : `https://${v}`);
    const wrapped =
      u.searchParams.get("q") ||
      u.searchParams.get("url") ||
      u.searchParams.get("u");
    if (wrapped && /^https?:\/\//i.test(wrapped)) {
      v = wrapped;
    }
    const finalUrl = new URL(v.startsWith("http") ? v : `https://${v}`);
    return finalUrl.hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return v
      .replace(/^<+|>+$/g, "")
      .replace(/^https?:\/\//i, "")
      .replace(/^www\./i, "")
      .replace(/\/.*$/, "")
      .toLowerCase();
  }
}

// Normalize an arbitrary blob of pasted/typed text into newline-separated
// bare domains. Splits on newlines, commas, semicolons, and tabs.
function normalizeDomainBlob(raw: string): string {
  const tokens = raw
    .split(/[\n\r,;\t]+/)
    .map((t) => extractDomain(t))
    .filter((t, i, arr) => (t === "" ? i === arr.length - 1 : true));
  return tokens.join("\n");
}

// Extract hyperlinked URLs from an HTML clipboard payload (e.g. when copying
// a linked cell from Google Sheets). Walks table/list/block elements in order
// so multi-cell pastes preserve order; falls back to anchors then text.
function domainsFromHtmlClipboard(html: string): string {
  try {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const cells = Array.from(doc.querySelectorAll("td, th, li, p, div"));
    const tokens: string[] = [];

    if (cells.length) {
      for (const cell of cells) {
        const anchor = cell.querySelector("a[href]");
        const href = anchor?.getAttribute("href")?.trim();
        const text = (cell.textContent ?? "").trim();
        if (href) tokens.push(href);
        else if (text) tokens.push(text);
      }
    } else {
      const anchors = Array.from(doc.querySelectorAll("a[href]"));
      if (anchors.length) {
        for (const a of anchors) {
          const href = a.getAttribute("href");
          if (href) tokens.push(href);
        }
      } else {
        tokens.push(doc.body?.textContent ?? "");
      }
    }

    return normalizeDomainBlob(tokens.join("\n"));
  } catch {
    return "";
  }
}

interface SearchResult {
  searchResultId?: string;
  id?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  company?: string;
  companyDomain?: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  lIProfileUrl?: string;
  city?: string;
  state?: string;
  country?: string;
  _alreadyImported?: boolean;
  _inHubSpot?: boolean; // true if HubSpot already has this contact
  _enrichmentStatus?: "pending" | "researching" | "done" | "no_email" | "imported" | "skipped" | "failed";
  _enrichmentMessage?: string;
  [k: string]: any;
}

const ContactSourcing = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Search filters
  const [companyName, setCompanyName] = useState("");
  const [companyDomain, setCompanyDomain] = useState("");
  const [jobTitle, setJobTitle] = useState("marketing, influencer, creator, social media");
  const [seniority, setSeniority] = useState("");
  const [contactName, setContactName] = useState("");
  const [country, setCountry] = useState("");
  const [industry, setIndustry] = useState("");
  const [limit, setLimit] = useState(200);

  // Enrich-by-identity
  const [enrichEmail, setEnrichEmail] = useState("");
  const [enrichLinkedIn, setEnrichLinkedIn] = useState("");

  // Push options
  const [associateCompany, setAssociateCompany] = useState(true);
  const [lifecycleStage, setLifecycleStage] = useState("lead");

  // Results state
  const [loading, setLoading] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [allResults, setAllResults] = useState<SearchResult[]>([]); // every row Seamless returned
  const [results, setResults] = useState<SearchResult[]>([]);       // capped/visible rows
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [credits, setCredits] = useState<string | null>(null);
  const [perBrandCap, setPerBrandCap] = useState(5);
  const [expandedBrands, setExpandedBrands] = useState<Set<string>>(new Set()); // brands user clicked "show all" for
  const [loadingMoreBrand, setLoadingMoreBrand] = useState<string | null>(null);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth", { replace: true });
  };

  const idOf = (r: SearchResult) => r.searchResultId ?? r.id ?? r.email ?? Math.random().toString();

  // Group results by brand. Use normalized domain when present, else company name.
  const brandKeyOf = (r: SearchResult): string => {
    const dom = (r.companyDomain ?? "").toString().trim().toLowerCase().replace(/^www\./, "");
    if (dom) return dom;
    return (r.company ?? "").toString().trim().toLowerCase() || "(unknown)";
  };
  const brandLabelOf = (r: SearchResult): string =>
    (r.company?.toString().trim() || r.companyDomain?.toString().trim() || "(unknown brand)");

  // Titles that strongly suggest a contact is NOT a relevant marketing/creator
  // partnerships person. Used to push obvious mismatches to the bottom when the
  // user is searching for marketing-style roles.
  const NEGATIVE_TITLE_TERMS = [
    "sales", "account executive", "account manager", "engineer", "engineering",
    "developer", "software", "data scientist", "analyst", "finance", "accounting",
    "controller", "legal", "counsel", "recruiter", "talent acquisition", "hr ",
    "people ops", "customer success", "support", "operations manager",
    "supply chain", "logistics", "warehouse", "buyer", "merchandiser",
    "product manager", "product owner", "designer ", "ux", "ui ", "it ",
    "security", "cto", "cfo", "coo", "ceo", "founder",
  ];

  const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const wordBoundaryRegex = (term: string) =>
    new RegExp(`(?:^|[^a-z0-9])${escapeRegex(term)}(?:[^a-z0-9]|$)`, "i");

  // Score a row's relevance to the user's search filters. Higher = more relevant.
  // Title-term word-boundary matches are weighted heaviest; multi-term overlap
  // (e.g. "influencer marketing manager" matching both "influencer" and
  // "marketing") is rewarded. Obvious off-target functions are penalized.
  const scoreRow = (r: SearchResult, titleTerms: string[], seniorityTerms: string[]): number => {
    let score = 0;
    const t = (r.title ?? "").toString().toLowerCase().trim();
    if (!t) return 0;

    // Title-term matches with word boundaries (so "marketing" doesn't match
    // "remarketing-adjacent" weirdness, and short terms like "pr" don't match
    // "product").
    let titleMatches = 0;
    for (const term of titleTerms) {
      if (!term) continue;
      if (wordBoundaryRegex(term).test(t)) {
        score += 15;
        titleMatches += 1;
        // Bonus if the term appears early in the title (more likely the
        // primary function vs. a trailing modifier).
        const idx = t.indexOf(term);
        if (idx >= 0 && idx <= 20) score += 3;
      }
    }
    // Reward titles that hit multiple search terms (e.g. "influencer marketing").
    if (titleMatches >= 2) score += 10 * (titleMatches - 1);

    // Exact phrase bonus: if the user typed a multi-word term and it appears
    // verbatim, that's a very strong signal.
    for (const term of titleTerms) {
      if (term && term.includes(" ") && t.includes(term)) score += 8;
    }

    // Seniority is a soft signal — used as a tiebreaker, not a primary ranker.
    for (const term of seniorityTerms) {
      if (term && wordBoundaryRegex(term).test(t)) score += 4;
    }

    // Penalize titles that are clearly in unrelated functions, but only when
    // the user is searching for something specific (titleTerms present) AND
    // we didn't already match a positive title term.
    if (titleTerms.length > 0 && titleMatches === 0) {
      for (const neg of NEGATIVE_TITLE_TERMS) {
        if (t.includes(neg)) {
          score -= 12;
          break;
        }
      }
    }

    // Light tiebreakers
    if (r.email) score += 2;
    if (r.lIProfileUrl ?? r.linkedinUrl) score += 1;
    return score;
  };

  // Take the full result set and keep only the top N per brand (unless that
  // brand has been expanded by the user). Preserves Seamless's original order
  // among rows with equal score.
  const applyPerBrandCap = (
    rows: SearchResult[],
    cap: number,
    expanded: Set<string>,
    titleTerms: string[],
    seniorityTerms: string[],
  ): SearchResult[] => {
    const groups = new Map<string, { row: SearchResult; idx: number; score: number }[]>();
    rows.forEach((row, idx) => {
      const k = brandKeyOf(row);
      const arr = groups.get(k) ?? [];
      arr.push({ row, idx, score: scoreRow(row, titleTerms, seniorityTerms) });
      groups.set(k, arr);
    });
    const out: SearchResult[] = [];
    const seenBrandOrder: string[] = [];
    for (const row of rows) {
      const k = brandKeyOf(row);
      if (!seenBrandOrder.includes(k)) seenBrandOrder.push(k);
    }
    for (const k of seenBrandOrder) {
      const arr = groups.get(k) ?? [];
      arr.sort((a, b) => b.score - a.score || a.idx - b.idx);
      const slice = expanded.has(k) ? arr : arr.slice(0, cap);
      // When expanded, restore Seamless's original ordering for the full list.
      // When capped, keep the top rows in relevancy-score order so the most
      // relevant contact appears first.
      if (expanded.has(k)) slice.sort((a, b) => a.idx - b.idx);
      for (const item of slice) out.push(item.row);
    }
    return out;
  };

  const extractEmail = (contact: any) => {
    const emailsArr = Array.isArray(contact?.emails) ? contact.emails : [];
    return (
      contact?.email ||
      contact?.email1 ||
      contact?.emailAddress ||
      contact?.businessEmail ||
      contact?.workEmail ||
      contact?.personalEmail ||
      emailsArr.find((e: any) => e?.deliverable === true || e?.deliverable === "valid" || e?.status === "valid")?.email ||
      emailsArr[0]?.email ||
      ""
    );
  };

  const enrichContacts = async (body: Record<string, unknown>) => {
    let latest: any = null;
    let requestIds: string[] | undefined = Array.isArray(body.requestIds) ? body.requestIds as string[] : undefined;
    // Up to 6 attempts. Each call to the edge function polls Seamless for ~90s,
    // so this gives Seamless several minutes to finish researching.
    for (let attempt = 0; attempt < 6; attempt++) {
      const callBody = { ...body, ...(requestIds ? { requestIds } : {}) };
      const { data, error } = await supabase.functions.invoke("seamless-search", { body: callBody });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      latest = data;
      if (Array.isArray(data?.requestIds)) requestIds = data.requestIds;
      if (data?.complete === true) break;
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
    return latest;
  };

  // Build the same name-key the edge function uses for local fallback matching
  const identityKey = (r: SearchResult): string => {
    const f = (r.firstName ?? "").trim().toLowerCase();
    const l = (r.lastName ?? "").trim().toLowerCase();
    const c = (r.company ?? "").trim().toLowerCase();
    if (!f && !l) return "";
    return `${f}|${l}|${c}`;
  };

  // Ask the edge function which of these rows already exist in HubSpot
  // (by email) or in our imported_contacts table (by name+company).
  const checkHubSpotForRows = async (rows: SearchResult[]) => {
    if (!rows.length) return;
    const emails = rows
      .map((r) => (r.email ?? "").toString().trim().toLowerCase())
      .filter(Boolean);
    const identities = rows
      .filter((r) => !r.email)
      .map((r) => ({
        firstName: r.firstName ?? "",
        lastName: r.lastName ?? "",
        company: r.company ?? "",
      }))
      .filter((i) => i.firstName || i.lastName);

    if (!emails.length && !identities.length) return;

    try {
      const { data, error } = await supabase.functions.invoke("hubspot-check-existing", {
        body: { emails, identities },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const hsEmails = new Set<string>(
        (data?.emailsInHubSpot ?? []).map((e: string) => e.toLowerCase()),
      );
      const localKeys = new Set<string>(
        (data?.localMatches ?? []).map((m: any) => m?.key).filter(Boolean),
      );

      const flag = (rs: SearchResult[]) =>
        rs.map((r) => {
          const e = (r.email ?? "").toString().trim().toLowerCase();
          const k = identityKey(r);
          const hit = (e && hsEmails.has(e)) || (!e && k && localKeys.has(k));
          return hit ? { ...r, _inHubSpot: true, _alreadyImported: true } : r;
        });
      setAllResults((prev) => flag(prev));
      setResults((prev) => flag(prev));

      const hitCount = (hsEmails.size + localKeys.size);
      if (hitCount > 0) {
        toast({
          title: `${hitCount} already in HubSpot`,
          description: "Marked rows so you can skip enriching them.",
        });
      }
    } catch (e: any) {
      console.error("HubSpot check failed:", e);
      // Non-fatal — just don't mark rows
    }
  };

  const toggle = (id: string) => {
    setSelected((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === results.length) setSelected(new Set());
    else setSelected(new Set(results.map(idOf)));
  };

  const splitMulti = (s: string) => s.split(/[,\n\r\t;]+/).map(x => x.trim()).filter(Boolean);

  const runSearch = async () => {
    setLoading(true);
    setAllResults([]);
    setResults([]);
    setSelected(new Set());
    setExpandedBrands(new Set());
    try {
      const domains = splitMulti(companyDomain);
      const names = splitMulti(companyName);
      // One search per brand so a single big brand can't crowd out the rest.
      // Each brand gets up to perBrandCap rows. Domains and names are queried
      // separately; if both are present we union them.
      const brandQueries: Array<{ label: string; payloadKey: "companyDomain" | "companyName"; value: string }> = [
        ...domains.map((d) => ({ label: d, payloadKey: "companyDomain" as const, value: d })),
        ...names.map((n) => ({ label: n, payloadKey: "companyName" as const, value: n })),
      ];

      const sharedFilters: Record<string, unknown> = {};
      if (jobTitle.trim()) sharedFilters.jobTitle = splitMulti(jobTitle);
      if (seniority.trim()) sharedFilters.seniority = splitMulti(seniority);
      if (country.trim()) sharedFilters.contactCountry = splitMulti(country);
      if (industry.trim()) sharedFilters.industry = splitMulti(industry);
      if (contactName.trim()) sharedFilters.contactName = splitMulti(contactName);

      // If the user didn't specify any brand, fall back to one combined search
      // honoring the global limit.
      if (brandQueries.length === 0) {
        const payload: Record<string, unknown> = {
          ...sharedFilters,
          action: "search",
          limit: Math.min(50, limit),
        };
        const { data, error } = await supabase.functions.invoke("seamless-search", { body: payload });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        const all: SearchResult[] = data.results ?? [];
        const titleTerms = splitMulti(jobTitle).map((s) => s.toLowerCase());
        const seniorityTerms = splitMulti(seniority).map((s) => s.toLowerCase());
        const capped = applyPerBrandCap(all, perBrandCap, new Set(), titleTerms, seniorityTerms);
        setAllResults(all);
        setResults(capped);
        setCredits(data.credits ?? null);
        toast({ title: "Search complete", description: `${all.length} contacts found.` });
        return;
      }

      // Fan out: one search per brand, capped at perBrandCap each. Run with
      // concurrency to keep wall-clock time reasonable.
      const all: SearchResult[] = [];
      let lastCredits: string | null = null;
      const emptyBrands: string[] = [];
      const CONCURRENCY = 4;

      // Fetch a wider candidate pool per brand than perBrandCap so our local
      // relevancy ranker has something to choose from. Without this, Seamless
      // returns its own top-N (typically seniority-ordered) and our scoring
      // can't reorder beyond that small set.
      const candidatePoolPerBrand = Math.min(50, Math.max(perBrandCap * 5, 25));

      const runOne = async (q: { label: string; payloadKey: string; value: string }) => {
        const payload: Record<string, unknown> = {
          ...sharedFilters,
          action: "search",
          limit: candidatePoolPerBrand,
          [q.payloadKey]: [q.value],
        };
        const { data, error } = await supabase.functions.invoke("seamless-search", { body: payload });
        if (error) throw error;
        if (data?.error) throw new Error(`${q.label}: ${data.error}`);
        const rows: SearchResult[] = data.results ?? [];
        if (data.credits) lastCredits = data.credits;
        if (rows.length === 0) emptyBrands.push(q.label);
        return rows;
      };

      for (let i = 0; i < brandQueries.length; i += CONCURRENCY) {
        const batch = brandQueries.slice(i, i + CONCURRENCY);
        const results = await Promise.allSettled(batch.map(runOne));
        for (const r of results) {
          if (r.status === "fulfilled") all.push(...r.value);
          else console.error("brand search failed:", r.reason);
        }
      }

      // Dedupe by searchResultId in case the same contact appears under both a
      // domain query and a name query.
      const seen = new Set<string>();
      const deduped = all.filter((r) => {
        const key = String(r.searchResultId ?? r.id ?? r.email ?? Math.random());
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      const titleTerms = splitMulti(jobTitle).map((s) => s.toLowerCase());
      const seniorityTerms = splitMulti(seniority).map((s) => s.toLowerCase());
      const capped = applyPerBrandCap(deduped, perBrandCap, new Set(), titleTerms, seniorityTerms);
      setAllResults(deduped);
      setResults(capped);
      setCredits(lastCredits);

      const brandCount = new Set(deduped.map(brandKeyOf)).size;
      toast({
        title: "Search complete",
        description: `${deduped.length} contacts across ${brandCount} of ${brandQueries.length} brand(s). Top ${perBrandCap} per brand.${
          emptyBrands.length ? ` No results for: ${emptyBrands.slice(0, 5).join(", ")}${emptyBrands.length > 5 ? "…" : ""}` : ""
        }`,
      });
    } catch (e: any) {
      toast({ title: "Search failed", description: e?.message ?? "Unknown error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Re-run a Seamless search scoped to one brand to fetch additional contacts
  // for it. Merges new rows into allResults and expands that brand.
  const loadMoreForBrand = async (brandKey: string, brandLabel: string) => {
    setLoadingMoreBrand(brandKey);
    try {
      // Find a representative row for the brand to determine domain vs name lookup
      const sample = allResults.find((r) => brandKeyOf(r) === brandKey);
      const payload: Record<string, unknown> = { action: "search", limit: 50 };
      const dom = sample?.companyDomain?.toString().trim();
      if (dom) payload.companyDomain = [dom];
      else payload.companyName = [brandLabel];
      // Preserve job title / seniority filters so "more" matches the same intent
      if (jobTitle.trim()) payload.jobTitle = splitMulti(jobTitle);
      if (seniority.trim()) payload.seniority = splitMulti(seniority);
      if (country.trim()) payload.contactCountry = splitMulti(country);
      if (industry.trim()) payload.industry = splitMulti(industry);

      const { data, error } = await supabase.functions.invoke("seamless-search", { body: payload });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const incoming: SearchResult[] = data.results ?? [];
      // Dedupe by searchResultId/id, then merge
      const existingIds = new Set(allResults.map(idOf));
      const additions = incoming.filter(
        (r) => brandKeyOf(r) === brandKey && !existingIds.has(idOf(r)),
      );
      const merged = [...allResults, ...additions];
      const nextExpanded = new Set(expandedBrands);
      nextExpanded.add(brandKey);
      const titleTerms = splitMulti(jobTitle).map((s) => s.toLowerCase());
      const seniorityTerms = splitMulti(seniority).map((s) => s.toLowerCase());
      setAllResults(merged);
      setExpandedBrands(nextExpanded);
      setResults(applyPerBrandCap(merged, perBrandCap, nextExpanded, titleTerms, seniorityTerms));
      toast({
        title: `+${additions.length} more for ${brandLabel}`,
        description: additions.length
          ? `Now showing all ${incoming.filter((r) => brandKeyOf(r) === brandKey).length + (allResults.filter((r) => brandKeyOf(r) === brandKey).length - incoming.filter((r) => brandKeyOf(r) === brandKey).length)} contacts for this brand.`
          : "Seamless didn't return any new contacts for this brand.",
      });
    } catch (e: any) {
      toast({ title: "Couldn't load more", description: e?.message ?? "Unknown error", variant: "destructive" });
    } finally {
      setLoadingMoreBrand(null);
    }
  };

  const toggleBrandExpanded = (brandKey: string) => {
    const next = new Set(expandedBrands);
    if (next.has(brandKey)) next.delete(brandKey);
    else next.add(brandKey);
    setExpandedBrands(next);
    const titleTerms = splitMulti(jobTitle).map((s) => s.toLowerCase());
    const seniorityTerms = splitMulti(seniority).map((s) => s.toLowerCase());
    setResults(applyPerBrandCap(allResults, perBrandCap, next, titleTerms, seniorityTerms));
  };


  const runEnrich = async () => {
    if (!enrichEmail.trim() && !enrichLinkedIn.trim()) {
      toast({ title: "Enter an email or LinkedIn URL", variant: "destructive" });
      return;
    }
    setLoading(true);
    setResults([]);
    setSelected(new Set());
    try {
      const contact: Record<string, string> = {};
      if (enrichEmail.trim()) contact.email = enrichEmail.trim();
      if (enrichLinkedIn.trim()) contact.liProfileUrl = enrichLinkedIn.trim();

      const data = await enrichContacts({ action: "enrich", contacts: [contact] });

      const items = (data.results ?? []).flatMap((r: any) => r?.result ? [r.result] : (r?.contact ? [r.contact] : [r]));
      setResults(items);
      // auto-select the enriched result so user can push immediately
      setSelected(new Set(items.map(idOf)));
      toast({ title: "Enrichment complete", description: `${items.length} contact(s) returned.` });
    } catch (e: any) {
      toast({ title: "Enrichment failed", description: e?.message ?? "Unknown error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const updateRowMeta = (id: string, patch: Partial<SearchResult>) => {
    setResults((prev) => prev.map((r) => (idOf(r) === id ? { ...r, ...patch } : r)));
  };

  // Enrich selected rows without pushing to HubSpot. Pulls emails (1 credit each)
  // and writes them back into the table so the user can review before pushing.
  const enrichSelectedOnly = async () => {
    const picks = results.filter((r) => selected.has(idOf(r)));
    if (!picks.length) {
      toast({ title: "Select at least one contact", variant: "destructive" });
      return;
    }
    const needEnrichment = picks.filter((p) => !p.email && (p.searchResultId || p.id));
    if (!needEnrichment.length) {
      toast({ title: "Nothing to enrich", description: "All selected contacts already have emails." });
      return;
    }
    setPushing(true);
    try {
      toast({
        title: "Enriching…",
        description: `Pulling full details for ${needEnrichment.length} contact(s) (1 credit each). This can take up to a few minutes.`,
      });
      for (const p of needEnrichment) {
        updateRowMeta(idOf(p), { _enrichmentStatus: "researching" });
      }
      const ids = needEnrichment.map((p) => (p.searchResultId ?? p.id) as string);
      const enrich = await enrichContacts({ action: "enrich", searchResultIds: ids });

      const enrichedById = new Map<string, any>();
      for (const r of enrich?.results ?? []) {
        const sid = r?.searchResultId ?? r?.result?.searchResultId;
        if (sid) enrichedById.set(String(sid), r);
      }

      let withEmail = 0;
      let stillResearching = 0;
      let noEmail = 0;
      for (const p of needEnrichment) {
        const sid = String(p.searchResultId ?? p.id ?? "");
        const enr = sid ? enrichedById.get(sid) : null;
        if (!enr || !enr.complete) {
          stillResearching += 1;
          updateRowMeta(idOf(p), {
            _enrichmentStatus: "researching",
            _enrichmentMessage: enr?.status ?? "Awaiting Seamless",
          });
          continue;
        }
        const merged: any = { ...p, ...(enr.result ?? {}) };
        const bestEmail = (enr.result?.email ?? extractEmail(merged) ?? "").toString().trim();
        if (!bestEmail) {
          noEmail += 1;
          updateRowMeta(idOf(p), {
            _enrichmentStatus: "no_email",
            _enrichmentMessage: enr.message ?? "Seamless returned no email",
          });
          continue;
        }
        withEmail += 1;
        updateRowMeta(idOf(p), {
          email: bestEmail,
          firstName: merged.firstName ?? p.firstName,
          lastName: merged.lastName ?? p.lastName,
          fullName: merged.fullName ?? merged.name ?? p.fullName,
          title: merged.title ?? p.title,
          company: merged.company ?? p.company,
          companyDomain: merged.companyDomain ?? merged.website ?? merged.emailDomain ?? p.companyDomain,
          phone: merged.contactPhone1 ?? merged.companyPhone1 ?? merged.phone ?? p.phone,
          lIProfileUrl: merged.lIProfileUrl ?? merged.linkedinUrl ?? p.lIProfileUrl,
          _enrichmentStatus: "done",
        });
      }
      toast({
        title: "Enrichment complete",
        description: `${withEmail} email(s) revealed${noEmail ? `, ${noEmail} no email` : ""}${stillResearching ? `, ${stillResearching} still researching` : ""}. Review then push to HubSpot.`,
      });
    } catch (e: any) {
      toast({ title: "Enrichment failed", description: e?.message ?? "Unknown error", variant: "destructive" });
    } finally {
      setPushing(false);
    }
  };

  // Export selected rows as CSV (opens cleanly in Excel + Google Sheets)
  const exportSelected = () => {
    const picks = results.filter((r) => selected.has(idOf(r)));
    if (!picks.length) {
      toast({ title: "Select at least one contact", variant: "destructive" });
      return;
    }
    const pickStr = (...vals: any[]) => {
      for (const v of vals) if (typeof v === "string" && v.trim()) return v.trim();
      return "";
    };
    const nameOf = (r: SearchResult) => {
      const inner: any = (r as any).contact ?? (r as any).result ?? r;
      const full = pickStr(
        r.fullName, (r as any).full_name, (r as any).name, (r as any).displayName, (r as any).display_name,
        inner?.fullName, inner?.full_name, inner?.name, inner?.displayName, inner?.display_name,
      );
      if (full) return full;
      const first = pickStr(r.firstName, (r as any).first_name, (r as any).givenName, inner?.firstName, inner?.first_name, inner?.givenName);
      const last = pickStr(r.lastName, (r as any).last_name, (r as any).familyName, (r as any).surname, inner?.lastName, inner?.last_name, inner?.familyName, inner?.surname);
      return `${first} ${last}`.trim();
    };
    const headers = ["Name", "Title", "Company", "Company Domain", "Email", "Phone", "LinkedIn", "City", "State", "Country"];
    const escape = (v: any) => {
      const s = v == null ? "" : String(v);
      return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [headers.join(",")];
    for (const r of picks) {
      lines.push([
        nameOf(r),
        r.title ?? "",
        r.company ?? "",
        r.companyDomain ?? "",
        r.email ?? "",
        r.phone ?? "",
        r.lIProfileUrl ?? r.linkedinUrl ?? "",
        r.city ?? "",
        r.state ?? "",
        r.country ?? "",
      ].map(escape).join(","));
    }
    // Prepend BOM so Excel detects UTF-8 correctly
    const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `seamless-contacts-${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: `${picks.length} contact(s) downloaded as CSV.` });
  };

  const pushSelected = async () => {
    const allPicks = results.filter((r) => selected.has(idOf(r)));
    if (!allPicks.length) {
      toast({ title: "Select at least one contact", variant: "destructive" });
      return;
    }

    // Skip rows that we already imported in a previous run. The backend will
    // also dedupe by email, but skipping client-side avoids wasting credits
    // on re-enrichment and gives the user a clear message.
    const alreadyImported = allPicks.filter((p) => p._alreadyImported);
    const picks = allPicks.filter((p) => !p._alreadyImported);

    if (alreadyImported.length) {
      toast({
        title: `${alreadyImported.length} already imported — skipping`,
        description: "These contacts were imported in a previous run. They won't be pushed again.",
      });
      for (const p of alreadyImported) {
        updateRowMeta(idOf(p), { _enrichmentStatus: "imported" });
      }
    }

    if (!picks.length) {
      toast({ title: "Nothing new to push", description: "All selected contacts were already imported." });
      return;
    }

    const needEnrichment = picks.filter((p) => !p.email && (p.searchResultId || p.id));
    setPushing(true);
    try {
      // Map: searchResultId -> { result, complete, hasEmail, status, message }
      const enrichedById = new Map<string, any>();

      if (needEnrichment.length) {
        toast({
          title: "Enriching first…",
          description: `Pulling full details for ${needEnrichment.length} contact(s) (1 credit each). This can take up to a few minutes.`,
        });
        // Mark rows as researching in the table
        for (const p of needEnrichment) {
          updateRowMeta(idOf(p), { _enrichmentStatus: "researching" });
        }
        const ids = needEnrichment.map((p) => (p.searchResultId ?? p.id) as string);
        const enrich = await enrichContacts({ action: "enrich", searchResultIds: ids });

        for (const r of enrich?.results ?? []) {
          const sid = r?.searchResultId ?? r?.result?.searchResultId;
          if (sid) enrichedById.set(String(sid), r);
        }
      }

      const completed: any[] = [];
      const stillResearching: SearchResult[] = [];
      const noEmail: SearchResult[] = [];

      for (const p of picks) {
        const sid = String(p.searchResultId ?? p.id ?? "");
        const enr = sid ? enrichedById.get(sid) : null;

        // Already had email from a prior enrich - push directly
        if (p.email && !enr) {
          completed.push({
            seamless_contact_id: sid || p.email,
            email: p.email,
            firstName: p.firstName,
            lastName: p.lastName,
            fullName: p.fullName,
            title: p.title,
            company: p.company,
            companyDomain: p.companyDomain,
            phone: p.phone,
            linkedinUrl: p.lIProfileUrl ?? p.linkedinUrl,
            city: p.city,
            state: p.state,
            country: p.country,
            raw: p,
          });
          continue;
        }

        if (!enr) {
          // Couldn't enrich at all
          stillResearching.push(p);
          updateRowMeta(idOf(p), { _enrichmentStatus: "researching", _enrichmentMessage: "Awaiting Seamless" });
          continue;
        }

        if (!enr.complete) {
          stillResearching.push(p);
          updateRowMeta(idOf(p), {
            _enrichmentStatus: "researching",
            _enrichmentMessage: enr.status ?? "researching",
          });
          continue;
        }

        const merged: any = { ...p, ...(enr.result ?? {}) };
        const bestEmail = (enr.result?.email ?? extractEmail(merged) ?? "").toString().trim();

        if (!bestEmail) {
          noEmail.push(p);
          updateRowMeta(idOf(p), {
            _enrichmentStatus: "no_email",
            _enrichmentMessage: enr.message ?? "Seamless returned no email",
          });
          continue;
        }

        updateRowMeta(idOf(p), { email: bestEmail, _enrichmentStatus: "done" });

        completed.push({
          seamless_contact_id: String(merged.searchResultId ?? sid ?? merged.contactId ?? bestEmail),
          email: bestEmail,
          firstName: merged.firstName,
          lastName: merged.lastName,
          fullName: merged.fullName ?? merged.name,
          title: merged.title,
          company: merged.company,
          companyDomain: merged.companyDomain ?? merged.website ?? merged.emailDomain,
          phone: merged.contactPhone1 ?? merged.companyPhone1 ?? merged.phone,
          linkedinUrl: merged.lIProfileUrl ?? merged.linkedinUrl,
          city: merged.contactLocation?.city ?? merged.city,
          state: merged.contactLocation?.stateAbbr ?? merged.contactLocation?.state ?? merged.state,
          country: merged.contactLocation?.country ?? merged.country,
          raw: merged,
        });
      }

      if (stillResearching.length) {
        toast({
          title: `${stillResearching.length} still researching`,
          description: "Seamless hasn't finished these yet. Wait a minute and click Push again — they'll resume without using extra credits.",
        });
      }
      if (noEmail.length) {
        toast({
          title: `${noEmail.length} finished with no email`,
          description: "Seamless completed research but didn't find an email for these. They were not imported.",
        });
      }

      if (!completed.length) {
        if (!stillResearching.length && !noEmail.length) {
          toast({
            title: "Nothing to push",
            description: "No selected contacts produced an email.",
            variant: "destructive",
          });
        }
        return;
      }

      const { data: push, error: pushErr } = await supabase.functions.invoke("hubspot-push-contacts", {
        body: { contacts: completed, associateCompany, lifecycleStage },
      });
      if (pushErr) throw pushErr;
      if (push?.error) throw new Error(push.error);

      // Mark imported rows
      const okEmails = new Set<string>(
        (push.results ?? []).filter((r: any) => r.ok).map((r: any) => String(r.email ?? "").toLowerCase()),
      );
      setResults((prev) => prev.map((r) =>
        okEmails.has(String(r.email ?? "").toLowerCase())
          ? { ...r, _alreadyImported: true, _enrichmentStatus: "imported" }
          : r,
      ));

      const failed = (push.results ?? []).filter((r: any) => !r.ok && !r.skipped);
      const skipped = (push.results ?? []).filter((r: any) => r.skipped);
      toast({
        title: "Push complete",
        description: `${push.summary?.succeeded ?? 0} imported, ${push.summary?.skipped ?? skipped.length} skipped (no email), ${push.summary?.failed ?? failed.length} failed.${
          failed.length ? ` First error: ${failed[0]?.error ?? "unknown"}` : ""
        }`,
      });
      setSelected(new Set());
    } catch (e: any) {
      toast({ title: "Push failed", description: e?.message ?? "Unknown error", variant: "destructive" });
    } finally {
      setPushing(false);
    }
  };

  return (
    <PasswordGate>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/console">
                <Button variant="ghost" size="sm" className="font-sans">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Console
                </Button>
              </Link>
              <Link to="/" className="font-display text-2xl tracking-tight">
                <span className="text-primary">EIGHT</span>
                <span className="text-accent">-SIX</span>
              </Link>
            </div>
            <h1 className="font-sans text-lg font-semibold text-primary">Contact Sourcing</h1>
            <div className="flex items-center gap-4">
              {user && (
                <>
                  <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span className="font-sans">{user.email}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleSignOut} className="font-sans">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-10 max-w-6xl">
          <div className="mb-8">
            <h2 className="font-display text-4xl text-primary mb-2">Seamless.ai → HubSpot</h2>
            <p className="text-muted-foreground font-sans">
              Search Seamless contacts and push selected results into HubSpot.
              {credits && <span className="ml-3 text-accent">Credits remaining: {credits}</span>}
            </p>
          </div>

          <Tabs defaultValue="search" className="mb-8">
            <TabsList>
              <TabsTrigger value="search"><Search className="w-4 h-4 mr-2" />Search</TabsTrigger>
              <TabsTrigger value="enrich"><Sparkles className="w-4 h-4 mr-2" />Enrich one</TabsTrigger>
            </TabsList>

            <TabsContent value="search">
              <Card className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg">Search settings</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCompanyName("");
                      setCompanyDomain("");
                      setJobTitle("");
                      setSeniority("");
                      setContactName("");
                      setCountry("");
                      setIndustry("");
                    }}
                  >
                    Clear all fields
                  </Button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Company name(s) — one per line, or comma separated</Label>
                    <Textarea
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder={"Acme\nGlobex\nInitech"}
                      rows={4}
                      className="font-mono text-sm"
                    />
                  </div>
                  <div>
                    <Label>Company domain(s) — paste URLs, linked Sheets cells, markdown, or HTML anchors</Label>
                    <Textarea
                      value={companyDomain}
                      onPaste={(e) => {
                        // When pasting a hyperlinked cell from Google Sheets, the
                        // visible text is just the label ("Epetome") but the
                        // clipboard also carries text/html with the underlying
                        // <a href>. Prefer the HTML payload when present so we
                        // capture the actual URL instead of the label.
                        const html = e.clipboardData?.getData("text/html");
                        if (html && /<a\s[^>]*href=/i.test(html)) {
                          e.preventDefault();
                          const target = e.currentTarget;
                          const start = target.selectionStart ?? companyDomain.length;
                          const end = target.selectionEnd ?? companyDomain.length;
                          const extracted = domainsFromHtmlClipboard(html);
                          const next =
                            companyDomain.slice(0, start) +
                            extracted +
                            companyDomain.slice(end);
                          setCompanyDomain(normalizeDomainBlob(next));
                        }
                        // Otherwise fall through to the default paste, which
                        // triggers onChange and gets normalized below.
                      }}
                      onChange={(e) => setCompanyDomain(normalizeDomainBlob(e.target.value))}
                      placeholder={"acme.com\nhttps://initech.com\n[Epetome](https://epetome.com)\nor paste a linked cell from Google Sheets"}
                      rows={4}
                      className="font-mono text-sm"
                    />
                  </div>
                  <div>
                    <Label>Job title(s)</Label>
                    <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="VP Marketing, Brand Manager" />
                  </div>
                  <div>
                    <Label>Seniority</Label>
                    <Input value={seniority} onChange={(e) => setSeniority(e.target.value)} placeholder="C-Level, VP, Director" />
                  </div>
                  <div>
                    <Label>Contact name(s)</Label>
                    <Input
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Jane Doe, John Smith"
                    />
                  </div>
                  <div>
                    <Label>Country</Label>
                    <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="United States" />
                  </div>
                  <div>
                    <Label>Industry</Label>
                    <Input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Cosmetics, Apparel & Fashion" />
                  </div>
                  <div>
                    <Label>Result limit (max 500)</Label>
                    <Input type="number" value={limit} min={1} max={500}
                      onChange={(e) => setLimit(Math.max(1, Math.min(500, Number(e.target.value) || 200)))} />
                    <p className="text-xs text-muted-foreground mt-1">
                      Seamless returns 50 per page; we auto-paginate up to this number.
                    </p>
                  </div>
                  <div>
                    <Label>Max contacts per brand</Label>
                    <Input type="number" value={perBrandCap} min={1} max={50}
                      onChange={(e) => {
                        const next = Math.max(1, Math.min(50, Number(e.target.value) || 5));
                        setPerBrandCap(next);
                        const titleTerms = splitMulti(jobTitle).map((s) => s.toLowerCase());
                        const seniorityTerms = splitMulti(seniority).map((s) => s.toLowerCase());
                        setResults(applyPerBrandCap(allResults, next, expandedBrands, titleTerms, seniorityTerms));
                      }} />
                    <p className="text-xs text-muted-foreground mt-1">
                      Caps each brand at the top N most relevant rows so a single brand can't dominate.
                    </p>
                  </div>
                </div>
                <Button onClick={runSearch} disabled={loading} className="font-sans">
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                  Search Seamless
                </Button>
                <p className="text-xs text-muted-foreground">
                  Search itself is free. Credits are only spent when you push selected contacts and we pull
                  their full enrichment details.
                </p>
              </Card>
            </TabsContent>

            <TabsContent value="enrich">
              <Card className="p-6 space-y-4">
                <div>
                  <Label>Email</Label>
                  <Input value={enrichEmail} onChange={(e) => setEnrichEmail(e.target.value)} placeholder="jane@acme.com" />
                </div>
                <div>
                  <Label>or LinkedIn profile URL</Label>
                  <Input value={enrichLinkedIn} onChange={(e) => setEnrichLinkedIn(e.target.value)} placeholder="https://linkedin.com/in/janesmith" />
                </div>
                <Button onClick={runEnrich} disabled={loading} className="font-sans">
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  Enrich (1 credit)
                </Button>
              </Card>
            </TabsContent>
          </Tabs>

          {results.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <Checkbox checked={selected.size === results.length} onCheckedChange={toggleAll} />
                  <span className="text-sm text-muted-foreground font-sans">
                    {selected.size} of {results.length} selected
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <label className="flex items-center gap-2 text-sm font-sans">
                    <Checkbox checked={associateCompany} onCheckedChange={(v) => setAssociateCompany(!!v)} />
                    Auto-associate company
                  </label>
                  <Input
                    value={lifecycleStage}
                    onChange={(e) => setLifecycleStage(e.target.value)}
                    placeholder="lifecycle stage (e.g. lead)"
                    className="w-48"
                  />
                  <Button
                    onClick={enrichSelectedOnly}
                    disabled={pushing || selected.size === 0}
                    variant="outline"
                    className="font-sans"
                  >
                    {pushing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    Enrich {selected.size} (reveal email)
                  </Button>
                  <Button
                    onClick={exportSelected}
                    disabled={selected.size === 0}
                    variant="outline"
                    className="font-sans"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export {selected.size} to CSV
                  </Button>
                  <Button onClick={pushSelected} disabled={pushing || selected.size === 0} className="font-sans">
                    {pushing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                    Push {selected.size} to HubSpot
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10"></TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>LinkedIn</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      // Build the brand-grouped render order from the visible
                      // (capped) results. We also need the per-brand totals from
                      // the full result set to show "5 of 23" etc.
                      const groupOrder: string[] = [];
                      const groupRows = new Map<string, SearchResult[]>();
                      for (const r of results) {
                        const k = brandKeyOf(r);
                        if (!groupRows.has(k)) {
                          groupRows.set(k, []);
                          groupOrder.push(k);
                        }
                        groupRows.get(k)!.push(r);
                      }
                      const allTotals = new Map<string, number>();
                      for (const r of allResults) {
                        const k = brandKeyOf(r);
                        allTotals.set(k, (allTotals.get(k) ?? 0) + 1);
                      }

                      return groupOrder.flatMap((brandKey) => {
                        const rows = groupRows.get(brandKey) ?? [];
                        const label = brandLabelOf(rows[0]);
                        const totalForBrand = allTotals.get(brandKey) ?? rows.length;
                        const isExpanded = expandedBrands.has(brandKey);
                        const hasHidden = totalForBrand > rows.length;
                        const isLoadingMore = loadingMoreBrand === brandKey;

                        const headerRow = (
                          <TableRow key={`brand-${brandKey}`} className="bg-muted/40 hover:bg-muted/40">
                            <TableCell colSpan={7} className="py-2">
                              <div className="flex items-center justify-between gap-3 flex-wrap">
                                <div className="font-sans text-sm font-semibold text-primary">
                                  {label}{" "}
                                  <span className="text-muted-foreground font-normal">
                                    — showing {rows.length} of {totalForBrand}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {hasHidden && !isExpanded && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="font-sans h-7"
                                      onClick={() => toggleBrandExpanded(brandKey)}
                                    >
                                      Show all {totalForBrand}
                                    </Button>
                                  )}
                                  {isExpanded && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="font-sans h-7"
                                      onClick={() => toggleBrandExpanded(brandKey)}
                                    >
                                      Collapse to top {perBrandCap}
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    className="font-sans h-7"
                                    disabled={isLoadingMore}
                                    onClick={() => loadMoreForBrand(brandKey, label)}
                                  >
                                    {isLoadingMore
                                      ? <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                      : <Search className="w-3 h-3 mr-1" />}
                                    Find more for this brand
                                  </Button>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        );

                        const pickStr = (...vals: any[]) => {
                          for (const v of vals) {
                            if (typeof v === "string" && v.trim()) return v.trim();
                          }
                          return "";
                        };
                        const displayName = (r: SearchResult) => {
                          const inner: any = (r as any).contact ?? (r as any).result ?? r;
                          const full = pickStr(
                            r.fullName, (r as any).full_name, (r as any).name, (r as any).displayName, (r as any).display_name,
                            inner?.fullName, inner?.full_name, inner?.name, inner?.displayName, inner?.display_name,
                          );
                          if (full) return full;
                          const first = pickStr(r.firstName, (r as any).first_name, (r as any).givenName, inner?.firstName, inner?.first_name, inner?.givenName);
                          const last = pickStr(r.lastName, (r as any).last_name, (r as any).familyName, (r as any).surname, inner?.lastName, inner?.last_name, inner?.familyName, inner?.surname);
                          return `${first} ${last}`.trim();
                        };

                        const dataRows = rows.map((r) => {
                          const id = idOf(r);
                          const li = r.lIProfileUrl ?? r.linkedinUrl;
                          const name = displayName(r);
                          return (
                            <TableRow key={id}>
                              <TableCell>
                                <Checkbox checked={selected.has(id)} onCheckedChange={() => toggle(id)} />
                              </TableCell>
                              <TableCell className="font-sans font-medium">
                                {name || "—"}
                              </TableCell>
                              <TableCell className="text-sm">{r.title ?? "—"}</TableCell>
                              <TableCell className="text-sm">{r.company ?? "—"}</TableCell>
                              <TableCell className="text-sm">{r.email ?? <span className="text-muted-foreground italic">(enrich to reveal)</span>}</TableCell>
                              <TableCell>
                                {li ? (
                                  <a href={li} target="_blank" rel="noreferrer" className="inline-flex items-center text-accent hover:underline">
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                ) : "—"}
                              </TableCell>
                              <TableCell>
                                {r._enrichmentStatus === "researching" && (
                                  <Badge variant="outline" title={r._enrichmentMessage ?? ""}>Researching…</Badge>
                                )}
                                {r._enrichmentStatus === "no_email" && (
                                  <Badge variant="destructive" title={r._enrichmentMessage ?? ""}>No email</Badge>
                                )}
                                {r._enrichmentStatus === "imported" && (
                                  <Badge variant="secondary">Imported</Badge>
                                )}
                                {!r._enrichmentStatus && (
                                  r._alreadyImported
                                    ? <Badge variant="secondary">Imported</Badge>
                                    : <Badge>New</Badge>
                                )}
                                {r._enrichmentStatus === "done" && !r._alreadyImported && <Badge>Ready</Badge>}
                              </TableCell>
                            </TableRow>
                          );
                        });

                        return [headerRow, ...dataRows];
                      });
                    })()}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
        </div>
      </div>
    </PasswordGate>
  );
};

export default ContactSourcing;
