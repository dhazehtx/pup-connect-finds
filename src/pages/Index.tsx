
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './Home';
import Explore from './Explore';
import Post from './Post';
import PostDetail from './PostDetail';
import Messages from './Messages';
import Notifications from './Notifications';
import Settings from './Settings';
import Profile from './Profile';
import Verification from './Verification';
import MapView from './MapView';
import Education from './Education';
import Monetization from './Monetization';
import Partnerships from './Partnerships';
import TermsOfService from './TermsOfService';
import Help from './Help';
import SampleData from './SampleData';
import AIAssistant from './AIAssistant';
import ProtectedRoute from '../components/ProtectedRoute';
import Success from './Success';
import Auth from './Auth';
import AuthCallback from './AuthCallback';
import PremiumDashboard from './PremiumDashboard';
import BrowsePuppies from './BrowsePuppies';
import Analytics from './Analytics';
import HelpCenter from './HelpCenter';
import TrustSafetyPublic from './TrustSafetyPublic';
import ContactUs from './ContactUs';
import PrivacyPolicy from './PrivacyPolicy';

const Index = () => {
  return (
    <Routes>
      {/* Public routes accessible to guests */}
      <Route path="/" element={<Home />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/browse-puppies" element={<BrowsePuppies />} />
      <Route path="/map" element={<MapView />} />
      <Route path="/education" element={<Education />} />
      <Route path="/partnerships" element={<Partnerships />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/help" element={<Help />} />
      <Route path="/help-center" element={<HelpCenter />} />
      <Route path="/trust-safety" element={<TrustSafetyPublic />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/sample-data" element={<SampleData />} />
      <Route path="/ai-assistant" element={<AIAssistant />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/post/:postId" element={<PostDetail />} />
      
      {/* Profile routes - fully public with guest support */}
      <Route path="/profile/:userId" element={<Profile />} />
      <Route path="/profile" element={<Profile />} />
      
      {/* Messages route - public for guest browsing */}
      <Route path="/messages" element={<Messages />} />
      
      {/* Protected routes requiring authentication */}
      <Route 
        path="/post" 
        element={
          <ProtectedRoute guestMessage="Create and manage listings with a MY PUP account.">
            <Post />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/notifications" 
        element={
          <ProtectedRoute guestMessage="Stay updated with personalized notifications about your listings and messages.">
            <Notifications />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/verification" 
        element={
          <ProtectedRoute guestMessage="Build trust with verified breeder status and enhanced credibility.">
            <Verification />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute guestMessage="Customize your MY PUP experience with personalized settings.">
            <Settings />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/monetization" 
        element={
          <ProtectedRoute guestMessage="Access premium features and monetization tools for verified breeders.">
            <Monetization />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/premium-dashboard" 
        element={
          <ProtectedRoute guestMessage="Access premium analytics and advanced features with a verified account.">
            <PremiumDashboard />
          </ProtectedRoute>
        } 
      />
      <Route path="/success" element={<Success />} />
    </Routes>
  );
};

export default Index;
