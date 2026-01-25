import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";
import Home from "./pages/Home";
import Filter from "./pages/Filter";
import AIMatch from "./pages/AIMatch";
import Campaign from "./pages/Campaign";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Messages from "./pages/Messages";
import EducationHub from "./pages/EducationHub";
import BrandDashboard from "./pages/BrandDashboard";
import NotFound from "./pages/NotFound";
import ProfileSetup from "./pages/ProfileSetup";
import PublicProfile from "./pages/PublicProfile";

import About from "./pages/About";
import CMSPage from "./pages/CMSPage";
import LegalPage from "./pages/LegalPage";
import { PlatformPage, AgencyPage, CareersPage } from "./pages/MarketingPages";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/ai-match" element={<AIMatch />} />

              {/* Product/Service Pages */}
              <Route path="/platform" element={<PlatformPage />} />
              <Route path="/campaign" element={<Campaign />} />
              <Route path="/agency" element={<AgencyPage />} />
              <Route path="/filter" element={<Filter />} />
              <Route path="/profile/:id" element={<PublicProfile />} />
              <Route path="/stories" element={<CMSPage title="Customer Stories" subtitle="See how brands are winning with Creator Connect." />} />

              {/* Resources & Support */}
              <Route path="/blog" element={<CMSPage title="Blog" subtitle="Insights, trends, and tips." />} />
              <Route path="/careers" element={<CareersPage />} />
              <Route path="/education" element={<EducationHub />} />
              <Route path="/support/brand" element={<CMSPage title="Brand Support" subtitle="Help center for brands." />} />
              <Route path="/support/creator" element={<CMSPage title="Creator Support" subtitle="Help center for creators." />} />
              <Route path="/partners" element={<CMSPage title="Partner Program" subtitle="Grow with us." />} />

              {/* Legal Center */}
              <Route path="/privacy" element={<LegalPage type="privacy" />} />
              <Route path="/terms" element={<LegalPage type="terms" />} />
              <Route path="/subscription-agreement" element={<LegalPage type="subscription" />} />
              <Route path="/fees" element={<LegalPage type="fees" />} />
              <Route path="/disclosure" element={<CMSPage title="Responsible Disclosure" />} />
              <Route path="/acceptable-use" element={<CMSPage title="Acceptable Use Policy" />} />

              {/* Resources Wildcard */}
              <Route path="/resources/*" element={<CMSPage title="Resources" subtitle="Briefs, Templates, and more." />} />

              <Route path="/auth" element={<Auth />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/messages" element={<Messages />} />
                <Route path="/brand-dashboard" element={<BrandDashboard />} />
                <Route path="/profile-setup" element={<ProfileSetup />} />
                {/* Aliases for user-friendly URLs */}
                <Route path="/dashboard" element={<BrandDashboard />} />
                <Route path="/profile" element={<ProfileSetup />} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
