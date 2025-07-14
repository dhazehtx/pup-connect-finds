import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/theme-provider";
import { RealtimeProvider } from "@/contexts/RealtimeContext";
import Layout from "@/components/Layout";

const Index = lazy(() => import("@/pages/Index"));
const Auth = lazy(() => import("@/pages/Auth"));
const AuthCallback = lazy(() => import("@/pages/AuthCallback"));
const Home = lazy(() => import("@/pages/Home"));
const Explore = lazy(() => import("@/pages/Explore"));
const Messages = lazy(() => import("@/pages/Messages"));
const Profile = lazy(() => import("@/pages/Profile"));
const DogDetail = lazy(() => import("@/pages/DogDetail"));
const CreateListing = lazy(() => import("@/pages/CreateListing"));
const Favorites = lazy(() => import("@/pages/Favorites"));
const Settings = lazy(() => import("@/pages/Settings"));
const About = lazy(() => import("@/pages/About"));
const Support = lazy(() => import("@/pages/Support"));
const Terms = lazy(() => import("@/pages/Terms"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const ConversationThread = lazy(() => import("@/pages/ConversationThread"));

const queryClient = new QueryClient();

function App() {
  return (
    <div className="min-h-screen bg-white text-slate-900 unified-theme">
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <RealtimeProvider>
              <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
                <TooltipProvider>
                  <Layout>
                    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/auth/callback" element={<AuthCallback />} />
                        <Route path="/home" element={<Home />} />
                        <Route path="/explore" element={<Explore />} />
                        <Route path="/messages" element={<Messages />} />
                        <Route path="/messages/:threadId" element={<ConversationThread />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/dog/:id" element={<DogDetail />} />
                        <Route path="/create-listing" element={<CreateListing />} />
                        <Route path="/favorites" element={<Favorites />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/support" element={<Support />} />
                        <Route path="/terms" element={<Terms />} />
                        <Route path="/privacy" element={<Privacy />} />
                      </Routes>
                    </Suspense>
                  </Layout>
                </TooltipProvider>
              </ThemeProvider>
            </RealtimeProvider>
          </AuthProvider>
        </Router>
        <Toaster />
        <Sonner />
      </QueryClientProvider>
    </div>
  );
}

export default App;
