import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft, Search, Plus, Loader2, ExternalLink, Trash2, Link as LinkIcon,
} from "lucide-react";
import PasswordGate from "@/components/PasswordGate";
import {
  useBrandAssets,
  useTalentBrandRelationships,
  useFetchBrand,
  useLinkTalentBrand,
  useDeleteTalentBrandLink,
} from "@/hooks/useBrandAssets";
import { useCreators } from "@/hooks/useCreators";

const BrandManager = () => {
  const { user } = useAuth();
  const [searchDomain, setSearchDomain] = useState("");
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [selectedCreatorId, setSelectedCreatorId] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [dealValue, setDealValue] = useState("");
  const [dealStatus, setDealStatus] = useState("completed");
  const [notes, setNotes] = useState("");

  const { data: brands, isLoading: brandsLoading } = useBrandAssets();
  const { data: relationships, isLoading: relsLoading } = useTalentBrandRelationships();
  const { creators } = useCreators();
  const fetchBrand = useFetchBrand();
  const linkTalentBrand = useLinkTalentBrand();
  const deleteLink = useDeleteTalentBrandLink();

  const handleFetchBrand = () => {
    if (!searchDomain.trim()) return;
    fetchBrand.mutate(searchDomain.trim());
    setSearchDomain("");
  };

  const handleLinkTalent = () => {
    if (!selectedBrandId || !selectedCreatorId) return;
    linkTalentBrand.mutate(
      {
        creator_id: selectedCreatorId,
        brand_id: selectedBrandId,
        campaign_name: campaignName || undefined,
        deal_value: dealValue || undefined,
        status: dealStatus,
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          setLinkDialogOpen(false);
          setSelectedCreatorId("");
          setCampaignName("");
          setDealValue("");
          setDealStatus("completed");
          setNotes("");
        },
      }
    );
  };

  const openLinkDialog = (brandId: string) => {
    setSelectedBrandId(brandId);
    setLinkDialogOpen(true);
  };

  return (
    <PasswordGate>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link to="/console">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Console
                  </Button>
                </Link>
                <h1 className="font-sans text-lg font-semibold text-primary">
                  Brand Assets Manager
                </h1>
              </div>
              {user && (
                <span className="text-sm text-muted-foreground font-sans">
                  {user.email}
                </span>
              )}
            </div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-8 space-y-8">
          {/* Search / Add Brand */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-sans text-lg font-semibold text-primary mb-4">
              Fetch Brand Assets
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Enter a brand domain (e.g. nike.com) to pull logos, colors, and metadata from Brandfetch.
            </p>
            <div className="flex gap-3">
              <Input
                placeholder="e.g. nike.com, apple.com, garmin.com"
                value={searchDomain}
                onChange={(e) => setSearchDomain(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFetchBrand()}
                className="max-w-md"
              />
              <Button onClick={handleFetchBrand} disabled={fetchBrand.isPending}>
                {fetchBrand.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                Fetch
              </Button>
            </div>
          </div>

          {/* Brand Assets Grid */}
          <div>
            <h2 className="font-sans text-lg font-semibold text-primary mb-4">
              Brand Library ({brands?.length || 0})
            </h2>
            {brandsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : !brands?.length ? (
              <p className="text-sm text-muted-foreground text-center py-12">
                No brands yet. Fetch your first brand above.
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {brands.map((brand) => (
                  <div
                    key={brand.id}
                    className="bg-card border border-border rounded-lg p-4 hover:border-accent transition-colors group"
                  >
                    <div className="flex items-center justify-center h-16 mb-3">
                      {brand.logo_url ? (
                        <img
                          src={brand.logo_url}
                          alt={brand.name}
                          className="max-h-12 max-w-full object-contain"
                        />
                      ) : brand.icon_url ? (
                        <img
                          src={brand.icon_url}
                          alt={brand.name}
                          className="max-h-12 max-w-full object-contain"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center text-lg font-bold text-muted-foreground">
                          {brand.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <h3 className="font-sans text-sm font-semibold text-primary text-center truncate">
                      {brand.name}
                    </h3>
                    <p className="text-xs text-muted-foreground text-center truncate">
                      {brand.domain}
                    </p>
                    {brand.industry && (
                      <Badge variant="secondary" className="text-xs mt-2 mx-auto block w-fit">
                        {brand.industry}
                      </Badge>
                    )}
                    {/* Color swatches */}
                    {brand.brand_colors?.length > 0 && (
                      <div className="flex justify-center gap-1 mt-2">
                        {brand.brand_colors.slice(0, 5).map((c: any, i: number) => (
                          <div
                            key={i}
                            className="w-4 h-4 rounded-full border border-border"
                            style={{ backgroundColor: c.hex }}
                            title={c.hex}
                          />
                        ))}
                      </div>
                    )}
                    <div className="flex gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs"
                        onClick={() => openLinkDialog(brand.id)}
                      >
                        <LinkIcon className="w-3 h-3 mr-1" />
                        Link
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs"
                        asChild
                      >
                        <a href={`https://${brand.domain}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Talent-Brand Relationships */}
          <div>
            <h2 className="font-sans text-lg font-semibold text-primary mb-4">
              Talent × Brand Relationships
            </h2>
            {relsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : !relationships?.length ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No relationships yet. Link a brand to talent using the "Link" button above.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Brand</TableHead>
                      <TableHead>Talent</TableHead>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Deal Value</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {relationships.map((rel) => (
                      <TableRow key={rel.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {rel.brand_assets?.icon_url || rel.brand_assets?.logo_url ? (
                              <img
                                src={rel.brand_assets.icon_url || rel.brand_assets.logo_url!}
                                alt={rel.brand_assets.name}
                                className="w-6 h-6 object-contain"
                              />
                            ) : null}
                            <span className="text-sm font-medium">
                              {rel.brand_assets?.name || "Unknown"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {rel.creators?.name || "Unknown"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {rel.campaign_name || "—"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {rel.deal_value || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              rel.status === "active"
                                ? "default"
                                : rel.status === "completed"
                                ? "secondary"
                                : "outline"
                            }
                            className="text-xs"
                          >
                            {rel.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                          {rel.notes || "—"}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteLink.mutate(rel.id)}
                          >
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>

        {/* Link Talent Dialog */}
        <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Link Brand to Talent</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Creator</label>
                <Select value={selectedCreatorId} onValueChange={setSelectedCreatorId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a creator" />
                  </SelectTrigger>
                  <SelectContent>
                    {creators?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} (@{c.instagramHandle})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Campaign Name</label>
                <Input
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="e.g. Summer 2025 Campaign"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Deal Value</label>
                  <Input
                    value={dealValue}
                    onChange={(e) => setDealValue(e.target.value)}
                    placeholder="e.g. $10,000"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Status</label>
                  <Select value={dealStatus} onValueChange={setDealStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pipeline">Pipeline</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Notes</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional notes about this partnership"
                  rows={2}
                />
              </div>
              <Button
                onClick={handleLinkTalent}
                disabled={!selectedCreatorId || linkTalentBrand.isPending}
                className="w-full"
              >
                {linkTalentBrand.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Link Brand to Talent
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PasswordGate>
  );
};

export default BrandManager;
