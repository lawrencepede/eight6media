import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SlackMessage {
  id: string;
  channel: string;
  sender: string;
  content: string;
  date: string;
}

interface SlackResponse {
  success?: boolean;
  error?: string;
  needsAuth?: boolean;
  slackError?: string;
  message?: string;
  channels?: string[];
  messageCount?: number;
}

export const useSlack = () => {
  const [messages, setMessages] = useState<SlackMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke<SlackResponse>("fetch-slack");

      if (fnError) {
        console.error("Slack function error:", fnError);
        setError(fnError.message);
        toast({
          title: "Slack Sync Failed",
          description: fnError.message,
          variant: "destructive",
        });
        return;
      }

      if (data?.needsAuth) {
        setNeedsAuth(true);
        return;
      }

      if (data?.error) {
        setError(data.error);
        toast({
          title: "Slack Error",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      // Fetch stored messages from talent_updates
      const { data: updates, error: fetchError } = await supabase
        .from("talent_updates")
        .select("*")
        .eq("source", "slack")
        .order("received_at", { ascending: false })
        .limit(50);

      if (fetchError) {
        console.error("Failed to fetch Slack updates:", fetchError);
        setError(fetchError.message);
        return;
      }

      const formattedMessages: SlackMessage[] = (updates || []).map((update) => ({
        id: update.id,
        channel: update.subject || "Unknown",
        sender: update.sender || "Unknown",
        content: update.content || "",
        date: update.received_at,
      }));

      setMessages(formattedMessages);
      setNeedsAuth(false);

      if (data?.messageCount !== undefined) {
        toast({
          title: "Slack Synced",
          description: `${data.messageCount} messages from ${data.channels?.length || 0} channels`,
        });
      }

    } catch (err) {
      console.error("Unexpected Slack error:", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      toast({
        title: "Slack Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    messages,
    isLoading,
    needsAuth,
    error,
    fetchMessages,
  };
};
