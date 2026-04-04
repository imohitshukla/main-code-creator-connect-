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

// All pages lazy-loaded for code-splitting
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));
const CMSPage = lazy(() => import("./pages/CMSPage"));
const LegalPage = lazy(() => import("./pages/LegalPage"));
const MarketingPlatformPage = lazy(() => import("./pages/MarketingPages").then(m => ({ default: m.PlatformPage })));
const MarketingAgencyPage = lazy(() => import("./pages/MarketingPages").then(m => ({ default: m.AgencyPage })));
const MarketingCareersPage = lazy(() => import("./pages/MarketingPages").then(m => ({ default: m.CareersPage })));
const BrandSupport = lazy(() => import("./pages/BrandSupport"));
const CreatorSupport = lazy(() => import("./pages/CreatorSupport"));
const PartnerProgram = lazy(() => import("./pages/PartnerProgram"));
const Filter = lazy(() => import("./pages/Filter"));
const PublicProfile = lazy(() => import("./pages/PublicProfile"));
const ProfileSetup = lazy(() => import("./pages/ProfileSetup"));
const Campaign = lazy(() => import("./pages/Campaign"));
const Messages = lazy(() => import("./pages/Messages"));
const EducationHub = lazy(() => import("./pages/EducationHub"));
const BrandDashboard = lazy(() => import("./pages/BrandDashboard"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const RoleSelection = lazy(() => import("./pages/RoleSelection"));
const MyDeals = lazy(() => import("./pages/MyDeals"));
const DealDetails = lazy(() => import("./pages/DealDetails"));

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
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center">
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
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <div className="flex-1">
            <Routes>
              <Route path="/" element={<Suspense fallback={<PageFallback />}><Home /></Suspense>} />
              <Route path="/about" element={<Suspense fallback={<PageFallback />}><About /></Suspense>} />
              <Route path="/contact" element={<Suspense fallback={<PageFallback />}><Contact /></Suspense>} />

              {/* Product/Service Pages */}
              <Route path="/platform" element={<Suspense fallback={<PageFallback />}><MarketingPlatformPage /></Suspense>} />
              <Route path="/campaign" element={<Suspense fallback={<PageFallback />}><Campaign /></Suspense>} />
              <Route path="/agency" element={<Suspense fallback={<PageFallback />}><MarketingAgencyPage /></Suspense>} />
              <Route path="/filter" element={<Suspense fallback={<PageFallback />}><Filter /></Suspense>} />
              <Route path="/profile/:id" element={<Suspense fallback={<PageFallback />}><PublicProfile /></Suspense>} />
              <Route path="/stories" element={<Suspense fallback={<PageFallback />}><CMSPage title="Customer Stories" subtitle="See how brands are winning with Creator Connect." /></Suspense>} />

              {/* Resources & Support */}
              <Route path="/blog" element={<Suspense fallback={<PageFallback />}><CMSPage title="Blog" subtitle="Insights, trends, and tips." /></Suspense>} />
              <Route path="/careers" element={<Suspense fallback={<PageFallback />}><MarketingCareersPage /></Suspense>} />
              <Route path="/education" element={<Suspense fallback={<PageFallback />}><EducationHub /></Suspense>} />
              <Route path="/support/brand" element={<Suspense fallback={<PageFallback />}><BrandSupport /></Suspense>} />
              <Route path="/support/creator" element={<Suspense fallback={<PageFallback />}><CreatorSupport /></Suspense>} />
              <Route path="/partners" element={<Suspense fallback={<PageFallback />}><PartnerProgram /></Suspense>} />

              {/* Legal Center */}
              <Route path="/privacy" element={<Suspense fallback={<PageFallback />}><LegalPage type="privacy" /></Suspense>} />
              <Route path="/terms" element={<Suspense fallback={<PageFallback />}><LegalPage type="terms" /></Suspense>} />
              <Route path="/subscription-agreement" element={<Suspense fallback={<PageFallback />}><LegalPage type="subscription" /></Suspense>} />
              <Route path="/fees" element={<Suspense fallback={<PageFallback />}><LegalPage type="fees" /></Suspense>} />
              <Route path="/disclosure" element={<Suspense fallback={<PageFallback />}><CMSPage title="Responsible Disclosure" /></Suspense>} />
              <Route path="/acceptable-use" element={<Suspense fallback={<PageFallback />}><CMSPage title="Acceptable Use Policy" /></Suspense>} />

              {/* Resources Wildcard */}
              <Route path="/resources/*" element={<Suspense fallback={<PageFallback />}><CMSPage title="Resources" subtitle="Briefs, Templates, and more." /></Suspense>} />

              <Route path="/auth" element={<Suspense fallback={<PageFallback />}><Auth /></Suspense>} />

              <Route element={<ProtectedRoute />}>
                <Route path="/select-role" element={<Suspense fallback={<PageFallback />}><RoleSelection /></Suspense>} />

                <Route path="/messages" element={<Suspense fallback={<PageFallback />}><Messages /></Suspense>} />
                <Route path="/brand-dashboard" element={<Suspense fallback={<PageFallback />}><BrandDashboard /></Suspense>} />
                <Route path="/profile-setup" element={<Suspense fallback={<PageFallback />}><ProfileSetup /></Suspense>} />
                {/* Aliases for user-friendly URLs */}
                <Route path="/dashboard" element={<Suspense fallback={<PageFallback />}><Dashboard /></Suspense>} />
                <Route path="/profile" element={<Suspense fallback={<PageFallback />}><ProfileSetup /></Suspense>} />

                {/* Deal Tracker Routes */}
                <Route path="/my-deals" element={<Suspense fallback={<PageFallback />}><MyDeals /></Suspense>} />
                <Route path="/deals/:id" element={<Suspense fallback={<PageFallback />}><DealDetails /></Suspense>} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<Suspense fallback={<PageFallback />}><NotFound /></Suspense>} />
            </Routes>
            </div>
            <Footer />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
