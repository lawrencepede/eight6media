import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  LogOut, 
  User,
  MessageSquare,
  Users,
  Sparkles,
  Settings,
  ArrowRight,
  BarChart3,
  Palette,
  UserPlus
} from "lucide-react";
import PasswordGate from "@/components/PasswordGate";

interface ToolCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  to: string;
  available?: boolean;
}

const ToolCard = ({ title, description, icon, to, available = true }: ToolCardProps) => (
  <Link
    to={available ? to : "#"}
    className={`block p-6 bg-card border border-border rounded-lg transition-all ${
      available 
        ? "hover:border-accent hover:shadow-lg cursor-pointer" 
        : "opacity-50 cursor-not-allowed"
    }`}
  >
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-muted rounded-lg text-primary">
          {icon}
        </div>
        <div>
          <h3 className="font-sans text-lg font-semibold text-primary">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
      {available && <ArrowRight className="w-5 h-5 text-muted-foreground" />}
    </div>
    {!available && (
      <span className="inline-block mt-3 text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
        Coming Soon
      </span>
    )}
  </Link>
);

const BackendConsole = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth", { replace: true });
  };

  const tools = [
    {
      title: "Partnership Updates",
      description: "Sync Gmail and Slack channels, generate weekly talent canvases",
      icon: <MessageSquare className="w-6 h-6" />,
      to: "/console/partnership-updates",
      available: true,
    },
    {
      title: "Roster Management",
      description: "Edit creator profiles, sync from Google Sheets, manage talent data",
      icon: <Users className="w-6 h-6" />,
      to: "/console/roster",
      available: true,
    },
    {
      title: "Custom Roster Generator",
      description: "Create branded pitch decks with curated creator selections",
      icon: <Sparkles className="w-6 h-6" />,
      to: "/console/pitch-generator",
      available: true,
    },
    {
      title: "Meta Analytics",
      description: "Connect Instagram accounts and track real-time insights",
      icon: <BarChart3 className="w-6 h-6" />,
      to: "/console/meta-analytics",
      available: true,
    },
    {
      title: "Brand Assets",
      description: "Fetch brand logos via Brandfetch, link brands to talent with deal details",
      icon: <Palette className="w-6 h-6" />,
      to: "/console/brand-manager",
      available: true,
    },
    {
      title: "Settings",
      description: "Configure integrations, API keys, and account settings",
      icon: <Settings className="w-6 h-6" />,
      to: "/console/settings",
      available: false,
    },
  ];

  return (
    <PasswordGate>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="font-display text-2xl tracking-tight">
                <span className="text-primary">EIGHT</span>
                <span className="text-accent">-SIX</span>
              </Link>
              <h1 className="font-sans text-lg font-semibold text-primary">Backend Console</h1>
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

        <div className="container mx-auto px-6 py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl md:text-5xl text-primary mb-4">
              EIGHT-SIX BACKEND CONSOLE
            </h2>
            <p className="font-sans text-lg text-muted-foreground max-w-2xl mx-auto">
              Internal tools for managing talent partnerships, roster data, and brand outreach.
            </p>
          </div>

          {/* Tools Grid */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {tools.map((tool) => (
              <ToolCard key={tool.title} {...tool} />
            ))}
          </div>

          {/* Placeholder for future tools */}
          <div className="mt-12 text-center">
            <p className="font-sans text-sm text-muted-foreground">
              More tools coming soon. Contact the dev team to request new features.
            </p>
          </div>
        </div>
      </div>
    </PasswordGate>
  );
};

export default BackendConsole;
