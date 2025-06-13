import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { RealtimeProvider } from '@/contexts/RealtimeContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import Layout from '@/components/Layout';
import ErrorBoundary from '@/components/ErrorBoundary';
import Home from '@/pages/Home';
import Explore from '@/pages/Explore';
import Search from '@/pages/Search';
import Analytics from '@/pages/Analytics';
import Messages from '@/pages/Messages';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';
import Help from '@/pages/Help';
import Admin from '@/pages/Admin';
import AdminUsers from '@/pages/AdminUsers';
import AdminAnalytics from '@/pages/AdminAnalytics';
import AdminSafety from '@/pages/AdminSafety';
import AdminSettings from '@/pages/AdminSettings';
import AdminMessaging from '@/pages/AdminMessaging';
import AdminModeration from '@/pages/AdminModeration';
import AdminRevenue from '@/pages/AdminRevenue';
import SampleData from '@/pages/SampleData';
import DatabaseInitializer from '@/components/database/DatabaseInitializer';
import AppCompletion from '@/pages/AppCompletion';
import VerifyEmail from '@/pages/VerifyEmail';
import ResetPassword from '@/pages/ResetPassword';
import Services from '@/pages/Services';
import ProfessionalUpgrade from '@/pages/ProfessionalUpgrade';
import PawBox from '@/pages/PawBox';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <RealtimeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ErrorBoundary>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/explore" element={<Explore />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/messages" element={<Messages />} />
                    <Route path="/profile/:id" element={<Profile />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/help" element={<Help />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/admin/users" element={<AdminUsers />} />
                    <Route path="/admin/analytics" element={<AdminAnalytics />} />
                    <Route path="/admin/safety" element={<AdminSafety />} />
                    <Route path="/admin/settings" element={<AdminSettings />} />
                    <Route path="/admin/messaging" element={<AdminMessaging />} />
                    <Route path="/admin/moderation" element={<AdminModeration />} />
                    <Route path="/admin/revenue" element={<AdminRevenue />} />
                    <Route path="/sample-data" element={<SampleData />} />
                    <Route path="/database-init" element={<DatabaseInitializer />} />
                    <Route path="/app-completion" element={<AppCompletion />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/professional-upgrade" element={<ProfessionalUpgrade />} />
                    <Route path="/pawbox" element={<PawBox />} />
                  </Routes>
                </Layout>
              </ErrorBoundary>
            </BrowserRouter>
          </TooltipProvider>
        </RealtimeProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
