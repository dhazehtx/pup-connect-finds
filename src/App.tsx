
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import Explore from "./pages/Explore";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import Post from "./pages/Post";
import Auth from "./pages/Auth";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import Success from "./pages/Success";
import Partnerships from "./pages/Partnerships";
import Notifications from "./pages/Notifications";
import SampleData from "./pages/SampleData";
import MapView from "./pages/MapView";
import Home from "./pages/Home";
import Monetization from "./pages/Monetization";
import AIAssistant from "./pages/AIAssistant";
import Education from "./pages/Education";
import Verification from "./pages/Verification";
import EscrowDashboard from "./pages/EscrowDashboard";
import TrustSafety from "./pages/TrustSafety";
import TermsOfService from "./pages/TermsOfService";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Recommendations from "./pages/Recommendations";
import Compare from "./pages/Compare";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Index />} />
                <Route path="explore" element={<Explore />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="recommendations" element={<Recommendations />} />
                <Route path="compare" element={<Compare />} />
                <Route path="messages" element={<Messages />} />
                <Route path="profile" element={<Profile />} />
                <Route path="post" element={<Post />} />
                <Route path="auth" element={<Auth />} />
                <Route path="settings" element={<Settings />} />
                <Route path="help" element={<Help />} />
                <Route path="success" element={<Success />} />
                <Route path="partnerships" element={<Partnerships />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="sample-data" element={<SampleData />} />
                <Route path="map" element={<MapView />} />
                <Route path="home" element={<Home />} />
                <Route path="monetization" element={<Monetization />} />
                <Route path="ai-assistant" element={<AIAssistant />} />
                <Route path="education" element={<Education />} />
                <Route path="verification" element={<Verification />} />
                <Route path="escrow-dashboard" element={<EscrowDashboard />} />
                <Route path="trust-safety" element={<TrustSafety />} />
                <Route path="terms" element={<TermsOfService />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
