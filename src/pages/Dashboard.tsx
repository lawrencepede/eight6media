import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useGmail } from "@/hooks/useGmail";
import { useSlack } from "@/hooks/useSlack";
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
import { formatDistanceToNow } from "date-fns";

const Dashboard = () => {
  const { user, signOut, connectGmail } = useAuth();
  const { emails, isLoading: isGmailLoading, needsAuth: gmailNeedsAuth, fetchEmails } = useGmail();
  const { messages: slackMessages, isLoading: isSlackLoading, needsAuth: slackNeedsAuth, fetchMessages: fetchSlack } = useSlack();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    await Promise.all([fetchEmails(), fetchSlack()]);
    setIsSyncing(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleConnectGmail = async () => {
    await connectGmail();
  };

  // Fetch data on mount if authenticated
  useEffect(() => {
    if (user) {
      if (!gmailNeedsAuth) fetchEmails();
      if (!slackNeedsAuth) fetchSlack();
    }
  }, [user]);

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
            <h2 className="font-serif text-2xl font-bold text-primary">Talent Updates</h2>
            <p className="text-muted-foreground">Latest communications from all channels</p>
          </div>
          <Button onClick={handleSync} disabled={isSyncing || isGmailLoading || isSlackLoading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${isSyncing || isGmailLoading || isSlackLoading ? "animate-spin" : ""}`} />
            {isSyncing || isGmailLoading || isSlackLoading ? "Syncing..." : "Sync All Channels"}
          </Button>
        </div>

        {/* Channel Tabs */}
        <Tabs defaultValue="gmail" className="w-full">
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
            {(emails.length > 0 || slackMessages.length > 0) ? (
              <div className="space-y-3">
                {/* Combine and sort all updates by date */}
                {[
                  ...emails.map(e => ({ ...e, type: 'email' as const, sortDate: new Date(e.date) })),
                  ...slackMessages.map(m => ({ ...m, type: 'slack' as const, sortDate: new Date(m.date) }))
                ]
                  .sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime())
                  .map((item) => (
                    item.type === 'email' 
                      ? <EmailCard key={`email-${item.id}`} email={item as any} />
                      : <SlackCard key={`slack-${item.id}`} message={item as any} />
                  ))}
              </div>
            ) : (
              <EmptyState 
                icon={<Clock className="w-12 h-12" />}
                title="No updates yet"
                description="Click 'Sync All Channels' to fetch the latest updates."
              />
            )}
          </TabsContent>

          <TabsContent value="slack">
            {slackNeedsAuth ? (
              <EmptyState 
                icon={<MessageSquare className="w-12 h-12" />}
                title="Slack not configured"
                description="Slack Bot Token needs to be configured by an admin."
              />
            ) : slackMessages.length > 0 ? (
              <div className="space-y-3">
                {slackMessages.map((msg) => (
                  <SlackCard key={msg.id} message={msg} />
                ))}
              </div>
            ) : (
              <EmptyState 
                icon={<MessageSquare className="w-12 h-12" />}
                title="No Slack messages yet"
                description="Click 'Sync All Channels' to fetch messages from channels the bot is in."
              />
            )}
          </TabsContent>

          <TabsContent value="asana">
            <EmptyState 
              icon={<CheckSquare className="w-12 h-12" />}
              title="Asana not connected"
              description="Asana integration coming soon."
            />
          </TabsContent>

          <TabsContent value="gmail">
            {gmailNeedsAuth ? (
              <EmptyState 
                icon={<Mail className="w-12 h-12" />}
                title="Gmail access needed"
                description="Sign in with Google to access your Gmail inbox. Each team member connects their own account."
                action={
                  <Button onClick={handleConnectGmail} className="mt-4 gap-2">
                    <Mail className="w-4 h-4" />
                    Connect Gmail
                  </Button>
                }
              />
            ) : emails.length > 0 ? (
              <div className="space-y-3">
                {emails.map((email) => (
                  <EmailCard key={email.id} email={email} />
                ))}
              </div>
            ) : (
              <EmptyState 
                icon={<Mail className="w-12 h-12" />}
                title="No emails yet"
                description="Click 'Sync All Channels' to fetch your latest emails."
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

interface EmailCardProps {
  email: {
    id: string;
    subject: string;
    from: string;
    date: string;
    snippet: string;
  };
}

const EmailCard = ({ email }: EmailCardProps) => {
  const fromName = email.from.split('<')[0].trim() || email.from;
  let timeAgo = '';
  try {
    timeAgo = formatDistanceToNow(new Date(email.date), { addSuffix: true });
  } catch {
    timeAgo = email.date;
  }

  return (
    <div className="bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              <Mail className="w-3 h-3" />
              Gmail
            </span>
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
          </div>
          <h4 className="font-medium text-primary truncate">{email.subject}</h4>
          <p className="text-sm text-muted-foreground">{fromName}</p>
          <p className="text-sm text-foreground/70 mt-2 line-clamp-2">{email.snippet}</p>
        </div>
      </div>
    </div>
  );
};

interface SlackCardProps {
  message: {
    id: string;
    channel: string;
    sender: string;
    content: string;
    date: string;
  };
}

const SlackCard = ({ message }: SlackCardProps) => {
  let timeAgo = '';
  try {
    timeAgo = formatDistanceToNow(new Date(message.date), { addSuffix: true });
  } catch {
    timeAgo = message.date;
  }

  return (
    <div className="bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-accent-foreground bg-accent px-2 py-0.5 rounded-full">
              <MessageSquare className="w-3 h-3" />
              Slack
            </span>
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
          </div>
          <h4 className="font-medium text-primary truncate">{message.channel}</h4>
          <p className="text-sm text-muted-foreground">{message.sender}</p>
          <p className="text-sm text-foreground/70 mt-2 line-clamp-2">{message.content}</p>
        </div>
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
