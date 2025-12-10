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
              <Route path="/filter" element={<Filter />} />
              <Route path="/ai-match" element={<AIMatch />} />
              <Route path="/campaign" element={<Campaign />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/auth" element={<Auth />} />

              {/* Placeholder Routes for New Navigation */}
              <Route path="/platform" element={<div className="pt-32 text-center"><h1 className="text-3xl font-bold">Platform Overview</h1><p>Coming soon...</p></div>} />
              <Route path="/agency" element={<div className="pt-32 text-center"><h1 className="text-3xl font-bold">Agency Services</h1><p>Coming soon...</p></div>} />
              <Route path="/stories" element={<div className="pt-32 text-center"><h1 className="text-3xl font-bold">Customer Stories</h1><p>Coming soon...</p></div>} />
              <Route path="/blog" element={<div className="pt-32 text-center"><h1 className="text-3xl font-bold">Blog</h1><p>Coming soon...</p></div>} />
              <Route path="/resources/*" element={<div className="pt-32 text-center"><h1 className="text-3xl font-bold">Resources</h1><p>Coming soon...</p></div>} />
              <Route path="/education" element={<EducationHub />} />

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
