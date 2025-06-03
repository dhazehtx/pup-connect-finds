import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { ThemeProvider } from "@/components/theme-provider"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home';
import MapView from './pages/MapView';
import LocationExplorer from './pages/LocationExplorer';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import BrowseListings from './pages/BrowseListings';
import ListingDetails from './pages/ListingDetails';
import CreateListing from './pages/CreateListing';
import UpdateListing from './pages/UpdateListing';
import Messages from './pages/Messages';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import PasswordReset from './pages/PasswordReset';
import AnalyticsDashboard from '@/pages/AnalyticsDashboard';

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={new QueryClient()}>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <Router>
            <div className="min-h-screen bg-background">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/map" element={<MapView />} />
                <Route path="/location-explorer" element={<LocationExplorer />} />
                <Route path="/profile/:userId" element={<Profile />} />
                <Route path="/edit-profile" element={<EditProfile />} />
                <Route path="/browse" element={<BrowseListings />} />
                <Route path="/listing/:listingId" element={<ListingDetails />} />
                <Route path="/create-listing" element={<CreateListing />} />
                <Route path="/update-listing/:listingId" element={<UpdateListing />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/notifications" element={<Notifications />} />
                 <Route path="/password-reset" element={<PasswordReset />} />
                <Route path="/analytics" element={<AnalyticsDashboard />} />
              </Routes>
            </div>
          </Router>
        </ThemeProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
