import { api } from '@/lib/api';

export async function logNav(event: {from:string; to:string}) {
  try {
    // Call the RPC only if it exists – swallow 404 to avoid UI crash
    const res = await api('rpc/insert_admin_log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: 'NAVIGATION', payload: event })
    });
    if (res.status === 404) return;        // function not deployed in prod → ignore
    if (!res.ok) console.warn('admin log error', await res.text());
  } catch (err) {
    console.warn('admin log network error', err);
  }
}