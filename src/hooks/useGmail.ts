import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface GmailEmail {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
}

interface GmailResponse {
  success?: boolean;
  count?: number;
  emails?: GmailEmail[];
  error?: string;
  needsAuth?: boolean;
  message?: string;
}

export const useGmail = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [emails, setEmails] = useState<GmailEmail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEmails = useCallback(async () => {
    if (!session?.access_token) {
      setNeedsAuth(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke<GmailResponse>('fetch-gmail', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (fnError) {
        console.error('Function error:', fnError);
        setError('Failed to fetch emails');
        toast({
          title: "Error",
          description: "Failed to fetch Gmail messages",
          variant: "destructive",
        });
        return;
      }

      if (data?.needsAuth) {
        setNeedsAuth(true);
        setError(data.message || 'Gmail authentication required');
        return;
      }

      if (data?.error) {
        setError(data.error);
        return;
      }

      if (data?.emails) {
        setEmails(data.emails);
        setNeedsAuth(false);
        toast({
          title: "Success",
          description: `Fetched ${data.count} emails from Gmail`,
        });
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [session, toast]);

  return {
    emails,
    isLoading,
    needsAuth,
    error,
    fetchEmails,
  };
};
