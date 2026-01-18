import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Import local assets for special image mappings
import mattPhoto from "@/assets/matt-photo.png";
import jaimePhoto from "@/assets/jaime-photo.png";
import amandaPhoto from "@/assets/amanda-photo.png";

const placeholderImage = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop&crop=face";

// Map special image identifiers to actual imports
const imageMap: Record<string, string> = {
  "amanda-photo": amandaPhoto,
  "matt-photo": mattPhoto,
  "jaime-photo": jaimePhoto,
};

export interface CreatorMetrics {
  tiktokFollowers?: string;
  igFollowers?: string;
  engagementRate?: string;
  storyViews?: string;
  linkClicks?: string;
  monthlyImpressions?: string;
  audienceDemo?: string;
}

export interface DbCreator {
  id: string;
  slug: string | null;
  name: string;
  instagram_handle: string;
  location: string | null;
  followers: string | null;
  image: string | null;
  niche: string | null;
  expertise: string[] | null;
  bio: string | null;
  tiktok_handle: string | null;
  metrics: CreatorMetrics | null;
  created_at: string;
  updated_at: string;
}

// Legacy format for compatibility with existing components
export interface Creator {
  id: string;
  name: string;
  tagline: string;
  instagramHandle: string;
  location: string;
  followers: string;
  impressions: string;
  audience: string;
  partners: string[];
  verticals: string[];
  image: string;
  bio?: string;
  metrics?: CreatorMetrics;
  isActive: boolean;
  platforms: string[];
  gender: "Male" | "Female" | "Couple";
}

// Convert DB format to legacy Creator format
const dbToCreator = (db: DbCreator): Creator => {
  const resolvedImage = db.image 
    ? (imageMap[db.image] || db.image) 
    : placeholderImage;
  
  return {
    id: db.slug || db.id,
    name: db.name,
    tagline: db.niche || "",
    instagramHandle: db.instagram_handle,
    location: db.location || "",
    followers: db.followers || "",
    impressions: db.metrics?.monthlyImpressions || "",
    audience: db.metrics?.audienceDemo || "",
    partners: [],
    verticals: db.expertise || [],
    image: resolvedImage,
    bio: db.bio || undefined,
    metrics: db.metrics || undefined,
    isActive: true,
    platforms: db.tiktok_handle ? ["Instagram", "TikTok"] : ["Instagram"],
    gender: "Male", // Default, could be added to DB if needed
  };
};

export const useCreators = () => {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [dbCreators, setDbCreators] = useState<DbCreator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCreators = async () => {
    setIsLoading(true);
    setError(null);
    
    const { data, error: fetchError } = await supabase
      .from("creators")
      .select("*")
      .order("name");
    
    if (fetchError) {
      setError(fetchError.message);
      toast.error("Failed to load creators");
      setIsLoading(false);
      return;
    }
    
    const typedData = data as DbCreator[];
    setDbCreators(typedData);
    setCreators(typedData.map(dbToCreator));
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCreators();
  }, []);

  const updateCreator = async (updatedCreator: Creator) => {
    // Find the DB creator by slug or id
    const dbCreator = dbCreators.find(
      (c) => c.slug === updatedCreator.id || c.id === updatedCreator.id
    );
    
    if (!dbCreator) {
      toast.error("Creator not found");
      return false;
    }

    const { error: updateError } = await supabase
      .from("creators")
      .update({
        name: updatedCreator.name,
        instagram_handle: updatedCreator.instagramHandle,
        location: updatedCreator.location,
        followers: updatedCreator.followers,
        bio: updatedCreator.bio,
        niche: updatedCreator.tagline,
        expertise: updatedCreator.verticals,
        metrics: updatedCreator.metrics as unknown as null,
      })
      .eq("id", dbCreator.id);

    if (updateError) {
      toast.error("Failed to update creator");
      return false;
    }

    toast.success("Creator updated successfully");
    await fetchCreators(); // Refresh the list
    return true;
  };

  const getCreatorById = (id: string): Creator | undefined => {
    return creators.find((c) => c.id === id);
  };

  const getCreatorsByIds = (ids: string[]): Creator[] => {
    return creators.filter((c) => ids.includes(c.id));
  };

  return {
    creators,
    dbCreators,
    isLoading,
    error,
    updateCreator,
    getCreatorById,
    getCreatorsByIds,
    refetch: fetchCreators,
  };
};
