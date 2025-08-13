import { QueryClient } from '@tanstack/react-query';
import { apiRequest } from './api';

// Create and export the query client instance with default query function
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const [path] = queryKey;
        if (typeof path !== 'string') {
          throw new Error('Query key must start with a string path');
        }
        return apiRequest(path);
      },
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