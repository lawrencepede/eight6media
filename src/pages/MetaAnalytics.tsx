import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LogOut, 
  User,
  ArrowLeft,
  Instagram,
  RefreshCw,
  Trash2,
  Users,
  Eye,
  MousePointer,
  TrendingUp,
  Search,
} from "lucide-react";
import PasswordGate from "@/components/PasswordGate";
import { useInstagramConnections, useInstagramInsights } from "@/hooks/useInstagramConnections";
import { useCreators } from "@/hooks/useCreators";
import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const MetaAnalytics = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { connections, isLoading, discoverAccounts, connectAccount, fetchInsights, deleteConnection } = useInstagramConnections();
  const { creators } = useCreators();
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | undefined>();
  const { data: insights } = useInstagramInsights(selectedConnectionId);
  const [showDiscoverDialog, setShowDiscoverDialog] = useState(false);
  const [linkingCreatorId, setLinkingCreatorId] = useState<Record<string, string>>({});

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth", { replace: true });
  };

  const handleDiscover = () => {
    setShowDiscoverDialog(true);
    discoverAccounts.mutate();
  };

  const handleConnectAccount = (account: { ig_account_id: string; username: string; followers_count: number; profile_picture_url: string | null }) => {
    connectAccount.mutate(
      { account, creatorId: linkingCreatorId[account.ig_account_id] || undefined },
      { onSuccess: () => setShowDiscoverDialog(false) }
    );
  };

  const handleFetchInsights = (connectionId: string) => {
    fetchInsights.mutate(connectionId);
  };

  const handleDeleteConnection = (connectionId: string) => {
    deleteConnection.mutate(connectionId);
  };

  const latestInsight = insights?.[0];

  // Filter out already-connected account IDs
  const connectedIds = new Set(connections.map((c) => c.instagram_user_id));

  return (
    <PasswordGate>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link to="/console" className="text-muted-foreground hover:text-primary transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <Link to="/" className="font-display text-2xl tracking-tight">
                  <span className="text-primary">EIGHT</span>
                  <span className="text-accent">-SIX</span>
                </Link>
              </div>
              <h1 className="font-sans text-lg font-semibold text-primary">Meta Analytics</h1>
              <div className="flex items-center gap-4">
                {user && (
                  <>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span className="font-sans">{user.email}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleSignOut} className="font-sans">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="font-display text-3xl text-primary mb-2">Instagram Analytics</h2>
            <p className="text-muted-foreground">
              Discover and connect Instagram accounts from your Business Manager to track insights.
            </p>
          </div>

          {/* Discover Accounts */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Instagram className="w-5 h-5" />
                Connect Instagram Accounts
              </CardTitle>
              <CardDescription>
                Discover Instagram accounts your Business Manager has access to, then link them to your roster.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleDiscover} disabled={discoverAccounts.isPending}>
                <Search className="w-4 h-4 mr-2" />
                {discoverAccounts.isPending ? "Discovering..." : "Discover Accounts"}
              </Button>
            </CardContent>
          </Card>

          {/* Discover Dialog */}
          <Dialog open={showDiscoverDialog} onOpenChange={setShowDiscoverDialog}>
            <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Discovered Accounts</DialogTitle>
                <DialogDescription>
                  Select an account to connect and optionally link it to a roster creator.
                </DialogDescription>
              </DialogHeader>
              {discoverAccounts.isPending ? (
                <div className="text-center py-8 text-muted-foreground">Fetching accounts...</div>
              ) : discoverAccounts.data?.accounts?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No Instagram accounts found. Make sure your Business Manager has partner access to creator accounts.
                </div>
              ) : (
                <div className="space-y-4">
                  {(discoverAccounts.data?.accounts || []).map((account) => {
                    const alreadyConnected = connectedIds.has(account.ig_account_id);
                    return (
                      <div key={account.ig_account_id} className="flex flex-col gap-2 p-4 rounded-lg border border-border">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                              <Instagram className="w-5 h-5 text-accent-foreground" />
                            </div>
                            <div>
                              <div className="font-semibold">@{account.username}</div>
                              <div className="text-sm text-muted-foreground">
                                {account.followers_count.toLocaleString()} followers
                              </div>
                            </div>
                          </div>
                          {alreadyConnected ? (
                            <span className="text-sm text-muted-foreground">Already connected</span>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleConnectAccount(account)}
                              disabled={connectAccount.isPending}
                            >
                              Connect
                            </Button>
                          )}
                        </div>
                        {!alreadyConnected && creators.length > 0 && (
                          <Select
                            value={linkingCreatorId[account.ig_account_id] || ""}
                            onValueChange={(val) =>
                              setLinkingCreatorId((prev) => ({ ...prev, [account.ig_account_id]: val }))
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Link to roster creator (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                              {creators.map((creator) => (
                                <SelectItem key={creator.id} value={creator.id}>
                                  {creator.name} • {creator.instagramHandle}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Connected Accounts */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Connected Accounts</CardTitle>
              <CardDescription>
                {connections.length} account{connections.length !== 1 ? "s" : ""} connected
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : connections.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No Instagram accounts connected yet. Click "Discover Accounts" to get started.
                </div>
              ) : (
                <div className="space-y-4">
                  {connections.map((connection) => (
                    <div
                      key={connection.id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        selectedConnectionId === connection.id
                          ? "border-accent bg-accent/5"
                          : "border-border"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                          <Instagram className="w-5 h-5 text-accent-foreground" />
                        </div>
                        <div>
                          <div className="font-semibold">@{connection.instagram_username}</div>
                          <div className="text-sm text-muted-foreground">
                            {connection.creator?.name ? (
                              <span>Linked to {connection.creator.name}</span>
                            ) : (
                              <span>Not linked to roster</span>
                            )}
                            {" · "}
                            Connected {formatDistanceToNow(new Date(connection.created_at), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedConnectionId(
                            selectedConnectionId === connection.id ? undefined : connection.id
                          )}
                        >
                          {selectedConnectionId === connection.id ? "Hide" : "View"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFetchInsights(connection.id)}
                          disabled={fetchInsights.isPending}
                        >
                          <RefreshCw className={`w-4 h-4 ${fetchInsights.isPending ? "animate-spin" : ""}`} />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Connection?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove the Instagram connection for @{connection.instagram_username}. 
                                All stored insights will also be deleted.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteConnection(connection.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Insights Display */}
          {selectedConnectionId && latestInsight && (
            <Card>
              <CardHeader>
                <CardTitle>Latest Insights</CardTitle>
                <CardDescription>
                  Data from {format(new Date(latestInsight.metric_date), "MMMM d, yyyy")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-muted">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">Followers</span>
                    </div>
                    <div className="text-2xl font-bold">
                      {latestInsight.followers_count?.toLocaleString() || "—"}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">Reach</span>
                    </div>
                    <div className="text-2xl font-bold">
                      {latestInsight.reach?.toLocaleString() || "—"}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <MousePointer className="w-4 h-4" />
                      <span className="text-sm">Profile Views</span>
                    </div>
                    <div className="text-2xl font-bold">
                      {latestInsight.profile_views?.toLocaleString() || "—"}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">Engagement</span>
                    </div>
                    <div className="text-2xl font-bold">
                      {latestInsight.engagement_rate ? `${latestInsight.engagement_rate}%` : "—"}
                    </div>
                  </div>
                </div>

                {insights && insights.length > 1 && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-3">Historical Data</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Date</th>
                            <th className="text-right py-2">Followers</th>
                            <th className="text-right py-2">Reach</th>
                            <th className="text-right py-2">Impressions</th>
                            <th className="text-right py-2">Profile Views</th>
                          </tr>
                        </thead>
                        <tbody>
                          {insights.slice(0, 7).map((insight) => (
                            <tr key={insight.id} className="border-b border-border/50">
                              <td className="py-2">{format(new Date(insight.metric_date), "MMM d")}</td>
                              <td className="text-right py-2">{insight.followers_count?.toLocaleString() || "—"}</td>
                              <td className="text-right py-2">{insight.reach?.toLocaleString() || "—"}</td>
                              <td className="text-right py-2">{insight.impressions?.toLocaleString() || "—"}</td>
                              <td className="text-right py-2">{insight.profile_views?.toLocaleString() || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PasswordGate>
  );
};

export default MetaAnalytics;
