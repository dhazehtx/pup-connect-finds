import { QueryClient, MutationCache } from '@tanstack/react-query';
import { apiRequest, isAbortError } from './api';

const mutationCache = new MutationCache({
  onError: (error: any) => {
    if (isAbortError(error)) return;
    const code = error?.code || 'UNKNOWN';
    const domain = error?.domain || 'api';
    const status = error?.status || 0;
    const msg = code === 'BLOCKED' ? 'This action is blocked'
      : code === 'AUTH_REQUIRED' ? 'Please sign in to continue'
      : code === 'RATE_LIMIT' ? 'Too many requests — please wait'
      : `Something went wrong (${code})`;

    if (status === 429 || code === 'RATE_LIMIT') {
      console.log('[PROOF:RATE_LIMIT:UI]', JSON.stringify({ route: domain, ts: Date.now() }));
    }
    console.log('[PROOF:ERR:UI]', domain, code, error?.message?.slice(0, 120));

    if (typeof window !== 'undefined' && (window as any).__toastFn) {
      (window as any).__toastFn({ title: 'Error', description: msg, variant: 'destructive' });
    }
  },
});

export const queryClient = new QueryClient({
  mutationCache,
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

export { apiRequest } from './api';
