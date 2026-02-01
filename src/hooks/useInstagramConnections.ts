import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface InstagramConnection {
  id: string;
  creator_id: string | null;
  instagram_user_id: string;
  instagram_username: string;
  token_expires_at: string | null;
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
      return data as InstagramConnection[];
    },
  });

  const startOAuth = useMutation({
    mutationFn: async (creatorId?: string) => {
      const functionPath = creatorId 
        ? `meta-oauth-start?creator_id=${encodeURIComponent(creatorId)}`
        : "meta-oauth-start";

      const { data, error } = await supabase.functions.invoke(functionPath);

      if (error) throw error;
      return data as { auth_url: string };
    },
    onSuccess: (data) => {
      // Open OAuth in a popup
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const popup = window.open(
        data.auth_url,
        "meta-oauth",
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Listen for completion
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === "meta-oauth-complete") {
          window.removeEventListener("message", handleMessage);
          queryClient.invalidateQueries({ queryKey: ["instagram-connections"] });
          
          if (event.data.success) {
            toast({
              title: "Instagram Connected",
              description: "Successfully connected Instagram account.",
            });
          }
        }
      };

      window.addEventListener("message", handleMessage);

      // Also poll for popup close
      const pollTimer = setInterval(() => {
        if (popup?.closed) {
          clearInterval(pollTimer);
          queryClient.invalidateQueries({ queryKey: ["instagram-connections"] });
        }
      }, 1000);
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
    startOAuth,
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
