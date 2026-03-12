import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BrandAsset {
  id: string;
  name: string;
  domain: string;
  logo_url: string | null;
  icon_url: string | null;
  brand_colors: any[];
  industry: string | null;
  description: string | null;
  raw_data: any;
  created_at: string;
  updated_at: string;
}

export interface TalentBrandRelationship {
  id: string;
  creator_id: string;
  brand_id: string;
  campaign_name: string | null;
  deal_value: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  brand_assets?: BrandAsset;
  creators?: { id: string; name: string; instagram_handle: string; image: string | null };
}

export const useBrandAssets = () => {
  return useQuery({
    queryKey: ["brand-assets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brand_assets")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as BrandAsset[];
    },
  });
};

export const useTalentBrandRelationships = (creatorId?: string) => {
  return useQuery({
    queryKey: ["talent-brand-relationships", creatorId],
    queryFn: async () => {
      let query = supabase
        .from("talent_brand_relationships")
        .select("*, brand_assets(*), creators(id, name, instagram_handle, image)")
        .order("created_at", { ascending: false });

      if (creatorId) {
        query = query.eq("creator_id", creatorId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as TalentBrandRelationship[];
    },
  });
};

export const useFetchBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (domain: string) => {
      const { data, error } = await supabase.functions.invoke("fetch-brand-assets", {
        body: { domain },
      });
      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      return data.brand as BrandAsset;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brand-assets"] });
      toast.success("Brand fetched and saved!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to fetch brand: ${error.message}`);
    },
  });
};

export const useLinkTalentBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      creator_id: string;
      brand_id: string;
      campaign_name?: string;
      deal_value?: string;
      status?: string;
      start_date?: string;
      end_date?: string;
      notes?: string;
    }) => {
      const { error } = await supabase
        .from("talent_brand_relationships")
        .insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["talent-brand-relationships"] });
      toast.success("Brand linked to talent!");
    },
    onError: (error: Error) => {
      toast.error(`Failed to link: ${error.message}`);
    },
  });
};

export const useDeleteTalentBrandLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("talent_brand_relationships")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["talent-brand-relationships"] });
      toast.success("Relationship removed");
    },
  });
};
