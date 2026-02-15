import { apiRequest } from '@/lib/api';

export async function fetchProviderStripeStatus(userId: string) {
  const data = await apiRequest(`/api/profiles/${userId}`);
  return data ? { stripe_account_id: data.stripe_account_id || null, stripe_connected: data.stripe_connected || false } : null;
}
