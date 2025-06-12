
import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navigate, Route, BrowserRouter, Routes } from 'react-router-dom';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Explore from './pages/Explore';
import Education from './pages/Education';
import MessagingDashboard from './pages/MessagingDashboard';
import AdvancedMessaging from './pages/AdvancedMessaging';
import EnhancedMessages from './pages/EnhancedMessages';
import MessagingAnalytics from './pages/MessagingAnalytics';
import Notifications from './pages/Notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isGuest } = useAuth();
  if (!user && !isGuest) {
    return <Navigate to="/auth" />;
  }
  return <>{children}</>;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<Home />} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/education" element={<Education />} />
              <Route path="/messages" element={<ProtectedRoute><MessagingDashboard /></ProtectedRoute>} />
              <Route path="/messaging-test" element={<ProtectedRoute><AdvancedMessaging /></ProtectedRoute>} />
              <Route path="/enhanced-messages" element={<ProtectedRoute><EnhancedMessages /></ProtectedRoute>} />
              <Route path="/messaging-analytics" element={<ProtectedRoute><MessagingAnalytics /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
