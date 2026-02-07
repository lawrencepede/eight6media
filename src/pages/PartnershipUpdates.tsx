import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useGmail } from "@/hooks/useGmail";
import { useSlack } from "@/hooks/useSlack";
import { useTalentDeals, DealSummary } from "@/hooks/useTalentDeals";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CanvasPreviewTable } from "@/components/CanvasPreviewTable";
import { 
  ArrowLeft, 
  Mail, 
  MessageSquare, 
  CheckSquare, 
  RefreshCw,
  Clock,
  FileText,
  Download,
  Send,
  Eye,
  X,
  Tag,
  Sparkles,
  LogOut,
  User as UserIcon
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const PartnershipUpdates = () => {
  const { user, connectGmail, signOut } = useAuth();
  const navigate = useNavigate();
  const { emails, isLoading: isGmailLoading, needsAuth: gmailNeedsAuth, fetchEmails } = useGmail();
  const { messages: slackMessages, isLoading: isSlackLoading, needsAuth: slackNeedsAuth, fetchMessages: fetchSlack } = useSlack();
  const { 
    talents, 
    isSyncing: isDealsSyncing, 
    isGenerating, 
    isPublishing, 
    isTagging,
    preview, 
    syncDeals, 
    tagUpdates,
    generatePreview, 
    publishCanvas, 
    updatePreviewSummaries, 
    clearPreview 
  } = useTalentDeals();
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedTalent, setSelectedTalent] = useState<string>("");
  const [editedSummaries, setEditedSummaries] = useState<DealSummary[]>([]);

  const handleSync = async () => {
    setIsSyncing(true);
    await Promise.all([fetchEmails(), fetchSlack()]);
    setIsSyncing(false);
    
    // Auto-trigger tagging after sync
    await tagUpdates();
  };

  const handleConnectGmail = async () => {
    await connectGmail();
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth", { replace: true });
  };

  const handleGeneratePreview = async () => {
    if (selectedTalent) {
      const result = await generatePreview(selectedTalent);
      if (result?.deal_summaries) {
        setEditedSummaries(result.deal_summaries);
      }
    }
  };

  const handlePublish = async () => {
    if (selectedTalent) {
      await publishCanvas(selectedTalent, editedSummaries);
    }
  };

  const handleSummariesChange = (summaries: DealSummary[]) => {
    setEditedSummaries(summaries);
    updatePreviewSummaries(summaries);
  };

  // Fetch data on mount if authenticated
  useEffect(() => {
    if (user) {
      if (!gmailNeedsAuth) fetchEmails();
      if (!slackNeedsAuth) fetchSlack();
    }
  }, [user]);

  const newOpportunitiesCount = preview?.new_opportunities_count || 0;

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/console" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-sans">
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Console</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Return to the main console dashboard</p>
                </TooltipContent>
              </Tooltip>
              <h1 className="font-sans text-lg font-semibold text-primary">Partnership Updates</h1>
              <div className="flex items-center gap-4">
                {user && (
                  <>
                    <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                      <UserIcon className="w-4 h-4" />
                      <span className="font-sans">{user.email}</span>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleSignOut}
                          className="font-sans"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Sign out of your account</p>
                      </TooltipContent>
                    </Tooltip>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

      <div className="container mx-auto px-6 py-8">
        {/* Talent Canvases Section */}
        <div className="bg-card rounded-xl border border-border p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-sans text-lg font-semibold text-primary flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Talent Canvases
              </h3>
              <p className="text-sm text-muted-foreground font-sans">Generate deal summary canvases for Slack channels</p>
            </div>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={tagUpdates} 
                    disabled={isTagging}
                    className="gap-2 font-sans"
                  >
                    <Tag className={`w-4 h-4 ${isTagging ? "animate-pulse" : ""}`} />
                    {isTagging ? "Tagging..." : "Re-tag Updates"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Use AI to tag updates with talent names</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={syncDeals} 
                    disabled={isDealsSyncing}
                    className="gap-2 font-sans"
                  >
                    <Download className={`w-4 h-4 ${isDealsSyncing ? "animate-spin" : ""}`} />
                    {isDealsSyncing ? "Syncing..." : "Sync Deals"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Import latest deals from Google Sheets</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={selectedTalent} onValueChange={setSelectedTalent}>
              <SelectTrigger className="w-64 font-sans">
                <SelectValue placeholder="Select a talent..." />
              </SelectTrigger>
              <SelectContent>
                {talents.map((talent) => (
                  <SelectItem key={talent} value={talent} className="font-sans">
                    {talent}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={handleGeneratePreview} 
                  disabled={!selectedTalent || isGenerating}
                  className="gap-2 font-script"
                >
                  <Eye className={`w-4 h-4 ${isGenerating ? "animate-pulse" : ""}`} />
                  {isGenerating ? "Generating..." : "Preview Canvas"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Generate a deal summary canvas for the selected talent</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          {/* Preview Section */}
          {preview && (
            <div className="mt-4 border border-border rounded-lg overflow-hidden">
              <div className="bg-muted/50 p-3 flex items-center justify-between border-b border-border">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="font-sans font-medium text-sm">Preview for {preview.talent_name}</span>
                  <span className="text-xs text-muted-foreground font-sans">({preview.deals_count} brands)</span>
                  {newOpportunitiesCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full font-sans">
                      <Sparkles className="w-3 h-3" />
                      {newOpportunitiesCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handlePublish}
                        disabled={isPublishing}
                        size="sm"
                        className="gap-2 font-script"
                      >
                        <Send className={`w-4 h-4 ${isPublishing ? "animate-pulse" : ""}`} />
                        {isPublishing ? "Publishing..." : "Publish to Slack"}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Post this canvas to the talent's Slack channel</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={clearPreview}
                        variant="ghost"
                        size="sm"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Close preview</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <div className="p-4 bg-card max-h-[500px] overflow-y-auto">
                <CanvasPreviewTable
                  dealSummaries={editedSummaries}
                  weekRange={preview.week_range}
                  onSummariesChange={handleSummariesChange}
                />
              </div>
            </div>
          )}
          
          {talents.length === 0 && (
            <p className="text-sm text-muted-foreground mt-3 font-sans">
              No deals found. Click "Sync Deals" to import from Google Sheets.
            </p>
          )}
        </div>

        {/* Sync Button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl text-primary">TALENT UPDATES</h2>
            <p className="text-muted-foreground font-sans">Latest communications from all channels</p>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={handleSync} 
                disabled={isSyncing || isGmailLoading || isSlackLoading || isTagging} 
                className="gap-2 font-script"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing || isGmailLoading || isSlackLoading || isTagging ? "animate-spin" : ""}`} />
                {isTagging ? "Tagging..." : isSyncing || isGmailLoading || isSlackLoading ? "Syncing..." : "Sync All Channels"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Fetch latest updates from Gmail and Slack</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Channel Tabs */}
        <Tabs defaultValue="gmail" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all" className="gap-2 font-sans">
              <Clock className="w-4 h-4" />
              All Updates
            </TabsTrigger>
            <TabsTrigger value="slack" className="gap-2 font-sans">
              <MessageSquare className="w-4 h-4" />
              Slack
            </TabsTrigger>
            <TabsTrigger value="asana" className="gap-2 font-sans">
              <CheckSquare className="w-4 h-4" />
              Asana
            </TabsTrigger>
            <TabsTrigger value="gmail" className="gap-2 font-sans">
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
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button onClick={handleConnectGmail} className="mt-4 gap-2 font-script">
                        <Mail className="w-4 h-4" />
                        Connect Gmail
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Link your Gmail account to sync emails</p>
                    </TooltipContent>
                  </Tooltip>
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
    </TooltipProvider>
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
            <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full font-sans">
              <Mail className="w-3 h-3" />
              Gmail
            </span>
            <span className="text-xs text-muted-foreground font-sans">{timeAgo}</span>
          </div>
          <h4 className="font-sans font-medium text-primary truncate">{email.subject}</h4>
          <p className="text-sm text-muted-foreground font-sans">{fromName}</p>
          <p className="text-sm text-foreground/70 mt-2 line-clamp-2 font-sans">{email.snippet}</p>
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
            <span className="inline-flex items-center gap-1 text-xs font-medium text-accent-foreground bg-accent px-2 py-0.5 rounded-full font-sans">
              <MessageSquare className="w-3 h-3" />
              Slack
            </span>
            <span className="text-xs text-muted-foreground font-sans">{timeAgo}</span>
          </div>
          <h4 className="font-sans font-medium text-primary truncate">{message.channel}</h4>
          <p className="text-sm text-muted-foreground font-sans">{message.sender}</p>
          <p className="text-sm text-foreground/70 mt-2 line-clamp-2 font-sans">{message.content}</p>
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
    <h3 className="font-sans font-semibold text-primary mb-2">{title}</h3>
    <p className="text-muted-foreground max-w-md mx-auto font-sans">{description}</p>
    {action}
  </div>
);

export default PartnershipUpdates;
