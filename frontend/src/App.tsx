import { lazy, Suspense } from "react";
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
import About from "./pages/About";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import CMSPage from "./pages/CMSPage";
import LegalPage from "./pages/LegalPage";
import { PlatformPage, AgencyPage, CareersPage } from "./pages/MarketingPages";

const Filter = lazy(() => import("./pages/Filter"));
const PublicProfile = lazy(() => import("./pages/PublicProfile"));
const ProfileSetup = lazy(() => import("./pages/ProfileSetup"));
const AIMatch = lazy(() => import("./pages/AIMatch"));
const Campaign = lazy(() => import("./pages/Campaign"));
const Messages = lazy(() => import("./pages/Messages"));
const EducationHub = lazy(() => import("./pages/EducationHub"));
const BrandDashboard = lazy(() => import("./pages/BrandDashboard"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const RoleSelection = lazy(() => import("./pages/RoleSelection")); // 🆕 Post-Login Role Selection

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

function PageFallback() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="animate-pulse rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
    </div>
  );
}

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
              <Route path="/ai-match" element={<Suspense fallback={<PageFallback />}><AIMatch /></Suspense>} />

              {/* Product/Service Pages */}
              <Route path="/platform" element={<PlatformPage />} />
              <Route path="/campaign" element={<Suspense fallback={<PageFallback />}><Campaign /></Suspense>} />
              <Route path="/agency" element={<AgencyPage />} />
              <Route path="/filter" element={<Suspense fallback={<PageFallback />}><Filter /></Suspense>} />
              <Route path="/profile/:id" element={<Suspense fallback={<PageFallback />}><PublicProfile /></Suspense>} />
              <Route path="/stories" element={<CMSPage title="Customer Stories" subtitle="See how brands are winning with Creator Connect." />} />

              {/* Resources & Support */}
              <Route path="/blog" element={<CMSPage title="Blog" subtitle="Insights, trends, and tips." />} />
              <Route path="/careers" element={<CareersPage />} />
              <Route path="/education" element={<Suspense fallback={<PageFallback />}><EducationHub /></Suspense>} />
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
                <Route path="/select-role" element={<Suspense fallback={<PageFallback />}><RoleSelection /></Suspense>} />

                <Route path="/messages" element={<Suspense fallback={<PageFallback />}><Messages /></Suspense>} />
                <Route path="/brand-dashboard" element={<Suspense fallback={<PageFallback />}><BrandDashboard /></Suspense>} />
                <Route path="/profile-setup" element={<Suspense fallback={<PageFallback />}><ProfileSetup /></Suspense>} />
                {/* Aliases for user-friendly URLs */}
                <Route path="/dashboard" element={<Suspense fallback={<PageFallback />}><Dashboard /></Suspense>} />
                <Route path="/profile" element={<Suspense fallback={<PageFallback />}><ProfileSetup /></Suspense>} />
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
