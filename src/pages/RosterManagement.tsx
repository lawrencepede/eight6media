import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, ExternalLink, Table } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Creator, useCreators } from "@/hooks/useCreators";
import { toast } from "sonner";
import RosterTable from "@/components/RosterTable";
import { supabase } from "@/integrations/supabase/client";

const GOOGLE_SHEETS_EMBED_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTl_V694GodmVDA32ZXdsKurxDilhjeC4o7KpUG7M661CwjIJzr4zR03NFoaEvISJAu7CxIEvRx95uM/pubhtml?gid=2014316368&single=true&widget=true&headers=false";

const RosterManagement = () => {
  const { creators, isLoading, updateCreator, refetch } = useCreators();
  const [isSyncing, setIsSyncing] = useState(false);
  const [viewMode, setViewMode] = useState<"sheets" | "table">("sheets");

  const handleCreatorUpdate = async (updatedCreator: Creator) => {
    await updateCreator(updatedCreator);
  };

  const handleSyncFromSheets = async () => {
    setIsSyncing(true);
    toast.info("Syncing from Google Sheets...");
    
    try {
      const { data, error } = await supabase.functions.invoke("sync-google-sheets");
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data?.success) {
        toast.success(`Sync complete: ${data.inserted} added, ${data.updated} updated`);
        refetch();
      } else {
        toast.error(data?.error || "Sync failed");
        console.error("Sync response:", data);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Sync failed: ${errorMessage}`);
      console.error("Sync error:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/console" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-sans">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Console</span>
            </Link>
            <h1 className="font-sans text-lg font-semibold text-primary">Roster Management</h1>
            <div className="w-32" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl text-primary">ROSTER MANAGEMENT</h2>
            <p className="text-muted-foreground font-sans">Edit in Google Sheets, then sync to update the Talent page</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === "sheets" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("sheets")}
                className="gap-2 font-sans"
              >
                <ExternalLink className="w-4 h-4" />
                Google Sheets
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="gap-2 font-sans"
              >
                <Table className="w-4 h-4" />
                Table View
              </Button>
            </div>
            <Button
              onClick={handleSyncFromSheets}
              disabled={isSyncing}
              className="gap-2 font-script"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? "Syncing..." : "Sync to Database"}
            </Button>
          </div>
        </div>

        {viewMode === "sheets" ? (
          <div className="rounded-lg border border-border overflow-hidden bg-card">
            <iframe
              src={GOOGLE_SHEETS_EMBED_URL}
              className="w-full border-0"
              style={{ height: "calc(100vh - 280px)", minHeight: 500 }}
              title="Google Sheets Roster"
            />
          </div>
        ) : isLoading ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground font-sans">Loading creators...</p>
          </div>
        ) : (
          <RosterTable creators={creators} onUpdate={handleCreatorUpdate} />
        )}
      </div>
    </div>
  );
};

export default RosterManagement;
