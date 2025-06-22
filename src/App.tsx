
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RealtimeProvider } from "@/contexts/RealtimeContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Layout from "@/components/Layout";
import Index from "@/pages/Index";
import ExploreWithFreemium from "@/components/explore/ExploreWithFreemium";
import Marketplace from "@/pages/Marketplace";
import ProfileWithFreemium from "@/components/profile/ProfileWithFreemium";
import AuthForm from "@/components/auth/AuthForm";
import Favorites from "@/pages/Favorites";
import Messages from "@/pages/Messages";
import Settings from "@/pages/Settings";
import Admin from "@/pages/Admin";
import CreateListing from "@/pages/CreateListing";
import Monetization from "@/pages/Monetization";
import Help from "@/pages/Help";
import Education from "@/pages/Education";
import Legal from "@/pages/Legal";
import Success from "@/pages/Success";
import StickyBottomNavigation from "@/components/StickyBottomNavigation";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <RealtimeProvider>
            <BrowserRouter>
              <Layout>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/explore" element={<ExploreWithFreemium />} />
                  <Route path="/marketplace" element={<Marketplace />} />
                  <Route path="/profile" element={<ProfileWithFreemium />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/auth" element={<AuthForm />} />
                  <Route path="/create-listing" element={<CreateListing />} />
                  <Route path="/monetization" element={<Monetization />} />
                  <Route path="/help" element={<Help />} />
                  <Route path="/education" element={<Education />} />
                  <Route path="/legal" element={<Legal />} />
                  <Route path="/success" element={<Success />} />
                </Routes>
                <StickyBottomNavigation />
              </Layout>
            </BrowserRouter>
          </RealtimeProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
