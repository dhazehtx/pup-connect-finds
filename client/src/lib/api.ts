import { supabase } from '@/integrations/supabase/client';

// Simple API client for making authenticated requests
export const apiRequest = async (method: string, url: string, data?: any) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Get current Supabase session and add Authorization header if available
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  const options: RequestInit = {
    method,
    headers,
    credentials: 'include', // Include cookies for authentication
  };

  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }

  return fetch(url, options);
};

// Supabase REST API helper with proper headers
export async function api(path: string, opts: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  return fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/${path}`, {
    ...opts,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${session?.access_token ?? ''}`,
      ...(opts.headers || {})
    }
  });
}