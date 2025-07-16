
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/theme-provider";

// Auth pages
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import VerifyEmail from "./pages/VerifyEmail";

// Main pages
import Welcome from "./pages/Welcome";
import HomeFeedPage from "./pages/HomeFeed";
import Profile from "./pages/Profile";
import Explore from "./pages/Explore";
import Marketplace from "./pages/Marketplace";
import Messages from "./pages/Messages";
import ConversationThread from "./pages/ConversationThread";
import ListingDetail from "./pages/ListingDetail";
import CreateListing from "./pages/CreateListing";
import Search from "./pages/Search";
import Post from "./pages/Post";
import DogDetail from "./pages/DogDetail";
import About from "./pages/About";
import Support from "./pages/Support";
import Privacy from "./pages/Privacy";

// Components
import BottomNav from "./components/layout/BottomNav";
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="my-pup-theme">
        <TooltipProvider>
          <BrowserRouter>
            <AuthProvider>
              <div className="min-h-screen bg-background">
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Welcome />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/support" element={<Support />} />
                  <Route path="/privacy" element={<Privacy />} />
                  
                  {/* Protected routes with layout */}
                  <Route path="/home" element={
                    <MainLayout>
                      <HomeFeedPage />
                      <BottomNav />
                    </MainLayout>
                  } />
                  
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Profile />
                        <BottomNav />
                      </MainLayout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/profile/:userId" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Profile />
                        <BottomNav />
                      </MainLayout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/explore" element={
                    <MainLayout>
                      <Explore />
                      <BottomNav />
                    </MainLayout>
                  } />
                  
                  <Route path="/marketplace" element={
                    <MainLayout>
                      <Marketplace />
                      <BottomNav />
                    </MainLayout>
                  } />
                  
                  <Route path="/messages" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Messages />
                        <BottomNav />
                      </MainLayout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/conversation/:conversationId" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <ConversationThread />
                      </MainLayout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/listing/:id" element={
                    <MainLayout>
                      <ListingDetail />
                      <BottomNav />
                    </MainLayout>
                  } />
                  
                  <Route path="/dog/:id" element={
                    <MainLayout>
                      <DogDetail />
                      <BottomNav />
                    </MainLayout>
                  } />
                  
                  <Route path="/create-listing" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <CreateListing />
                        <BottomNav />
                      </MainLayout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/search" element={
                    <MainLayout>
                      <Search />
                      <BottomNav />
                    </MainLayout>
                  } />
                  
                  <Route path="/post" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Post />
                        <BottomNav />
                      </MainLayout>
                    </ProtectedRoute>
                  } />
                  
                  {/* Fallback redirect */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
              <Toaster />
              <Sonner />
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
