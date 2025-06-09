
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import GlobalErrorBoundary from '@/components/ui/global-error-boundary';
import Layout from '@/components/Layout';
import Index from '@/pages/Index';
import { Toaster } from '@/components/ui/toaster';

// Configure React Query with better defaults for production
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  return (
    <GlobalErrorBoundary>
      <HelmetProvider>
        <Router>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <ThemeProvider>
                <Layout>
                  <Index />
                </Layout>
                <Toaster />
              </ThemeProvider>
            </AuthProvider>
          </QueryClientProvider>
        </Router>
      </HelmetProvider>
    </GlobalErrorBoundary>
  );
}

export default App;
