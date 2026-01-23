import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Deal {
  id: string;
  talent_name: string;
  brand_name: string;
  status: string;
  notes: string | null;
  synced_at: string;
}

interface CanvasPreview {
  talent_name: string;
  canvas_content: string;
  deals_count: number;
  deal_summaries: Array<{
    brand: string;
    status: string;
    key_updates: string[];
    next_steps: string[];
  }>;
}

export function useTalentDeals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [talents, setTalents] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [preview, setPreview] = useState<CanvasPreview | null>(null);
  const { toast } = useToast();

  const fetchDeals = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("deals")
        .select("*")
        .order("talent_name", { ascending: true });

      if (error) throw error;

      setDeals(data || []);
      
      // Extract unique talent names
      const uniqueTalents = [...new Set((data || []).map(d => d.talent_name))];
      setTalents(uniqueTalents);
    } catch (error) {
      console.error("Error fetching deals:", error);
      toast({
        title: "Error",
        description: "Failed to fetch deals",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const syncDeals = useCallback(async () => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("sync-deals");

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Deals Synced",
          description: data.message,
        });
        // Refresh deals after sync
        await fetchDeals();
      } else {
        throw new Error(data.error || "Sync failed");
      }
    } catch (error) {
      console.error("Error syncing deals:", error);
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Failed to sync deals from Google Sheets",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  }, [toast, fetchDeals]);

  const generatePreview = useCallback(async (talentName: string) => {
    setIsGenerating(true);
    setPreview(null);
    try {
      const { data, error } = await supabase.functions.invoke("generate-talent-canvas", {
        body: { talent_name: talentName, preview_only: true },
      });

      if (error) throw error;

      if (data.success && data.preview) {
        setPreview({
          talent_name: data.talent_name,
          canvas_content: data.canvas_content,
          deals_count: data.deals_count,
          deal_summaries: data.deal_summaries,
        });
        return data;
      } else {
        throw new Error(data.error || "Preview generation failed");
      }
    } catch (error) {
      console.error("Error generating preview:", error);
      toast({
        title: "Preview Failed",
        description: error instanceof Error ? error.message : "Failed to generate preview",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [toast]);

  const publishCanvas = useCallback(async (talentName: string) => {
    setIsPublishing(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-talent-canvas", {
        body: { talent_name: talentName, preview_only: false },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Canvas Published",
          description: `Posted to ${data.channel}`,
        });
        setPreview(null);
        return data;
      } else {
        throw new Error(data.error || "Publish failed");
      }
    } catch (error) {
      console.error("Error publishing canvas:", error);
      toast({
        title: "Publish Failed",
        description: error instanceof Error ? error.message : "Failed to publish canvas",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsPublishing(false);
    }
  }, [toast]);

  const clearPreview = useCallback(() => {
    setPreview(null);
  }, []);

  const getDealsForTalent = useCallback((talentName: string) => {
    return deals.filter(d => d.talent_name === talentName);
  }, [deals]);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  return {
    deals,
    talents,
    isLoading,
    isSyncing,
    isGenerating,
    isPublishing,
    preview,
    fetchDeals,
    syncDeals,
    generatePreview,
    publishCanvas,
    clearPreview,
    getDealsForTalent,
  };
}
