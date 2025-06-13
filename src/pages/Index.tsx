
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Auth from './Auth';
import Home from './Home';
import Post from './Post';
import Explore from './Explore';
import Messages from './Messages';
import Profile from './Profile';
import Settings from './Settings';
import Notifications from './Notifications';
import Education from './Education';
import Legal from './Legal';
import FAQ from './FAQ';
import TermsOfService from './TermsOfService';
import PrivacyPolicy from './PrivacyPolicy';
import HelpCenter from './HelpCenter';
import Contact from './Contact';
import CustomerReviews from './CustomerReviews';
import TrustSafety from './TrustSafety';
import Services from './Services';
import B2BDashboard from './B2BDashboard';
import ProtectedRoute from '@/components/ProtectedRoute';

const Index = () => {
  const { user, loading, isGuest } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/services" element={<Services />} />
      
      {/* B2B Dashboard - protected route for business users */}
      <Route 
        path="/b2b-dashboard" 
        element={
          <ProtectedRoute allowGuest={false}>
            <B2BDashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Protected routes that redirect guests to auth */}
      <Route 
        path="/post" 
        element={
          <ProtectedRoute allowGuest={false} guestMessage="Please sign up or sign in to create posts.">
            <Post />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/messages" 
        element={
          <ProtectedRoute allowGuest={false} guestMessage="Please sign up or sign in to access messages.">
            <Messages />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute allowGuest={false} guestMessage="Please sign up or sign in to access your profile.">
            <Profile />
          </ProtectedRoute>
        } 
      />
      
      {/* Other protected routes */}
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute allowGuest={false}>
            <Settings />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/notifications" 
        element={
          <ProtectedRoute allowGuest={false}>
            <Notifications />
          </ProtectedRoute>
        } 
      />
      
      {/* Public routes */}
      <Route path="/education" element={<Education />} />
      <Route path="/legal" element={<Legal />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/help-center" element={<HelpCenter />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/customer-reviews" element={<CustomerReviews />} />
      <Route path="/trust-safety" element={<TrustSafety />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default Index;
