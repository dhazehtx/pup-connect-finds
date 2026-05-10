import { db } from "../db";
import { petServiceProviders, userServices } from "../../shared/schema";
import { and, eq } from "drizzle-orm";

function isPgUndefinedTable(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: string }).code === "42P01";
}

/**
 * Ensure a `user_services` row exists when a provider creates/updates a listing.
 * Does not downgrade an approved row.
 */
export async function ensureUserServicePending(userId: string, serviceType: string): Promise<void> {
  try {
    await db
      .insert(userServices)
      .values({
        user_id: userId,
        service_type: serviceType,
        verified: false,
        review_status: "pending",
        updated_at: new Date(),
      })
      .onConflictDoNothing({ target: [userServices.user_id, userServices.service_type] });
  } catch (e) {
    if (isPgUndefinedTable(e)) {
      console.warn(
        "[userServiceVerification] user_services table missing; run migrations (migrations/20260406_user_services_verification.sql or npm run db:push)",
      );
      return;
    }
    throw e;
  }
}

export async function applyAdminServiceVerification(args: {
  userId: string;
  serviceType: string;
  approved: boolean;
  adminUserId: string | null;
}): Promise<void> {
  const { userId, serviceType, approved, adminUserId } = args;
  const now = new Date();

  try {
    await db
      .insert(userServices)
      .values({
        user_id: userId,
        service_type: serviceType,
        verified: approved,
        review_status: approved ? "approved" : "rejected",
        reviewed_at: now,
        reviewed_by: adminUserId,
        updated_at: now,
      })
      .onConflictDoUpdate({
        target: [userServices.user_id, userServices.service_type],
        set: {
          verified: approved,
          review_status: approved ? "approved" : "rejected",
          reviewed_at: now,
          reviewed_by: adminUserId,
          updated_at: now,
        },
      });
  } catch (e) {
    if (!isPgUndefinedTable(e)) throw e;
    console.warn("[userServiceVerification] user_services missing; updating pet_service_providers only");
  }

  await db
    .update(petServiceProviders)
    .set({
      is_verified: approved,
      verification_status: approved ? "verified" : "rejected",
      updated_at: now,
    })
    .where(and(eq(petServiceProviders.user_id, userId), eq(petServiceProviders.service_type, serviceType)));
}
