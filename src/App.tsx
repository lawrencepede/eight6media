import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import NavigationV2 from "@/components/v2/Navigation";
import VersionToggle from "@/components/VersionToggle";
import ScrollToTop from "@/components/ScrollToTop";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useIsNotAgencyHost } from "@/hooks/useIsNotAgencyHost";
import Index from "./pages/Index";
import NotAgency from "./pages/NotAgency";
import Work from "./pages/Work";
import Roster from "./pages/Roster";
import ForBrands from "./pages/ForBrands";
import ForCreators from "./pages/ForCreators";
import About from "./pages/About";
import Admin from "./pages/Admin";
import Pitch from "./pages/Pitch";
import Auth from "./pages/Auth";
import BackendConsole from "./pages/BackendConsole";
import PartnershipUpdates from "./pages/PartnershipUpdates";
import RosterManagement from "./pages/RosterManagement";
import PitchGenerator from "./pages/PitchGenerator";
import MetaAnalytics from "./pages/MetaAnalytics";
import BrandManager from "./pages/BrandManager";
import ContactSourcing from "./pages/ContactSourcing";
import IndexV2 from "./pages/v2/Index";
import WorkV2 from "./pages/v2/Work";
import RosterV2 from "./pages/v2/Roster";
import ForBrandsV2 from "./pages/v2/ForBrands";
import ForCreatorsV2 from "./pages/v2/ForCreators";
import AboutV2 from "./pages/v2/About";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppShell = () => {
  const isNotAgencyHost = useIsNotAgencyHost();
  const location = useLocation();
  const path = location.pathname;
  const isNotAgencyRoute = path === "/notagency";
  const isV2 = path === "/v2" || path.startsWith("/v2/");
  const hideNav = isNotAgencyHost || isNotAgencyRoute;

  // Toggle is hidden on the same surfaces as nav, plus console/auth/admin/pitch
  // routes where v1↔v2 comparison doesn't apply.
  const isToggleHiddenRoute =
    isNotAgencyRoute ||
    path === "/auth" ||
    path === "/admin" ||
    path.startsWith("/console") ||
    path.startsWith("/pitch/");
  const showVersionToggle = !isNotAgencyHost && !isToggleHiddenRoute;

  return (
    <AuthProvider>
      <ScrollToTop />
      {!hideNav && (isV2 ? <NavigationV2 /> : <Navigation />)}
      <Routes>
        {/* Domain-aware homepage: thenotagency.com sees the holding page,
            everyone else sees Eight-Six Media. */}
        <Route path="/" element={isNotAgencyHost ? <NotAgency /> : <Index />} />
        {/* Always-available preview route so we can QA on lovable.app. */}
        <Route path="/notagency" element={<NotAgency />} />
        {/* Eight-Six v1 routes */}
        <Route path="/work" element={<Work />} />
        <Route path="/roster" element={<Roster />} />
        <Route path="/for-brands" element={<ForBrands />} />
        <Route path="/for-creators" element={<ForCreators />} />
        <Route path="/about" element={<About />} />

        {/* Eight-Six v2 routes — parallel build for design comparison */}
        <Route path="/v2" element={<IndexV2 />} />
        <Route path="/v2/work" element={<WorkV2 />} />
        <Route path="/v2/roster" element={<RosterV2 />} />
        <Route path="/v2/for-brands" element={<ForBrandsV2 />} />
        <Route path="/v2/for-creators" element={<ForCreatorsV2 />} />
        <Route path="/v2/about" element={<AboutV2 />} />

        <Route path="/auth" element={<Auth />} />
        <Route
          path="/console"
          element={
            <ProtectedRoute>
              <BackendConsole />
            </ProtectedRoute>
          }
        />
        <Route
          path="/console/partnership-updates"
          element={
            <ProtectedRoute>
              <PartnershipUpdates />
            </ProtectedRoute>
          }
        />
        <Route
          path="/console/roster"
          element={
            <ProtectedRoute>
              <RosterManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/console/pitch-generator"
          element={
            <ProtectedRoute>
              <PitchGenerator />
            </ProtectedRoute>
          }
        />
        <Route
          path="/console/meta-analytics"
          element={
            <ProtectedRoute>
              <MetaAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/console/brand-manager"
          element={
            <ProtectedRoute>
              <BrandManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/console/contact-sourcing"
          element={
            <ProtectedRoute>
              <ContactSourcing />
            </ProtectedRoute>
          }
        />
        <Route path="/admin" element={<Admin />} />
        <Route path="/pitch/:slug" element={<Pitch />} />

        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      {showVersionToggle && <VersionToggle />}
    </AuthProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
