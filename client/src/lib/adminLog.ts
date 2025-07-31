import { apiRequest } from '@/lib/api';

export async function logNav(event: {from:string; to:string}) {
  try {
    // Use backend endpoint for admin logging instead of direct RPC call
    const res = await apiRequest('POST', '/api/admin/log-navigation', {
      event_type: 'NAVIGATION',
      payload: event
    });
    
    // Ignore 401 (not authenticated), 404 (endpoint not found), or other errors silently
    if (res.status === 401 || res.status === 404) return;
    if (!res.ok) console.warn('[admin log] error:', res.status, await res.text().catch(() => 'Unknown error'));
  } catch (err: any) {
    // Silently ignore all errors to prevent UI freezes
    console.warn('[admin log] network error:', err?.message || 'Unknown error');
  }
}