import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, ExternalLink, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreators } from "@/hooks/useCreators";
import { usePitches, type Pitch } from "@/hooks/usePitches";
import { toast } from "sonner";

const PitchGenerator = () => {
  const { creators } = useCreators();
  const { pitches, createPitch, deletePitch } = usePitches();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Form state
  const [brandName, setBrandName] = useState("");
  const [slug, setSlug] = useState("");
  const [headline, setHeadline] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCreators, setSelectedCreators] = useState<string[]>([]);

  const handleBrandNameChange = (value: string) => {
    setBrandName(value);
    setSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
  };

  const toggleCreator = (creatorId: string) => {
    setSelectedCreators(prev =>
      prev.includes(creatorId)
        ? prev.filter(id => id !== creatorId)
        : [...prev, creatorId]
    );
  };

  const handleCreatePitch = () => {
    if (!brandName || !slug || selectedCreators.length === 0) {
      toast.error("Please fill in all required fields and select at least one creator");
      return;
    }

    createPitch({
      brandName,
      slug,
      headline: headline || `Curated Creators for ${brandName}`,
      description,
      creatorIds: selectedCreators,
    });

    // Reset form
    setBrandName("");
    setSlug("");
    setHeadline("");
    setDescription("");
    setSelectedCreators([]);
    setIsCreateOpen(false);
    toast.success("Pitch created successfully!");
  };

  const handleDeletePitch = (pitch: Pitch) => {
    if (confirm(`Delete pitch for ${pitch.brandName}?`)) {
      deletePitch(pitch.id);
      toast.success("Pitch deleted");
    }
  };

  const copyPitchUrl = (slug: string) => {
    const url = `${window.location.origin}/pitch/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(slug);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("URL copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/console" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-sans">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Console</span>
            </Link>
            <h1 className="font-sans text-lg font-semibold text-primary">Custom Roster Generator</h1>
            <div className="w-32" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Create New Pitch */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl text-primary">BRAND PITCHES</h2>
            <p className="text-muted-foreground font-sans">Create custom portfolio pages for brands</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="font-script">
                <Plus className="w-4 h-4 mr-2" />
                Create Pitch
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">CREATE NEW PITCH</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 mt-4">
                {/* Brand Details */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-primary block mb-2 font-sans">
                      Brand Name *
                    </label>
                    <Input
                      value={brandName}
                      onChange={(e) => handleBrandNameChange(e.target.value)}
                      placeholder="e.g., Nike, Glossier"
                      className="font-sans"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-primary block mb-2 font-sans">
                      URL Slug *
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm font-sans">/pitch/</span>
                      <Input
                        value={slug}
                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                        placeholder="brand-name"
                        className="font-sans"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-primary block mb-2 font-sans">
                      Headline (optional)
                    </label>
                    <Input
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder="Curated Creators for Your Brand"
                      className="font-sans"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-primary block mb-2 font-sans">
                      Description (optional)
                    </label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="A personalized message for the brand..."
                      rows={3}
                      className="font-sans"
                    />
                  </div>
                </div>

                {/* Creator Selection */}
                <div>
                  <label className="text-sm font-medium text-primary block mb-4 font-sans">
                    Select Creators *
                  </label>
                  <div className="grid gap-3 max-h-[400px] overflow-y-auto">
                    {creators.map((creator) => (
                      <div
                        key={creator.id}
                        className={`flex items-center gap-4 p-3 rounded-lg border transition-colors cursor-pointer ${
                          selectedCreators.includes(creator.id)
                            ? "border-accent bg-accent/5"
                            : "border-border hover:border-accent/50"
                        }`}
                        onClick={() => toggleCreator(creator.id)}
                      >
                        <Checkbox
                          checked={selectedCreators.includes(creator.id)}
                          onCheckedChange={() => toggleCreator(creator.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <img
                          src={creator.image}
                          alt={creator.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-sans font-medium text-primary">{creator.name}</p>
                          <p className="text-sm text-muted-foreground truncate font-sans">
                            {creator.instagramHandle} • {creator.location}
                          </p>
                        </div>
                        <div className="text-right text-sm text-muted-foreground shrink-0 font-sans">
                          <p>{creator.metrics?.igFollowers || creator.followers.replace(" Followers", "")}</p>
                          <p className="text-xs">{creator.metrics?.engagementRate || "—"} eng</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={handleCreatePitch} className="w-full font-script">
                  Create Pitch
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Pitches List */}
        {pitches.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl border border-border">
            <p className="text-muted-foreground mb-4 font-sans">No pitches created yet</p>
            <Button variant="outline" onClick={() => setIsCreateOpen(true)} className="font-script">
              Create your first pitch
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {pitches.map((pitch) => (
              <div
                key={pitch.id}
                className="flex items-center justify-between p-6 bg-card rounded-xl border border-border"
              >
                <div>
                  <h3 className="font-sans font-semibold text-primary text-lg">{pitch.brandName}</h3>
                  <p className="text-sm text-muted-foreground font-sans">
                    {pitch.creatorIds.length} creator{pitch.creatorIds.length !== 1 ? "s" : ""} • 
                    Created {new Date(pitch.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyPitchUrl(pitch.slug)}
                    className="font-sans"
                  >
                    {copiedId === pitch.slug ? (
                      <Check className="w-4 h-4 mr-2" />
                    ) : (
                      <Copy className="w-4 h-4 mr-2" />
                    )}
                    Copy URL
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="font-sans"
                  >
                    <Link to={`/pitch/${pitch.slug}`} target="_blank">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Preview
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeletePitch(pitch)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PitchGenerator;
