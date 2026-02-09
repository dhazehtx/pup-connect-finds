import { apiRequest } from '@/lib/api';

export async function logNav(event: {from:string; to:string}) {
  try {
    // Use backend endpoint for admin logging instead of direct RPC call
    await apiRequest('admin/log-navigation', {
      method: 'POST',
      body: {
        event_type: 'NAVIGATION',
        payload: event
      }
    });
    
    // Success - navigation logged
  } catch {
    // Silently ignore all errors to prevent UI freezes and console spam
  }
}