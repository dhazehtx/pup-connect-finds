
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ErrorBoundary from '@/components/ErrorBoundary';
import Home from '@/pages/Home';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';
import Verification from '@/pages/Verification';
import Monetization from '@/pages/Monetization';
import Notifications from '@/pages/Notifications';
import Messages from '@/pages/Messages';
import PostDetail from '@/pages/PostDetail';

const queryClient = new QueryClient();

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <ErrorBoundary>
              <div className="min-h-screen bg-gray-50">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/profile/:userId?" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/verification" element={<Verification />} />
                  <Route path="/monetization" element={<Monetization />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/post/:postId" element={<PostDetail />} />
                </Routes>
              </div>
            </ErrorBoundary>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
