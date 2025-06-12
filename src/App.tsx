import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navigate, Route, BrowserRouter, Routes } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Guest from './pages/Guest';
import ForgotPassword from './pages/ForgotPassword';
import UpdatePassword from './pages/UpdatePassword';
import Browse from './pages/Browse';
import Explore from './pages/Explore';
import Education from './pages/Education';
import Analytics from './pages/Analytics';
import MessagingDashboard from './pages/MessagingDashboard';
import AdvancedMessaging from './pages/AdvancedMessaging';
import EnhancedMessages from './pages/EnhancedMessages';
import MessagingAnalytics from './pages/MessagingAnalytics';
import CreateListing from './pages/CreateListing';
import MyListings from './pages/MyListings';
import Auth from './pages/Auth';
import Notifications from './pages/Notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import './pages/NotificationCenter';

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
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
            <Route path="/guest" element={<Guest />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/education" element={<Education />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/messages" element={<ProtectedRoute><MessagingDashboard /></ProtectedRoute>} />
            <Route path="/messaging-test" element={<ProtectedRoute><AdvancedMessaging /></ProtectedRoute>} />
            <Route path="/enhanced-messages" element={<ProtectedRoute><EnhancedMessages /></ProtectedRoute>} />
            <Route path="/messaging-analytics" element={<ProtectedRoute><MessagingAnalytics /></ProtectedRoute>} />
            <Route path="/create-listing" element={<ProtectedRoute><CreateListing /></ProtectedRoute>} />
            <Route path="/my-listings" element={<ProtectedRoute><MyListings /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
