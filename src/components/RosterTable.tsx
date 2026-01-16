import { useState } from "react";
import { Pencil, Save, X, ExternalLink } from "lucide-react";
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
import { Creator } from "@/data/creators";
import { Badge } from "@/components/ui/badge";

interface RosterTableProps {
  creators: Creator[];
  onUpdate?: (creator: Creator) => void;
}

const RosterTable = ({ creators, onUpdate }: RosterTableProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Creator>>({});
  const [viewingCreator, setViewingCreator] = useState<Creator | null>(null);

  const startEditing = (creator: Creator) => {
    setEditingId(creator.id);
    setEditForm({ ...creator });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEditing = () => {
    if (onUpdate && editForm) {
      onUpdate(editForm as Creator);
    }
    setEditingId(null);
    setEditForm({});
  };

  const updateField = (field: keyof Creator, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const updateMetric = (field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      metrics: { ...prev.metrics, [field]: value } as Creator["metrics"],
    }));
  };

  return (
    <>
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="sticky left-0 bg-muted/50 z-10 min-w-[200px]">Creator</TableHead>
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
                const isEditing = editingId === creator.id;
                
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
                              value={editForm.name || ""}
                              onChange={(e) => updateField("name", e.target.value)}
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
                          value={editForm.instagramHandle || ""}
                          onChange={(e) => updateField("instagramHandle", e.target.value)}
                          className="h-8 text-sm"
                        />
                      ) : (
                        <span className="text-accent">{creator.instagramHandle}</span>
                      )}
                    </TableCell>

                    {/* Location */}
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={editForm.location || ""}
                          onChange={(e) => updateField("location", e.target.value)}
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
                          value={editForm.metrics?.igFollowers || ""}
                          onChange={(e) => updateMetric("igFollowers", e.target.value)}
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
                          value={editForm.metrics?.tiktokFollowers || ""}
                          onChange={(e) => updateMetric("tiktokFollowers", e.target.value)}
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
                          value={editForm.metrics?.engagementRate || ""}
                          onChange={(e) => updateMetric("engagementRate", e.target.value)}
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
                          value={editForm.metrics?.storyViews || ""}
                          onChange={(e) => updateMetric("storyViews", e.target.value)}
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
                          value={editForm.metrics?.monthlyImpressions || ""}
                          onChange={(e) => updateMetric("monthlyImpressions", e.target.value)}
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
                            <Button size="sm" variant="ghost" onClick={saveEditing}>
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={cancelEditing}>
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
