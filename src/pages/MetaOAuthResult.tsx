import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const MetaOAuthResult = () => {
  const [searchParams] = useSearchParams();
  const success = searchParams.get("success") === "true";
  const message = searchParams.get("message") || (success ? "Instagram connected successfully!" : "Connection failed.");

  useEffect(() => {
    // Post message to opener (parent window)
    if (window.opener) {
      window.opener.postMessage({ type: "meta-oauth-complete", success }, "*");
    }
  }, [success]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        {success ? (
          <CheckCircle className="w-16 h-16 text-accent mx-auto" />
        ) : (
          <XCircle className="w-16 h-16 text-destructive mx-auto" />
        )}

        <h1 className="text-2xl font-display text-primary">
          {success ? "Instagram Connected!" : "Connection Failed"}
        </h1>

        <p className="text-muted-foreground whitespace-pre-line">{message}</p>

        <Button onClick={() => window.close()}>
          Close Window
        </Button>
      </div>
    </div>
  );
};

export default MetaOAuthResult;
