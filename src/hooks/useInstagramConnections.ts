import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DiscoveredAccount {
  ig_account_id: string;
  username: string;
  followers_count: number;
  profile_picture_url: string | null;
}

interface InstagramConnection {
  id: string;
  creator_id: string | null;
  instagram_user_id: string;
  instagram_username: string;
  ig_business_account_id: string | null;
  page_id: string | null;
  page_name: string | null;
  created_at: string;
  updated_at: string;
  creator?: {
    id: string;
    name: string;
  };
}

interface InstagramInsights {
  id: string;
  connection_id: string;
  metric_date: string;
  followers_count: number | null;
  media_count: number | null;
  impressions: number | null;
  reach: number | null;
  profile_views: number | null;
  website_clicks: number | null;
  engagement_rate: number | null;
  raw_data: Record<string, unknown>;
  created_at: string;
}

export function useInstagramConnections() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const connectionsQuery = useQuery({
    queryKey: ["instagram-connections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("instagram_connections")
        .select(`
          *,
          creator:creators(id, name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as unknown as InstagramConnection[];
    },
  });

  const discoverAccounts = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("meta-discover-accounts");
      if (error) throw error;
      return data as { accounts: DiscoveredAccount[] };
    },
    onError: (error) => {
      toast({
        title: "Discovery Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const connectAccount = useMutation({
    mutationFn: async ({ account, creatorId }: { account: DiscoveredAccount; creatorId?: string }) => {
      const { error } = await supabase
        .from("instagram_connections")
        .upsert({
          instagram_user_id: account.ig_account_id,
          instagram_username: account.username,
          ig_business_account_id: account.ig_account_id,
          creator_id: creatorId || null,
          updated_at: new Date().toISOString(),
        } as any, {
          onConflict: "instagram_user_id",
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Account Connected",
        description: "Instagram account has been linked.",
      });
      queryClient.invalidateQueries({ queryKey: ["instagram-connections"] });
    },
    onError: (error) => {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const fetchInsights = useMutation({
    mutationFn: async (connectionId: string) => {
      const { data, error } = await supabase.functions.invoke("fetch-instagram-insights", {
        body: { connection_id: connectionId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Insights Fetched",
        description: "Instagram insights have been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["instagram-insights"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Fetch Insights",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteConnection = useMutation({
    mutationFn: async (connectionId: string) => {
      const { error } = await supabase
        .from("instagram_connections")
        .delete()
        .eq("id", connectionId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Connection Removed",
        description: "Instagram connection has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["instagram-connections"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Remove",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    connections: connectionsQuery.data || [],
    isLoading: connectionsQuery.isLoading,
    error: connectionsQuery.error,
    discoverAccounts,
    connectAccount,
    fetchInsights,
    deleteConnection,
  };
}

export function useInstagramInsights(connectionId?: string) {
  return useQuery({
    queryKey: ["instagram-insights", connectionId],
    queryFn: async () => {
      let query = supabase
        .from("instagram_insights")
        .select("*")
        .order("metric_date", { ascending: false })
        .limit(30);

      if (connectionId) {
        query = query.eq("connection_id", connectionId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as InstagramInsights[];
    },
    enabled: !!connectionId || connectionId === undefined,
  });
}
