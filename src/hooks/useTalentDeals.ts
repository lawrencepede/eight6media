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

export function useTalentDeals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [talents, setTalents] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
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

  const generateCanvas = useCallback(async (talentName: string) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-talent-canvas", {
        body: { talent_name: talentName },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Canvas Generated",
          description: `Posted to ${data.channel}`,
        });
        return data;
      } else {
        throw new Error(data.error || "Generation failed");
      }
    } catch (error) {
      console.error("Error generating canvas:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate canvas",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [toast]);

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
    fetchDeals,
    syncDeals,
    generateCanvas,
    getDealsForTalent,
  };
}
