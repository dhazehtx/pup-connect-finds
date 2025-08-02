import { apiRequest } from '@/lib/api';

export async function logNav(event: {from:string; to:string}) {
  try {
    // Use backend endpoint for admin logging instead of direct RPC call
    await apiRequest('/api/admin/log-navigation', {
      method: 'POST',
      body: {
        event_type: 'NAVIGATION',
        payload: event
      }
    });
    
    // Success - navigation logged
  } catch (err: any) {
    // Silently ignore all errors to prevent UI freezes
    console.warn('[admin log] network error:', err?.message || 'Unknown error');
  }
}