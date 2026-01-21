import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  LogOut, 
  Mail, 
  MessageSquare, 
  CheckSquare, 
  RefreshCw,
  User,
  Clock
} from "lucide-react";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    // TODO: Implement sync logic
    setTimeout(() => setIsSyncing(false), 2000);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Site</span>
            </Link>
            <h1 className="font-serif text-xl font-bold text-primary">Team Dashboard</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span>{user?.email}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Sync Button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-serif text-2xl font-bold text-primary">Client Updates</h2>
            <p className="text-muted-foreground">Latest communications from all channels</p>
          </div>
          <Button onClick={handleSync} disabled={isSyncing} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Syncing..." : "Sync All Channels"}
          </Button>
        </div>

        {/* Channel Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all" className="gap-2">
              <Clock className="w-4 h-4" />
              All Updates
            </TabsTrigger>
            <TabsTrigger value="slack" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Slack
            </TabsTrigger>
            <TabsTrigger value="asana" className="gap-2">
              <CheckSquare className="w-4 h-4" />
              Asana
            </TabsTrigger>
            <TabsTrigger value="gmail" className="gap-2">
              <Mail className="w-4 h-4" />
              Gmail
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <EmptyState 
              icon={<Clock className="w-12 h-12" />}
              title="No updates yet"
              description="Click 'Sync All Channels' to fetch the latest updates from Slack and Asana."
            />
          </TabsContent>

          <TabsContent value="slack">
            <EmptyState 
              icon={<MessageSquare className="w-12 h-12" />}
              title="Slack not connected"
              description="Connect your Slack workspace to see channel messages."
              action={
                <Button variant="outline" className="mt-4">
                  Connect Slack
                </Button>
              }
            />
          </TabsContent>

          <TabsContent value="asana">
            <EmptyState 
              icon={<CheckSquare className="w-12 h-12" />}
              title="Asana not connected"
              description="Connect your Asana workspace to see task updates."
              action={
                <Button variant="outline" className="mt-4">
                  Connect Asana
                </Button>
              }
            />
          </TabsContent>

          <TabsContent value="gmail">
            <EmptyState 
              icon={<Mail className="w-12 h-12" />}
              title="Gmail access needed"
              description="Sign in with Google to access your Gmail inbox. Each team member connects their own account."
              action={
                <Button variant="outline" className="mt-4">
                  Connect Gmail
                </Button>
              }
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => (
  <div className="text-center py-16 bg-card rounded-2xl border border-border">
    <div className="text-muted-foreground mb-4">{icon}</div>
    <h3 className="font-semibold text-primary mb-2">{title}</h3>
    <p className="text-muted-foreground max-w-md mx-auto">{description}</p>
    {action}
  </div>
);

export default Dashboard;
