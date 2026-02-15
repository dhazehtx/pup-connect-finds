import { supabase } from "./supabase";
import { storage } from "../storage";

/**
 * Ensures a user has the "verified_provider" badge if they meet all verification criteria:
 * - Stripe connected (charges_enabled && payouts_enabled from providers table)
 * - Background check passed (background_check_status = "passed" from providers table) 
 * - Policy acknowledged (policyAcknowledged from provider_details or similar)
 * 
 * This function is idempotent - safe to call multiple times.
 */
export async function ensureVerifiedBadge(userId: string): Promise<void> {
  try {
    // Fetch provider record with verification flags
    const { data: provider, error: providerError } = await supabase
      .from("providers")
      .select("stripe_connected, background_check_status, charges_enabled, payouts_enabled")
      .eq("user_id", userId)
      .single();

    if (providerError) {
      console.error("[BADGE] Error fetching provider:", providerError);
      return;
    }

    if (!provider) {
      console.warn("[BADGE] Provider not found for user:", userId);
      return;
    }

    // Fetch service provider record for policy acknowledgment
    const { data: serviceProvider, error: serviceProviderError } = await supabase
      .from("service_providers")
      .select("policy_acknowledged")
      .eq("user_id", userId)
      .maybeSingle();

    // Policy acknowledged defaults to false if not found or not set
    const policyAcknowledged = serviceProvider?.policy_acknowledged === true;

    // Fetch profile for badges via Drizzle storage
    const profile = await storage.getProfile(userId);

    if (!profile) {
      console.warn("[BADGE] Profile not found for user:", userId);
      return;
    }

    // Check if user is fully verified
    // Stripe connected means both charges and payouts are enabled
    const stripeFullyConnected = provider.stripe_connected === true || 
                                  (provider.charges_enabled === true && provider.payouts_enabled === true);
    const backgroundPassed = provider.background_check_status === "passed";
    
    const isVerified = stripeFullyConnected && backgroundPassed && policyAcknowledged;

    if (!isVerified) {
      console.log("[BADGE] User not fully verified yet:", userId, {
        stripeConnected: stripeFullyConnected,
        backgroundPassed,
        policyAcknowledged
      });
      return;
    }

    // Parse existing badges
    const badges: string[] = Array.isArray(profile.badges) ? profile.badges : [];
    
    // Check if badge already exists
    if (badges.includes("verified_provider")) {
      console.log("[BADGE] User already has verified_provider badge:", userId);
      return;
    }

    // Add verified_provider badge via Drizzle storage
    const next = [...badges, "verified_provider"];
    const updatedProfile = await storage.updateProfile(userId, { badges: next });

    if (!updatedProfile) {
      console.error("[BADGE] Error updating badges for user:", userId);
      return;
    }

    console.log("[BADGE] ✓ Added verified_provider badge to user:", userId);
  } catch (err) {
    console.error("[BADGE] Unexpected error in ensureVerifiedBadge:", err);
  }
}
