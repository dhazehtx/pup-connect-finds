import { supabase } from '@/integrations/supabase/client';

const BACKEND_PREFIX = '/api'; // adjust if your proxy path differs

export const isAbortError = (err: any): boolean =>
  err?.name === 'AbortError' ||
  err?.code === 'ERR_CANCELED' ||
  err?.message?.toLowerCase?.().includes?.('aborted') ||
  err?.cause?.name === 'AbortError' ||
  err?.__isCanceled === true;

export async function apiRequest(
  path: string,
  options: { method?: string; headers?: Record<string, string>; signal?: AbortSignal; body?: any } = {}
) {
  const { method = 'GET', headers = {}, signal, body } = options;

  const {
    data: { session },
  } = await supabase.auth.getSession();
  let token = session?.access_token || '';

  if (token) {
    token = token.replace(/…|\u2026/g, '');
    if (!/^[A-Za-z0-9._-]+$/.test(token)) {
      console.warn('[apiRequest] Invalid token characters detected, clearing token');
      token = '';
    }
  }

  const url = path.startsWith('/api') ? path : 
               path.startsWith('/') ? `${BACKEND_PREFIX}${path}` : 
               `${BACKEND_PREFIX}/${path}`;

  const controller = new AbortController();
  const finalSignal = signal || controller.signal;
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(url, {
      method,
      headers: {
        Accept: 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: finalSignal,
    });
    clearTimeout(timeout);
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`API request failed ${res.status}: ${errText}`);
    }
    const responseText = await res.text();
    if (!responseText) return { success: true };
    try {
      return JSON.parse(responseText);
    } catch {
      return { success: true, raw: responseText };
    }
  } catch (e) {
    clearTimeout(timeout);
    if (!isAbortError(e)) {
      console.error('[apiRequest] error for', path, e);
    }
    throw e;
  }
}

// Centralized Supabase REST API helper with proper authentication
export async function api(path: string, opts: RequestInit = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  let token = session?.access_token || '';

  // Clean token to prevent ByteString errors
  if (token) {
    token = token.replace(/…|\u2026/g, '');
    if (!/^[A-Za-z0-9._-]+$/.test(token)) {
      console.warn('[api] Invalid token characters detected, clearing token');
      token = '';
    }
  }

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