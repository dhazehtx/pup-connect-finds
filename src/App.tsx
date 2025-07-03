
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RealtimeProvider } from "@/contexts/RealtimeContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Layout from "@/components/Layout";
import Index from "@/pages/Index";
import HomeFeed from "@/pages/HomeFeed";
import ExploreWithFreemium from "@/components/explore/ExploreWithFreemium";
import Marketplace from "@/pages/Marketplace";
import ProfileWithFreemium from "@/components/profile/ProfileWithFreemium";
import AuthForm from "@/components/auth/AuthForm";
import Favorites from "@/pages/Favorites";
import Messages from "@/pages/Messages";
import Settings from "@/pages/Settings";
import Admin from "@/pages/Admin";
import CreateListing from "@/pages/CreateListing";
import ListingDetail from "@/pages/ListingDetail";
import RehomingForm from "@/components/rehoming/RehomingForm";
import Monetization from "@/pages/Monetization";
import Help from "@/pages/Help";
import Education from "@/pages/Education";
import Legal from "@/pages/Legal";
import Success from "@/pages/Success";
import StickyBottomNavigation from "@/components/StickyBottomNavigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

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
                  {/* Public routes - accessible without authentication */}
                  <Route path="/" element={<Index />} />
                  <Route path="/explore" element={<ExploreWithFreemium />} />
                  <Route path="/marketplace" element={<Marketplace />} />
                  <Route path="/listing/:id" element={<ListingDetail />} />
                  <Route path="/auth" element={<AuthForm />} />
                  <Route path="/education" element={<Education />} />
                  <Route path="/legal" element={<Legal />} />
                  <Route path="/help" element={<Help />} />
                  
                  {/* Protected routes - require authentication */}
                  <Route path="/home" element={
                    <ProtectedRoute>
                      <HomeFeed />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <ProfileWithFreemium />
                    </ProtectedRoute>
                  } />
                  <Route path="/messages" element={
                    <ProtectedRoute>
                      <Messages />
                    </ProtectedRoute>
                  } />
                  <Route path="/favorites" element={
                    <ProtectedRoute>
                      <Favorites />
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin" element={
                    <ProtectedRoute>
                      <Admin />
                    </ProtectedRoute>
                  } />
                  <Route path="/create-listing" element={
                    <ProtectedRoute>
                      <CreateListing />
                    </ProtectedRoute>
                  } />
                  <Route path="/rehome" element={
                    <ProtectedRoute>
                      <RehomingForm />
                    </ProtectedRoute>
                  } />
                  <Route path="/monetization" element={
                    <ProtectedRoute>
                      <Monetization />
                    </ProtectedRoute>
                  } />
                  <Route path="/success" element={
                    <ProtectedRoute>
                      <Success />
                    </ProtectedRoute>
                  } />
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
