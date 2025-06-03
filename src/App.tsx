
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home';
import MapView from './pages/MapView';
import LocationExplorer from './pages/LocationExplorer';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import AnalyticsDashboard from '@/pages/AnalyticsDashboard';

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={new QueryClient()}>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/map" element={<MapView />} />
              <Route path="/location-explorer" element={<LocationExplorer />} />
              <Route path="/profile/:userId" element={<Profile />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/analytics" element={<AnalyticsDashboard />} />
            </Routes>
          </div>
        </Router>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
