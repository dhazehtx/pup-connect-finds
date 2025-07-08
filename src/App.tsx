import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryStreamedHydration } from '@tanstack/react-query-streamed-hydration';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Post from './pages/Post';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import DogProfile from './pages/DogProfile';
import RealtimeProvider from './contexts/RealtimeContext';
import CreateListing from './pages/CreateListing';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
    },
  },
});

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <RealtimeProvider>
          <AuthProvider>
            <ThemeProvider>
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/explore" element={<Explore />} />
                  <Route path="/post" element={<Post />} />
                  <Route path="/profile/:userId" element={<Profile />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/dog/:dogId" element={<DogProfile />} />
                  <Route path="/create-listing" element={<CreateListing />} />
                </Routes>
              </Layout>
            </ThemeProvider>
          </AuthProvider>
        </RealtimeProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
