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
import SampleData from './SampleData';
import ProtectedRoute from '../components/ProtectedRoute';
import Success from './Success';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cloud-white to-soft-sky">
      <Header />
      <main className="pt-16">
        <Routes>
          {/* Public routes accessible to guests */}
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/education" element={<Education />} />
          <Route path="/partnerships" element={<Partnerships />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/help" element={<Help />} />
          <Route path="/sample-data" element={<SampleData />} />
          
          {/* Profile and Messages routes - temporarily public for design work */}
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/profile" element={<Profile />} />
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
          <Route path="/success" element={<Success />} />
        </Routes>
      </main>
      <BottomNavigation />
    </div>
  );
};

export default Index;
