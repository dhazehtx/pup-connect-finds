import { db } from '../../db';
import { providers, providerVerifications, providerChecks, providerPayouts } from '../../../shared/schema';
import { eq, and } from 'drizzle-orm';

// Provider CRUD operations
export async function createProvider(data: {
  user_id: string;
  legal_name: string;
  phone: string;
  photo_url?: string;
  service_types?: string[];
  radius_km?: number;
}) {
  const [provider] = await db.insert(providers).values(data).returning();
  return provider;
}

export async function getProviderByUserId(userId: string) {
  const [provider] = await db
    .select()
    .from(providers)
    .where(eq(providers.user_id, userId))
    .limit(1);
  return provider;
}

export async function getProviderById(providerId: string) {
  const [provider] = await db
    .select()
    .from(providers)
    .where(eq(providers.id, providerId))
    .limit(1);
  return provider;
}

export async function updateProviderStatus(providerId: string, status: 'pending' | 'verified' | 'pro' | 'rejected') {
  const [provider] = await db
    .update(providers)
    .set({ status, updated_at: new Date() })
    .where(eq(providers.id, providerId))
    .returning();
  return provider;
}

// Provider verification operations
export async function createProviderVerification(data: {
  provider_id: string;
  vendor?: string;
  id_status?: 'pending' | 'passed' | 'failed';
  liveness_passed?: boolean;
}) {
  const [verification] = await db
    .insert(providerVerifications)
    .values({
      provider_id: data.provider_id,
      vendor: data.vendor || 'internal',
      id_status: data.id_status || 'pending',
      liveness_passed: data.liveness_passed || false,
    })
    .returning();
  return verification;
}

export async function getProviderVerification(providerId: string) {
  const [verification] = await db
    .select()
    .from(providerVerifications)
    .where(eq(providerVerifications.provider_id, providerId))
    .limit(1);
  return verification;
}

export async function updateProviderVerificationStatus(
  providerId: string,
  updates: {
    id_status?: 'pending' | 'passed' | 'failed';
    liveness_passed?: boolean;
    vendor?: string;
  }
) {
  const [verification] = await db
    .update(providerVerifications)
    .set({ ...updates, updated_at: new Date() })
    .where(eq(providerVerifications.provider_id, providerId))
    .returning();
  return verification;
}

// Provider background check operations
export async function createProviderCheck(providerId: string) {
  const [check] = await db
    .insert(providerChecks)
    .values({
      provider_id: providerId,
      check_status: 'pending',
    })
    .returning();
  return check;
}

export async function getProviderCheck(providerId: string) {
  const [check] = await db
    .select()
    .from(providerChecks)
    .where(eq(providerChecks.provider_id, providerId))
    .limit(1);
  return check;
}

export async function setCheckStatus(
  providerId: string,
  status: 'pending' | 'passed' | 'failed'
) {
  const [check] = await db
    .update(providerChecks)
    .set({ check_status: status, updated_at: new Date() })
    .where(eq(providerChecks.provider_id, providerId))
    .returning();
  return check;
}

// Provider payout operations
export async function createProviderPayout(data: {
  provider_id: string;
  stripe_account_id: string;
  account_type?: 'individual' | 'business';
}) {
  const [payout] = await db
    .insert(providerPayouts)
    .values({
      provider_id: data.provider_id,
      stripe_account_id: data.stripe_account_id,
      account_type: data.account_type || 'individual',
    })
    .returning();
  return payout;
}

export async function getProviderPayout(providerId: string) {
  const [payout] = await db
    .select()
    .from(providerPayouts)
    .where(eq(providerPayouts.provider_id, providerId))
    .limit(1);
  return payout;
}

// Combined provider data fetching
export async function getProviderWithVerificationStatus(userId: string) {
  const provider = await getProviderByUserId(userId);
  if (!provider) return null;

  const verification = await getProviderVerification(provider.id);
  const backgroundCheck = await getProviderCheck(provider.id);
  const payout = await getProviderPayout(provider.id);

  return {
    ...provider,
    verification,
    backgroundCheck,
    payout,
  };
}