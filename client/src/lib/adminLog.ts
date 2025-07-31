import { api } from '@/lib/api';

export async function logNav(event: {from:string; to:string}) {
  try {
    // Call the RPC only if it exists – swallow 404/401 to avoid UI crash
    const res = await api('rpc/insert_admin_log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: 'NAVIGATION', payload: event })
    });
    
    // Ignore 401 (not authenticated), 404 (function not found), or other errors
    if (res.status === 401 || res.status === 404) return;
    if (!res.ok) console.warn('[admin log] error:', res.status, await res.text().catch(() => 'Unknown error'));
  } catch (err: any) {
    // Silently ignore network errors to prevent UI freezes
    console.warn('[admin log] network error:', err?.message || 'Unknown error');
  }
}