
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { RealtimeProvider } from './contexts/RealtimeContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Post from './pages/Post';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import CreateListing from './pages/CreateListing';
import Marketplace from './pages/Marketplace';
import ListingDetail from './pages/ListingDetail';
import Messages from './pages/Messages';
import MessageThread from './components/messaging/MessageThread';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
    },
  },
});

function App() {
  return (
    <div className="min-h-screen bg-white text-slate-900 unified-theme">
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <RealtimeProvider>
              <ThemeProvider defaultTheme="light">
                <Layout>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/explore" element={<Explore />} />
                    <Route path="/marketplace" element={<Marketplace />} />
                    <Route path="/post" element={<Post />} />
                    <Route path="/profile/:userId" element={<Profile />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/create-listing" element={<CreateListing />} />
                    <Route path="/listing/:id" element={<ListingDetail />} />
                    <Route path="/messages" element={<Messages />} />
                    <Route path="/messages/:conversationId" element={<MessageThread />} />
                  </Routes>
                </Layout>
              </ThemeProvider>
            </RealtimeProvider>
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </div>
  );
}

export default App;
