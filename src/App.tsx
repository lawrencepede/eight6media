import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
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

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppShell = () => {
  const isNotAgencyHost = useIsNotAgencyHost();
  return (
    <AuthProvider>
      <ScrollToTop />
      {!isNotAgencyHost && <Navigation />}
      <Routes>
        {/* Domain-aware homepage: thenotagency.com sees the holding page,
            everyone else sees Eight-Six Media. */}
        <Route path="/" element={isNotAgencyHost ? <NotAgency /> : <Index />} />
        {/* Always-available preview route so we can QA on lovable.app. */}
        <Route path="/notagency" element={<NotAgency />} />
        {/* Eight-Six routes — kept available on all hosts for now. */}
            <Route path="/work" element={<Work />} />
            <Route path="/roster" element={<Roster />} />
            <Route path="/for-brands" element={<ForBrands />} />
            <Route path="/for-creators" element={<ForCreators />} />
            <Route path="/about" element={<About />} />
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
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
