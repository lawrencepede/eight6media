import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import ScrollToTop from "@/components/ScrollToTop";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
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

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ScrollToTop />
          <Navigation />
          <Routes>
            <Route path="/" element={<Index />} />
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
