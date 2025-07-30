import { QueryClient } from '@tanstack/react-query';

// Create and export the query client instance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 300 * 1000, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Re-export apiRequest from api.ts for convenience
export { apiRequest } from './api';