import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Filter, MapPin, Instagram, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { creators, verticals, platforms, genders, followerRanges, parseFollowerCount, getActiveCreators } from "@/data/creators";
import BrandLogo from "@/components/BrandLogo";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Creator } from "@/data/creators";

type FilterType = "vertical" | "followers" | "platforms" | "gender";

interface ActiveFilters {
  verticals: string[];
  followerRanges: string[];
  platforms: string[];
  genders: string[];
}

const Roster = () => {
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [activeFilterTypes, setActiveFilterTypes] = useState<FilterType[]>(["vertical"]);
  const [filters, setFilters] = useState<ActiveFilters>({
    verticals: [],
    followerRanges: [],
    platforms: [],
    genders: [],
  });

  const toggleFilterType = (filterType: FilterType) => {
    setActiveFilterTypes(prev =>
      prev.includes(filterType)
        ? prev.filter(f => f !== filterType)
        : [...prev, filterType]
    );
  };

  const toggleFilter = (category: keyof ActiveFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(v => v !== value)
        : [...prev[category], value]
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      verticals: [],
      followerRanges: [],
      platforms: [],
      genders: [],
    });
  };

  const activeCreators = getActiveCreators();
  
  const filteredCreators = activeCreators.filter(creator => {
    // Vertical filter
    if (filters.verticals.length > 0) {
      if (!creator.verticals.some(v => filters.verticals.includes(v))) {
        return false;
      }
    }

    // Follower range filter
    if (filters.followerRanges.length > 0) {
      const followerCount = parseFollowerCount(creator.metrics?.igFollowers || creator.followers);
      const inRange = filters.followerRanges.some(rangeName => {
        const range = followerRanges.find(r => r.label === rangeName);
        if (!range) return false;
        return followerCount >= range.min && followerCount < range.max;
      });
      if (!inRange) return false;
    }

    // Platform filter
    if (filters.platforms.length > 0) {
      if (!creator.platforms.some(p => filters.platforms.includes(p))) {
        return false;
      }
    }

    // Gender filter
    if (filters.genders.length > 0) {
      if (!filters.genders.includes(creator.gender)) {
        return false;
      }
    }

    return true;
  });

  const totalActiveFilters = 
    filters.verticals.length + 
    filters.followerRanges.length + 
    filters.platforms.length + 
    filters.genders.length;

  // Create masonry-style heights
  const getCardHeight = (index: number) => {
    const heights = ["aspect-[3/4]", "aspect-[4/5]", "aspect-[3/4]", "aspect-[4/5]"];
    return heights[index % heights.length];
  };

  const filterTypeLabels: Record<FilterType, string> = {
    vertical: "Vertical",
    followers: "IG Followers",
    platforms: "Platforms",
    gender: "Gender",
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Filter Bar */}
      <div className="sticky top-[72px] z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-6 py-4 space-y-4">
          {/* Filter Type Selector */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-muted-foreground shrink-0">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filter by:</span>
            </div>
            
            {(Object.keys(filterTypeLabels) as FilterType[]).map((type) => (
              <button
                key={type}
                onClick={() => toggleFilterType(type)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeFilterTypes.includes(type)
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {filterTypeLabels[type]}
              </button>
            ))}

            {totalActiveFilters > 0 && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <X className="w-3 h-3" />
                Clear all ({totalActiveFilters})
              </button>
            )}
          </div>

          {/* Active Filter Dropdowns */}
          <div className="flex items-center gap-3 flex-wrap">
            {activeFilterTypes.includes("vertical") && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    Vertical
                    {filters.verticals.length > 0 && (
                      <span className="bg-accent text-accent-foreground px-1.5 rounded-full text-xs">
                        {filters.verticals.length}
                      </span>
                    )}
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-popover z-50">
                  {verticals.map((vertical) => (
                    <DropdownMenuCheckboxItem
                      key={vertical}
                      checked={filters.verticals.includes(vertical)}
                      onCheckedChange={() => toggleFilter("verticals", vertical)}
                    >
                      {vertical}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {activeFilterTypes.includes("followers") && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    IG Followers
                    {filters.followerRanges.length > 0 && (
                      <span className="bg-accent text-accent-foreground px-1.5 rounded-full text-xs">
                        {filters.followerRanges.length}
                      </span>
                    )}
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-popover z-50">
                  {followerRanges.map((range) => (
                    <DropdownMenuCheckboxItem
                      key={range.label}
                      checked={filters.followerRanges.includes(range.label)}
                      onCheckedChange={() => toggleFilter("followerRanges", range.label)}
                    >
                      {range.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {activeFilterTypes.includes("platforms") && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    Platforms
                    {filters.platforms.length > 0 && (
                      <span className="bg-accent text-accent-foreground px-1.5 rounded-full text-xs">
                        {filters.platforms.length}
                      </span>
                    )}
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-popover z-50">
                  {platforms.map((platform) => (
                    <DropdownMenuCheckboxItem
                      key={platform}
                      checked={filters.platforms.includes(platform)}
                      onCheckedChange={() => toggleFilter("platforms", platform)}
                    >
                      {platform}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {activeFilterTypes.includes("gender") && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    Gender
                    {filters.genders.length > 0 && (
                      <span className="bg-accent text-accent-foreground px-1.5 rounded-full text-xs">
                        {filters.genders.length}
                      </span>
                    )}
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-popover z-50">
                  {genders.map((gender) => (
                    <DropdownMenuCheckboxItem
                      key={gender}
                      checked={filters.genders.includes(gender)}
                      onCheckedChange={() => toggleFilter("genders", gender)}
                    >
                      {gender}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Active Filter Pills */}
          {totalActiveFilters > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {filters.verticals.map((v) => (
                <span
                  key={v}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-accent/20 text-accent rounded-full text-xs"
                >
                  {v}
                  <button onClick={() => toggleFilter("verticals", v)} className="hover:text-primary">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {filters.followerRanges.map((r) => (
                <span
                  key={r}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-accent/20 text-accent rounded-full text-xs"
                >
                  {r}
                  <button onClick={() => toggleFilter("followerRanges", r)} className="hover:text-primary">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {filters.platforms.map((p) => (
                <span
                  key={p}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-accent/20 text-accent rounded-full text-xs"
                >
                  {p}
                  <button onClick={() => toggleFilter("platforms", p)} className="hover:text-primary">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {filters.genders.map((g) => (
                <span
                  key={g}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-accent/20 text-accent rounded-full text-xs"
                >
                  {g}
                  <button onClick={() => toggleFilter("genders", g)} className="hover:text-primary">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
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
              onClick={clearAllFilters}
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
                      <a 
                        href={`https://instagram.com/${selectedCreator.instagramHandle.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-accent transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Instagram className="w-4 h-4" />
                        {selectedCreator.instagramHandle}
                      </a>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {selectedCreator.location}
                      </span>
                    </div>
                    {selectedCreator.bio && (
                      <p className="text-muted-foreground mt-3 text-sm">{selectedCreator.bio}</p>
                    )}
                  </div>
                  
                  {/* Platforms */}
                  <div>
                    <h4 className="font-semibold text-primary mb-2">Platforms</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCreator.platforms.map((platform, i) => (
                        <span
                          key={i}
                          className="text-xs bg-secondary text-secondary-foreground px-3 py-1 rounded-full"
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
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