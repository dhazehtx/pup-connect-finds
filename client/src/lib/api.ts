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

// Centralized Supabase REST API helper with proper authentication
export async function api(path: string, opts: RequestInit = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token || '';
  const base = import.meta.env.VITE_SUPABASE_URL;

  return fetch(`${base}/rest/v1/${path}`, {
    ...opts,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      ...(opts.headers as Record<string, string>),
    },
  });
}

// Helper for parsing JSON responses with error handling
export async function apiJson<T = any>(path: string, opts: RequestInit = {}): Promise<T> {
  const response = await api(path, opts);
  
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }
  
  return response.json();
}