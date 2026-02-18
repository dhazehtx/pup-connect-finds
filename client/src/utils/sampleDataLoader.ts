
import { apiRequest } from '@/lib/queryClient';

export const loadSampleData = async () => {
  if (import.meta.env.PROD) {
    console.warn('[PROOF:SEED] { ran: false, env: "production", reason: "blocked" }');
    return false;
  }
  try {
    console.log('[PROOF:SEED]', JSON.stringify({ ran: true, env: import.meta.env.MODE }));
    console.log('Triggering server-side seed via /api/qa/seed-test-data ...');

    const result = await apiRequest('/api/qa/seed-test-data', { method: 'POST' });
    console.log('[PROOF:SEED] Server seed result:', result);
    console.log('Sample data loaded via Neon/Drizzle API.');
    return true;
  } catch (error) {
    console.error('Error loading sample data:', error);
    return false;
  }
};

export const clearSampleData = async () => {
  if (import.meta.env.PROD) {
    console.warn('[PROOF:SEED] clearSampleData blocked in production');
    return false;
  }
  try {
    console.log('[PROOF:SEED] clearSampleData: use admin tools or database reset to clear seed data');
    return true;
  } catch (error) {
    console.error('Error clearing sample data:', error);
    return false;
  }
};
