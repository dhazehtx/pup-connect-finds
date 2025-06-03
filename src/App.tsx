
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import MapView from './pages/MapView';
import LocationExplorer from './pages/LocationExplorer';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import AnalyticsDashboard from '@/pages/AnalyticsDashboard';
import Monetization from './pages/Monetization';
import Explore from './pages/Explore';
import Auth from './pages/Auth';
import AuthCallback from './pages/AuthCallback';

function App() {
  const queryClient = new QueryClient();

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/map" element={<MapView />} />
              <Route path="/location-explorer" element={<LocationExplorer />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/:userId" element={<Profile />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/analytics" element={<AnalyticsDashboard />} />
              <Route path="/monetization" element={<Monetization />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
            </Routes>
          </Layout>
        </Router>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
