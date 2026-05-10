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

export async function updateProviderCheck(providerId: string, updates: {
  check_status?: 'passed' | 'failed' | 'pending';
  check_data?: any;
  completed_at?: Date | null;
}) {
  const updateData: any = { updated_at: new Date() };
  
  if (updates.check_status) updateData.check_status = updates.check_status;
  if (updates.check_data !== undefined) updateData.check_data = updates.check_data;
  if (updates.completed_at !== undefined) updateData.completed_at = updates.completed_at;
  
  const [check] = await db
    .update(providerChecks)
    .set(updateData)
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

/** Payload from POST /api/providers/save (camelCase). Maps to `providers` columns. */
export async function updateProviderDetails(
  providerId: string,
  updates: {
    description?: string;
    pricePerService?: number;
    availability?: string;
    serviceTypes?: string[];
    radiusKm?: number;
    yearsExperience?: number;
    offersCats?: boolean;
    breedRestrictions?: string | null;
    rateType?: 'hourly' | 'per_visit' | 'flat';
    startingPrice?: number;
    minBookingMinutes?: number;
    cancellationPolicy?: 'flexible' | 'moderate' | 'strict';
    travelFeeEnabled?: boolean;
    travelFeeAmount?: number | null;
    additionalPetFeeEnabled?: boolean;
    additionalPetFeeAmount?: number | null;
    holidayRateEnabled?: boolean;
    holidayRateMultiplier?: number | null;
    communicationPolicy?: string;
    policyAcknowledged?: boolean;
    uploadedDocuments?: Record<string, string>;
  },
) {
  const patch: Record<string, unknown> = {
    updated_at: new Date(),
  };

  if (updates.serviceTypes !== undefined) {
    patch.service_types = updates.serviceTypes;
  }
  if (updates.radiusKm !== undefined) {
    patch.radius_km = updates.radiusKm;
  }
  if (updates.yearsExperience !== undefined) {
    patch.years_experience = updates.yearsExperience;
  }
  if (updates.offersCats !== undefined) {
    patch.offers_cats = updates.offersCats;
  }
  if (updates.breedRestrictions !== undefined) {
    patch.breed_restrictions = updates.breedRestrictions;
  }
  if (updates.rateType !== undefined) {
    patch.rate_type = updates.rateType;
  }
  if (updates.startingPrice !== undefined) {
    patch.starting_price = String(updates.startingPrice);
  }
  if (updates.minBookingMinutes !== undefined) {
    patch.min_booking_minutes = updates.minBookingMinutes;
  }
  if (updates.cancellationPolicy !== undefined) {
    patch.cancellation_policy = updates.cancellationPolicy;
  }
  if (updates.travelFeeEnabled !== undefined) {
    patch.travel_fee_enabled = updates.travelFeeEnabled;
  }
  if (updates.travelFeeAmount !== undefined) {
    patch.travel_fee_amount =
      updates.travelFeeAmount != null ? String(updates.travelFeeAmount) : null;
  }
  if (updates.additionalPetFeeEnabled !== undefined) {
    patch.additional_pet_fee_enabled = updates.additionalPetFeeEnabled;
  }
  if (updates.additionalPetFeeAmount !== undefined) {
    patch.additional_pet_fee_amount =
      updates.additionalPetFeeAmount != null ? String(updates.additionalPetFeeAmount) : null;
  }
  if (updates.holidayRateEnabled !== undefined) {
    patch.holiday_rate_enabled = updates.holidayRateEnabled;
  }
  if (updates.holidayRateMultiplier !== undefined) {
    patch.holiday_rate_multiplier =
      updates.holidayRateMultiplier != null ? String(updates.holidayRateMultiplier) : null;
  }
  if (updates.communicationPolicy !== undefined) {
    patch.communication_policy = updates.communicationPolicy;
  }
  if (updates.policyAcknowledged !== undefined) {
    patch.policy_acknowledged = updates.policyAcknowledged;
  }

  if (updates.availability !== undefined) {
    try {
      patch.availability = JSON.parse(updates.availability);
    } catch {
      patch.availability = { raw: updates.availability };
    }
  }

  const [provider] = await db
    .update(providers)
    .set(patch as any)
    .where(eq(providers.id, providerId))
    .returning();
  return provider;
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