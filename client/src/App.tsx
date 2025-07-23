
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { RealtimeProvider } from './contexts/RealtimeContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import HomeFeedPage from './pages/HomeFeed';
import Explore from './pages/Explore';
import Post from './pages/Post';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import CreateListing from './pages/CreateListing';
import Marketplace from './pages/Marketplace';
import ListingDetail from './pages/ListingDetail';
import Messages from './pages/Messages';
import MessageThread from './components/messaging/MessageThread';
import Notifications from './pages/Notifications';
import Education from './pages/Education';
import HelpCenter from './pages/HelpCenter';
import TrustSafety from './pages/TrustSafety';
import Contact from './pages/Contact';
import Services from './pages/Services';
import LegalGuide from './pages/LegalGuide';
import AccountSettingsPage from './pages/AccountSettings';
import ProtectedRoute from './components/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <RealtimeProvider>
            <ThemeProvider>
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/home" element={<ProtectedRoute><HomeFeedPage /></ProtectedRoute>} />
                  <Route path="/explore" element={<Explore />} />
                  <Route path="/marketplace" element={<Marketplace />} />
                  <Route path="/post" element={<ProtectedRoute><Post /></ProtectedRoute>} />
                  <Route path="/profile/:userId" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/create-listing" element={<ProtectedRoute><CreateListing /></ProtectedRoute>} />
                  <Route path="/listing/:id" element={<ListingDetail />} />
                  <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
                  <Route path="/messages/:conversationId" element={<ProtectedRoute><MessageThread /></ProtectedRoute>} />
                  <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                  <Route path="/education" element={<Education />} />
                  <Route path="/help-center" element={<HelpCenter />} />
                  <Route path="/trust-safety" element={<TrustSafety />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/legal" element={<LegalGuide />} />
                  <Route path="/account-settings" element={<ProtectedRoute><AccountSettingsPage /></ProtectedRoute>} />
                </Routes>
              </Layout>
            </ThemeProvider>
          </RealtimeProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
