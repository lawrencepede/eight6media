import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Filter, MapPin, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { creators, verticals, getActiveCreators } from "@/data/creators";
import BrandLogo from "@/components/BrandLogo";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Creator } from "@/data/creators";

const Roster = () => {
  const [selectedVerticals, setSelectedVerticals] = useState<string[]>([]);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);

  const toggleVertical = (vertical: string) => {
    setSelectedVerticals(prev =>
      prev.includes(vertical)
        ? prev.filter(v => v !== vertical)
        : [...prev, vertical]
    );
  };

  const activeCreators = getActiveCreators();
  const filteredCreators = selectedVerticals.length === 0
    ? activeCreators
    : activeCreators.filter(creator =>
        creator.verticals.some(v => selectedVerticals.includes(v))
      );

  // Create masonry-style heights
  const getCardHeight = (index: number) => {
    const heights = ["aspect-[3/4]", "aspect-[4/5]", "aspect-[3/4]", "aspect-[4/5]"];
    return heights[index % heights.length];
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
            <h1 className="font-serif text-xl font-bold text-primary">Our Roster</h1>
            <div className="w-24" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="sticky top-[65px] z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            <div className="flex items-center gap-2 text-muted-foreground shrink-0">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filter:</span>
            </div>
            {verticals.map((vertical) => (
              <button
                key={vertical}
                onClick={() => toggleVertical(vertical)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedVerticals.includes(vertical)
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {vertical}
              </button>
            ))}
            {selectedVerticals.length > 0 && (
              <button
                onClick={() => setSelectedVerticals([])}
                className="shrink-0 px-4 py-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Masonry Grid */}
      <div className="container mx-auto px-6 py-12">
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          {filteredCreators.map((creator, index) => (
            <div
              key={creator.id}
              className="break-inside-avoid cursor-pointer group"
              onClick={() => setSelectedCreator(creator)}
            >
              <div className="bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                <div className={`${getCardHeight(index)} overflow-hidden relative`}>
                  <img
                    src={creator.image}
                    alt={creator.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-white text-sm">{creator.followers}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-serif text-lg font-semibold text-primary">
                    {creator.name}
                  </h3>
                  <p className="text-accent text-sm font-medium mb-2">
                    {creator.tagline}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {creator.verticals.slice(0, 2).map((vertical, i) => (
                      <span
                        key={i}
                        className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full"
                      >
                        {vertical}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCreators.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              No creators found for the selected filters.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setSelectedVerticals([])}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>

      {/* Creator Detail Modal */}
      <Dialog open={!!selectedCreator} onOpenChange={() => setSelectedCreator(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedCreator && (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl">
                  {selectedCreator.name}
                </DialogTitle>
              </DialogHeader>
              <div className="grid md:grid-cols-2 gap-6 mt-4">
                <div className="aspect-[4/5] rounded-xl overflow-hidden">
                  <img
                    src={selectedCreator.image}
                    alt={selectedCreator.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-accent font-medium">{selectedCreator.tagline}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Instagram className="w-4 h-4" />
                        {selectedCreator.instagramHandle}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {selectedCreator.location}
                      </span>
                    </div>
                    {selectedCreator.bio && (
                      <p className="text-muted-foreground mt-3 text-sm">{selectedCreator.bio}</p>
                    )}
                  </div>
                  
                  {/* Metrics Grid */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-primary">Performance Metrics</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-secondary/50 rounded-lg p-3">
                        <p className="text-muted-foreground text-xs">IG Followers</p>
                        <p className="font-semibold text-primary">{selectedCreator.metrics?.igFollowers || selectedCreator.followers.replace(" Followers", "")}</p>
                      </div>
                      <div className="bg-secondary/50 rounded-lg p-3">
                        <p className="text-muted-foreground text-xs">Engagement Rate</p>
                        <p className="font-semibold text-primary">{selectedCreator.metrics?.engagementRate || "—"}</p>
                      </div>
                      <div className="bg-secondary/50 rounded-lg p-3">
                        <p className="text-muted-foreground text-xs">Monthly Impressions</p>
                        <p className="font-semibold text-primary">{selectedCreator.metrics?.monthlyImpressions || selectedCreator.impressions.replace(" Monthly Impressions", "")}</p>
                      </div>
                      {selectedCreator.metrics?.storyViews && (
                        <div className="bg-secondary/50 rounded-lg p-3">
                          <p className="text-muted-foreground text-xs">Avg Story Views</p>
                          <p className="font-semibold text-primary">{selectedCreator.metrics.storyViews}</p>
                        </div>
                      )}
                      {selectedCreator.metrics?.tiktokFollowers && (
                        <div className="bg-secondary/50 rounded-lg p-3">
                          <p className="text-muted-foreground text-xs">TikTok Followers</p>
                          <p className="font-semibold text-primary">{selectedCreator.metrics.tiktokFollowers}</p>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{selectedCreator.audience}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-primary mb-2">Verticals</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCreator.verticals.map((vertical, i) => (
                        <span
                          key={i}
                          className="text-xs bg-accent/10 text-accent px-3 py-1 rounded-full"
                        >
                          {vertical}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-primary mb-2">Brand Partners</h4>
                    <div className="flex flex-wrap items-center gap-2">
                      {selectedCreator.partners.map((partner, i) => (
                        <BrandLogo key={i} brand={partner} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Roster;
