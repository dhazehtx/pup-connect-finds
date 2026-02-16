import { QueryClient } from '@tanstack/react-query';
import { apiRequest } from './api';

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
      staleTime: 60 * 1000,
      gcTime: 300 * 1000,
      retry: (failureCount, error: any) => {
        const status = error?.message?.match(/failed (\d+)/)?.[1];
        if (status === '401' || status === '403' || status === '404') return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// Re-export apiRequest from api.ts for convenience
export { apiRequest } from './api';