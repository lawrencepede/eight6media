import { useState, useRef, useEffect } from "react";
import { Pencil, Save, X, ExternalLink, Edit3, XCircle, Maximize2, Minimize2, ChevronRight } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Creator } from "@/hooks/useCreators";
import { Badge } from "@/components/ui/badge";

interface RosterTableProps {
  creators: Creator[];
  onUpdate?: (creator: Creator) => void;
}

const RosterTable = ({ creators, onUpdate }: RosterTableProps) => {
  const [editingIds, setEditingIds] = useState<Set<string>>(new Set());
  const [editForms, setEditForms] = useState<Record<string, Partial<Creator>>>({});
  const [viewingCreator, setViewingCreator] = useState<Creator | null>(null);
  const [isEditAll, setIsEditAll] = useState(false);
  const [tableHeight, setTableHeight] = useState<"normal" | "expanded" | "fullscreen">("normal");
  
  // Refs for synchronized scrolling
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const topScrollbarRef = useRef<HTMLDivElement>(null);
  const bottomScrollbarRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const [tableWidth, setTableWidth] = useState(0);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const isSyncingRef = useRef(false);

  const heightValues = {
    normal: 500,
    expanded: 700,
    fullscreen: window.innerHeight - 250,
  };

  const startEditing = (creator: Creator) => {
    setEditingIds(prev => new Set(prev).add(creator.id));
    setEditForms(prev => ({ ...prev, [creator.id]: { ...creator } }));
  };

  const startEditingAll = () => {
    setIsEditAll(true);
    const allIds = new Set(creators.map(c => c.id));
    const allForms: Record<string, Partial<Creator>> = {};
    creators.forEach(c => {
      allForms[c.id] = { ...c };
    });
    setEditingIds(allIds);
    setEditForms(allForms);
  };

  const cancelEditingAll = () => {
    setIsEditAll(false);
    setEditingIds(new Set());
    setEditForms({});
  };

  const cancelEditing = (creatorId: string) => {
    setEditingIds(prev => {
      const next = new Set(prev);
      next.delete(creatorId);
      return next;
    });
    setEditForms(prev => {
      const { [creatorId]: _, ...rest } = prev;
      return rest;
    });
    if (editingIds.size <= 1) {
      setIsEditAll(false);
    }
  };

  const saveEditing = (creatorId: string) => {
    if (onUpdate && editForms[creatorId]) {
      onUpdate(editForms[creatorId] as Creator);
    }
    cancelEditing(creatorId);
  };

  const saveAll = async () => {
    if (onUpdate) {
      for (const creatorId of editingIds) {
        if (editForms[creatorId]) {
          onUpdate(editForms[creatorId] as Creator);
        }
      }
    }
    cancelEditingAll();
  };

  const updateField = (creatorId: string, field: keyof Creator, value: string) => {
    setEditForms(prev => ({
      ...prev,
      [creatorId]: { ...prev[creatorId], [field]: value },
    }));
  };

  const updateMetric = (creatorId: string, field: string, value: string) => {
    setEditForms(prev => ({
      ...prev,
      [creatorId]: {
        ...prev[creatorId],
        metrics: { ...prev[creatorId]?.metrics, [field]: value } as Creator["metrics"],
      },
    }));
  };

  // Measure table width for scrollbar sync
  useEffect(() => {
    const measureWidths = () => {
      if (tableRef.current) {
        setTableWidth(tableRef.current.scrollWidth);
      }
    };

    measureWidths();
    
    // Re-measure on resize
    const resizeObserver = new ResizeObserver(measureWidths);
    if (tableContainerRef.current) {
      resizeObserver.observe(tableContainerRef.current);
    }
    if (tableRef.current) {
      resizeObserver.observe(tableRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [creators, tableHeight]);

  // Sync all three scrollable elements
  const syncScroll = (source: 'table' | 'top' | 'bottom', scrollLeft: number) => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    
    if (source !== 'table' && tableContainerRef.current) {
      tableContainerRef.current.scrollLeft = scrollLeft;
    }
    if (source !== 'top' && topScrollbarRef.current) {
      topScrollbarRef.current.scrollLeft = scrollLeft;
    }
    if (source !== 'bottom' && bottomScrollbarRef.current) {
      bottomScrollbarRef.current.scrollLeft = scrollLeft;
    }
    
    if (scrollLeft > 0) {
      setShowScrollHint(false);
    }
    
    requestAnimationFrame(() => {
      isSyncingRef.current = false;
    });
  };

  const handleTableScroll = () => {
    if (tableContainerRef.current) {
      syncScroll('table', tableContainerRef.current.scrollLeft);
    }
  };

  const handleTopScrollbarScroll = () => {
    if (topScrollbarRef.current) {
      syncScroll('top', topScrollbarRef.current.scrollLeft);
    }
  };

  const handleBottomScrollbarScroll = () => {
    if (bottomScrollbarRef.current) {
      syncScroll('bottom', bottomScrollbarRef.current.scrollLeft);
    }
  };

  const cycleTableHeight = () => {
    setTableHeight(prev => {
      if (prev === "normal") return "expanded";
      if (prev === "expanded") return "fullscreen";
      return "normal";
    });
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {isEditAll ? (
            <>
              <Button onClick={saveAll} size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save All
              </Button>
              <Button onClick={cancelEditingAll} variant="outline" size="sm">
                <XCircle className="w-4 h-4 mr-2" />
                Cancel All
              </Button>
            </>
          ) : (
            <Button onClick={startEditingAll} variant="outline" size="sm">
              <Edit3 className="w-4 h-4 mr-2" />
              Edit All
            </Button>
          )}
        </div>
        <Button onClick={cycleTableHeight} variant="ghost" size="sm">
          {tableHeight === "fullscreen" ? (
            <Minimize2 className="w-4 h-4 mr-2" />
          ) : (
            <Maximize2 className="w-4 h-4 mr-2" />
          )}
          {tableHeight === "normal" ? "Expand" : tableHeight === "expanded" ? "Fullscreen" : "Collapse"}
        </Button>
      </div>

      <div className="rounded-lg border border-border overflow-hidden relative flex flex-col" style={{ height: heightValues[tableHeight] }}>
        {/* Right scroll indicator */}
        {showScrollHint && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 z-30 bg-accent/90 text-accent-foreground px-2 py-1 rounded-l-lg flex items-center gap-1 text-xs font-medium shadow-lg">
            <span>Scroll</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        )}
        
        {/* Top horizontal scrollbar */}
        <div 
          ref={topScrollbarRef}
          className="overflow-x-scroll overflow-y-hidden bg-muted flex-shrink-0 visible-scrollbar"
          style={{ height: 14 }}
          onScroll={handleTopScrollbarScroll}
        >
          <div style={{ width: tableWidth, height: 1 }} />
        </div>
        
        {/* Table container - vertical scroll, hidden horizontal scrollbar (synced to top/bottom) */}
        <div 
          ref={tableContainerRef}
          className="flex-1 overflow-y-auto hide-horizontal-scrollbar"
          onScroll={handleTableScroll}
        >
          <Table ref={tableRef} noWrapper>
            <TableHeader className="sticky top-0 z-30">
              <TableRow className="bg-muted">
                <TableHead className="sticky left-0 bg-muted z-40 min-w-[200px]">Creator</TableHead>
                <TableHead className="min-w-[120px]">IG Handle</TableHead>
                <TableHead className="min-w-[140px]">Location</TableHead>
                <TableHead className="min-w-[100px]">IG Followers</TableHead>
                <TableHead className="min-w-[100px]">TikTok</TableHead>
                <TableHead className="min-w-[80px]">Eng. Rate</TableHead>
                <TableHead className="min-w-[100px]">Story Views</TableHead>
                <TableHead className="min-w-[120px]">Impressions</TableHead>
                <TableHead className="min-w-[200px]">Brand Partners</TableHead>
                <TableHead className="min-w-[150px]">Verticals</TableHead>
                <TableHead className="min-w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {creators.map((creator) => {
                const isEditing = editingIds.has(creator.id);
                const form = editForms[creator.id] || {};
                
                return (
                  <TableRow key={creator.id} className="hover:bg-muted/30">
                    {/* Creator Name */}
                    <TableCell className="sticky left-0 bg-card z-10">
                      <div className="flex items-center gap-3">
                        <img
                          src={creator.image}
                          alt={creator.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          {isEditing ? (
                            <Input
                              value={form.name || ""}
                              onChange={(e) => updateField(creator.id, "name", e.target.value)}
                              className="h-8 text-sm"
                            />
                          ) : (
                            <>
                              <p className="font-medium text-primary">{creator.name}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                                {creator.tagline}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* IG Handle */}
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={form.instagramHandle || ""}
                          onChange={(e) => updateField(creator.id, "instagramHandle", e.target.value)}
                          className="h-8 text-sm"
                        />
                      ) : (
                        <a
                          href={`https://instagram.com/${creator.instagramHandle.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {creator.instagramHandle}
                        </a>
                      )}
                    </TableCell>

                    {/* Location */}
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={form.location || ""}
                          onChange={(e) => updateField(creator.id, "location", e.target.value)}
                          className="h-8 text-sm"
                        />
                      ) : (
                        <span className="text-sm">{creator.location}</span>
                      )}
                    </TableCell>

                    {/* IG Followers */}
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={form.metrics?.igFollowers || ""}
                          onChange={(e) => updateMetric(creator.id, "igFollowers", e.target.value)}
                          className="h-8 text-sm w-20"
                        />
                      ) : (
                        <span className="text-sm font-medium">
                          {creator.metrics?.igFollowers || "—"}
                        </span>
                      )}
                    </TableCell>

                    {/* TikTok */}
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={form.metrics?.tiktokFollowers || ""}
                          onChange={(e) => updateMetric(creator.id, "tiktokFollowers", e.target.value)}
                          className="h-8 text-sm w-20"
                        />
                      ) : (
                        <span className="text-sm">
                          {creator.metrics?.tiktokFollowers || "—"}
                        </span>
                      )}
                    </TableCell>

                    {/* Engagement Rate */}
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={form.metrics?.engagementRate || ""}
                          onChange={(e) => updateMetric(creator.id, "engagementRate", e.target.value)}
                          className="h-8 text-sm w-16"
                        />
                      ) : (
                        <span className="text-sm">
                          {creator.metrics?.engagementRate || "—"}
                        </span>
                      )}
                    </TableCell>

                    {/* Story Views */}
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={form.metrics?.storyViews || ""}
                          onChange={(e) => updateMetric(creator.id, "storyViews", e.target.value)}
                          className="h-8 text-sm w-20"
                        />
                      ) : (
                        <span className="text-sm">
                          {creator.metrics?.storyViews || "—"}
                        </span>
                      )}
                    </TableCell>

                    {/* Impressions */}
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={form.metrics?.monthlyImpressions || ""}
                          onChange={(e) => updateMetric(creator.id, "monthlyImpressions", e.target.value)}
                          className="h-8 text-sm w-24"
                        />
                      ) : (
                        <span className="text-sm">
                          {creator.metrics?.monthlyImpressions || creator.impressions}
                        </span>
                      )}
                    </TableCell>

                    {/* Brand Partners */}
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {creator.partners.slice(0, 3).map((partner, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {partner}
                          </Badge>
                        ))}
                        {creator.partners.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{creator.partners.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    {/* Verticals */}
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {creator.verticals.slice(0, 2).map((v, i) => (
                          <Badge key={i} className="text-xs bg-accent/10 text-accent border-0">
                            {v}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {isEditing ? (
                          <>
                            <Button size="sm" variant="ghost" onClick={() => saveEditing(creator.id)}>
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => cancelEditing(creator.id)}>
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setViewingCreator(creator)}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => startEditing(creator)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Detail View Modal */}
      <Dialog open={!!viewingCreator} onOpenChange={() => setViewingCreator(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {viewingCreator && (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif text-xl flex items-center gap-3">
                  <img
                    src={viewingCreator.image}
                    alt={viewingCreator.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {viewingCreator.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 mt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Instagram</p>
                    <p className="font-medium text-accent">{viewingCreator.instagramHandle}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Location</p>
                    <p className="font-medium">{viewingCreator.location}</p>
                  </div>
                </div>

                {viewingCreator.bio && (
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Bio</p>
                    <p className="text-sm">{viewingCreator.bio}</p>
                  </div>
                )}

                {viewingCreator.metrics && (
                  <div>
                    <p className="text-muted-foreground text-sm mb-2">Metrics</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground">IG Followers</p>
                        <p className="font-semibold">{viewingCreator.metrics.igFollowers}</p>
                      </div>
                      {viewingCreator.metrics.tiktokFollowers && (
                        <div className="bg-muted/50 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground">TikTok</p>
                          <p className="font-semibold">{viewingCreator.metrics.tiktokFollowers}</p>
                        </div>
                      )}
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground">Engagement</p>
                        <p className="font-semibold">{viewingCreator.metrics.engagementRate}</p>
                      </div>
                      {viewingCreator.metrics.storyViews && (
                        <div className="bg-muted/50 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground">Story Views</p>
                          <p className="font-semibold">{viewingCreator.metrics.storyViews}</p>
                        </div>
                      )}
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground">Impressions</p>
                        <p className="font-semibold">{viewingCreator.metrics.monthlyImpressions}</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground">Audience</p>
                        <p className="font-semibold text-sm">{viewingCreator.metrics.audienceDemo}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-muted-foreground text-sm mb-2">Brand Partners</p>
                  <div className="flex flex-wrap gap-2">
                    {viewingCreator.partners.map((partner, i) => (
                      <Badge key={i} variant="outline">
                        {partner}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-muted-foreground text-sm mb-2">Verticals</p>
                  <div className="flex flex-wrap gap-2">
                    {viewingCreator.verticals.map((v, i) => (
                      <Badge key={i} className="bg-accent/10 text-accent border-0">
                        {v}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RosterTable;
