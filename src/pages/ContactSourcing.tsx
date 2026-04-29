import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import PasswordGate from "@/components/PasswordGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Search, Sparkles, Upload, ExternalLink, LogOut, User } from "lucide-react";

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
  [k: string]: any;
}

const ContactSourcing = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Search filters
  const [companyName, setCompanyName] = useState("");
  const [companyDomain, setCompanyDomain] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [seniority, setSeniority] = useState("");
  const [country, setCountry] = useState("");
  const [industry, setIndustry] = useState("");
  const [limit, setLimit] = useState(25);

  // Enrich-by-identity
  const [enrichEmail, setEnrichEmail] = useState("");
  const [enrichLinkedIn, setEnrichLinkedIn] = useState("");

  // Push options
  const [associateCompany, setAssociateCompany] = useState(true);
  const [lifecycleStage, setLifecycleStage] = useState("lead");

  // Results state
  const [loading, setLoading] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [credits, setCredits] = useState<string | null>(null);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth", { replace: true });
  };

  const idOf = (r: SearchResult) => r.searchResultId ?? r.id ?? r.email ?? Math.random().toString();

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

  const runSearch = async () => {
    setLoading(true);
    setResults([]);
    setSelected(new Set());
    try {
      const payload: Record<string, unknown> = {
        action: "search",
        limit,
      };
      if (companyName.trim()) payload.companyName = companyName.split(",").map(s => s.trim()).filter(Boolean);
      if (companyDomain.trim()) payload.companyDomain = companyDomain.split(",").map(s => s.trim()).filter(Boolean);
      if (jobTitle.trim()) payload.jobTitle = jobTitle.split(",").map(s => s.trim()).filter(Boolean);
      if (seniority.trim()) payload.seniority = seniority.split(",").map(s => s.trim()).filter(Boolean);
      if (country.trim()) payload.contactCountry = country.split(",").map(s => s.trim()).filter(Boolean);
      if (industry.trim()) payload.industry = industry.split(",").map(s => s.trim()).filter(Boolean);

      const { data, error } = await supabase.functions.invoke("seamless-search", { body: payload });
      if (error) throw error;
      if (data?.error) throw new Error(data.error + (data.details ? `: ${JSON.stringify(data.details).slice(0, 300)}` : ""));

      setResults(data.results ?? []);
      setCredits(data.credits ?? null);
      toast({ title: "Search complete", description: `${data.results?.length ?? 0} contacts found.` });
    } catch (e: any) {
      toast({ title: "Search failed", description: e?.message ?? "Unknown error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
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

      const { data, error } = await supabase.functions.invoke("seamless-search", {
        body: { action: "enrich", contacts: [contact] },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

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

  const pushSelected = async () => {
    const picks = results.filter((r) => selected.has(idOf(r)));
    if (!picks.length) {
      toast({ title: "Select at least one contact", variant: "destructive" });
      return;
    }

    // Search results are lightweight; they need enrichment first to get email/phone.
    // If the row already has an email, push directly. Otherwise enrich first.
    const needEnrichment = picks.filter((p) => !p.email && (p.searchResultId || p.id));
    setPushing(true);
    try {
      let enrichedById = new Map<string, any>();

      if (needEnrichment.length) {
        toast({
          title: "Enriching first…",
          description: `Pulling full details for ${needEnrichment.length} contact(s) (1 credit each).`,
        });
        const ids = needEnrichment.map((p) => (p.searchResultId ?? p.id) as string);
        const { data: enrich, error: enErr } = await supabase.functions.invoke("seamless-search", {
          body: { action: "enrich", searchResultIds: ids },
        });
        if (enErr) throw enErr;
        if (enrich?.error) throw new Error(enrich.error);

        const items = (enrich.results ?? []).flatMap((r: any) => r?.result ? [{ key: r.requestId ?? r.searchResultId, ...r.result }] : []);
        // Best-effort: index by every plausible id in the result
        for (const it of items) {
          for (const k of [it.key, it.searchResultId, it.id, it.contactId].filter(Boolean)) {
            enrichedById.set(String(k), it);
          }
        }
      }

      // Build push payload, merging enriched data when available.
      const contacts = picks.map((p) => {
        const enr = enrichedById.get(String(p.searchResultId ?? p.id)) ?? {};
        const merged = { ...p, ...enr };
        return {
          seamless_contact_id: String(merged.searchResultId ?? merged.id ?? merged.contactId ?? merged.email ?? ""),
          email: merged.email ?? merged.email1 ?? "",
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
        };
      });

      const { data: push, error: pushErr } = await supabase.functions.invoke("hubspot-push-contacts", {
        body: { contacts, associateCompany, lifecycleStage },
      });
      if (pushErr) throw pushErr;
      if (push?.error) throw new Error(push.error);

      toast({
        title: "Push complete",
        description: `${push.summary?.succeeded ?? 0} succeeded, ${push.summary?.failed ?? 0} failed.`,
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
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Company name(s) — comma separated</Label>
                    <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Acme, Globex" />
                  </div>
                  <div>
                    <Label>Company domain(s)</Label>
                    <Input value={companyDomain} onChange={(e) => setCompanyDomain(e.target.value)} placeholder="acme.com, globex.com" />
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
                    <Label>Country</Label>
                    <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="United States" />
                  </div>
                  <div>
                    <Label>Industry</Label>
                    <Input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Cosmetics, Apparel & Fashion" />
                  </div>
                  <div>
                    <Label>Result limit (max 50)</Label>
                    <Input type="number" value={limit} min={1} max={50}
                      onChange={(e) => setLimit(Math.max(1, Math.min(50, Number(e.target.value) || 25)))} />
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
                    {results.map((r) => {
                      const id = idOf(r);
                      const li = r.lIProfileUrl ?? r.linkedinUrl;
                      return (
                        <TableRow key={id}>
                          <TableCell>
                            <Checkbox checked={selected.has(id)} onCheckedChange={() => toggle(id)} />
                          </TableCell>
                          <TableCell className="font-sans font-medium">
                            {r.fullName ?? `${r.firstName ?? ""} ${r.lastName ?? ""}`.trim() ?? "—"}
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
                            {r._alreadyImported
                              ? <Badge variant="secondary">Imported</Badge>
                              : <Badge>New</Badge>}
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
