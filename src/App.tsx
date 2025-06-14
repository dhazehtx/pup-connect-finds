
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RealtimeProvider } from "@/contexts/RealtimeContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import SimpleProfile from "./pages/SimpleProfile";
import Explore from "./pages/Explore";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import MonetizationPage from "./pages/MonetizationPage";
import B2BDashboard from "./pages/B2BDashboard";
import DonationsPage from "./pages/DonationsPage";
import Services from "./pages/Services";
import TrustSafety from "./pages/TrustSafety";
import CustomerReviews from "./pages/CustomerReviews";
import Contact from "./pages/Contact";
import HelpCenter from "./pages/HelpCenter";
import PrivacyPolicy from "./pages/PrivacyPolicy";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <RealtimeProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/" element={<Layout />}>
                  <Route index element={<Index />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="simple-profile" element={<SimpleProfile />} />
                  <Route path="explore" element={<Explore />} />
                  <Route path="messages" element={<Messages />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="help" element={<Help />} />
                  <Route path="monetization" element={<MonetizationPage />} />
                  <Route path="b2b-dashboard" element={<B2BDashboard />} />
                  <Route path="donations" element={<DonationsPage />} />
                  <Route path="services" element={<Services />} />
                  <Route path="trust-safety" element={<TrustSafety />} />
                  <Route path="customer-reviews" element={<CustomerReviews />} />
                  <Route path="contact" element={<Contact />} />
                  <Route path="help-center" element={<HelpCenter />} />
                  <Route path="privacy-policy" element={<PrivacyPolicy />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </RealtimeProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
