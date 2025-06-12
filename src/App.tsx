
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Toaster } from '@/components/ui/toaster';
import Layout from '@/components/Layout';
import Index from '@/pages/Index';
import AppCompletion from '@/pages/AppCompletion';
import AdminDashboard from '@/components/admin/AdminDashboard';
import SampleDataManager from '@/components/dev/SampleDataManager';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Admin routes - no layout needed */}
              <Route path="/admin/*" element={<AdminDashboard />} />
              <Route path="/app-completion" element={<AppCompletion />} />
              <Route path="/sample-data" element={<SampleDataManager />} />
              
              {/* All other routes go through Layout which includes navigation */}
              <Route path="/*" element={
                <Layout>
                  <Index />
                </Layout>
              } />
            </Routes>
          </Router>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
