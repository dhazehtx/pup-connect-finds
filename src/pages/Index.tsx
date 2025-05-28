
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import Home from './Home';
import Explore from './Explore';
import Post from './Post';
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
import ProtectedRoute from '../components/ProtectedRoute';

const Index = () => {
  return (
    <Layout>
      <Routes>
        {/* Public routes accessible to guests */}
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/education" element={<Education />} />
        <Route path="/partnerships" element={<Partnerships />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/help" element={<Help />} />
        
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
          path="/messages" 
          element={
            <ProtectedRoute guestMessage="Connect with breeders and buyers through our secure messaging system.">
              <Messages />
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
          path="/profile/:userId" 
          element={
            <ProtectedRoute guestMessage="View and manage your breeder profile and listings.">
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute guestMessage="View and manage your breeder profile and listings.">
              <Profile />
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
      </Routes>
    </Layout>
  );
};

export default Index;
