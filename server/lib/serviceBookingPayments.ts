/**
 * Service-provider marketplace payments — authoritative transaction helpers.
 *
 * AUTHORITATIVE SERVICE CONNECT FLOW: separate charges + transfers.
 *   customer pays -> PaymentIntent on the PLATFORM account (funds held) ->
 *   booking marked paid (webhook) -> authorized completion -> Transfer of the
 *   provider's proceeds (gross - PAWS commission) to the provider's Connect
 *   account. PAWS retains the commission on the platform balance.
 *
 * AUTHORITATIVE CONNECT ACCOUNT FIELD: providers.stripe_account_id.
 *
 * The payout recipient is ALWAYS derived from the booking's service/provider
 * relationship (service_bookings -> pet_service_providers.user_id -> providers),
 * NEVER from the buyer (orders.user_id) or a client-supplied account.
 */
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export interface BookingProviderResolution {
  bookingId: string;
  customerUserId: string; // the buyer (service_bookings.user_id)
  providerUserId: string | null; // the provider owner (pet_service_providers.user_id)
  connectAccountId: string | null; // providers.stripe_account_id (authoritative)
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  totalPriceCents: number;
  paymentStatus: string;
  payoutStatus: string;
  status: string; // booking status
  stripePaymentIntentId: string | null;
}

/**
 * Pure, deterministic commission split. gross = platformFee + providerAmount.
 * feeBps is basis points (server-configured); clamped to [0, 10000].
 */
export function computeServiceFee(
  amountCents: number,
  feeBps: number,
): { platformFeeCents: number; providerAmountCents: number } {
  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    return { platformFeeCents: 0, providerAmountCents: 0 };
  }
  const bps = Number.isFinite(feeBps) && feeBps >= 0 ? Math.min(feeBps, 10000) : 0;
  const platformFeeCents = Math.floor((amountCents * bps) / 10000);
  const providerAmountCents = amountCents - platformFeeCents;
  return { platformFeeCents, providerAmountCents };
}

/** Dollars string (e.g. "49.99") → integer cents. Returns 0 for invalid. */
export function priceToCents(price: string | number | null | undefined): number {
  const n = typeof price === 'number' ? price : parseFloat(String(price ?? ''));
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.round(n * 100);
}

/**
 * Authoritatively resolve a booking's customer, provider owner and provider
 * Connect account from the booking/service/provider relationship. Returns null
 * if the booking does not exist. NEVER derives the provider from the buyer.
 */
export async function resolveBookingProvider(bookingId: string): Promise<BookingProviderResolution | null> {
  const { rows } = await pool.query<any>(
    `SELECT
       b.id                    AS booking_id,
       b.user_id               AS customer_user_id,
       b.total_price           AS total_price,
       b.status                AS status,
       b.payment_status        AS payment_status,
       b.payout_status         AS payout_status,
       b.stripe_payment_intent_id AS stripe_payment_intent_id,
       psp.user_id             AS provider_user_id,
       pr.stripe_account_id    AS connect_account_id,
       pr.charges_enabled      AS charges_enabled,
       pr.payouts_enabled      AS payouts_enabled
     FROM service_bookings b
     JOIN pet_service_providers psp ON psp.id = b.provider_id
     LEFT JOIN providers pr ON pr.user_id = psp.user_id
     WHERE b.id = $1
     LIMIT 1`,
    [bookingId],
  );
  const r = rows[0];
  if (!r) return null;
  return {
    bookingId: r.booking_id,
    customerUserId: r.customer_user_id,
    providerUserId: r.provider_user_id ?? null,
    connectAccountId: r.connect_account_id ?? null,
    chargesEnabled: Boolean(r.charges_enabled),
    payoutsEnabled: Boolean(r.payouts_enabled),
    totalPriceCents: priceToCents(r.total_price),
    paymentStatus: r.payment_status ?? 'unpaid',
    payoutStatus: r.payout_status ?? 'none',
    status: r.status ?? 'pending',
    stripePaymentIntentId: r.stripe_payment_intent_id ?? null,
  };
}

/** Mark a booking paid from a verified webhook (idempotent). */
export async function markServiceBookingPaid(paymentIntentId: string): Promise<void> {
  await pool.query(
    `UPDATE service_bookings
       SET payment_status = 'paid', paid_at = NOW(), updated_at = NOW()
     WHERE stripe_payment_intent_id = $1 AND payment_status <> 'paid'`,
    [paymentIntentId],
  );
}

/** Reflect a Stripe refund on the owning service booking (idempotent, PI-scoped). */
export async function markServiceBookingRefunded(paymentIntentId: string): Promise<void> {
  await pool.query(
    `UPDATE service_bookings
       SET payment_status = 'refunded', updated_at = NOW()
     WHERE stripe_payment_intent_id = $1 AND payment_status <> 'refunded'`,
    [paymentIntentId],
  );
}

/**
 * Flag the owning service booking as disputed (PI-scoped, idempotent). Because
 * the payout release requires payment_status='paid', a disputed booking can no
 * longer be released — so a payout can never falsely appear final while funds are
 * under dispute. Does not overwrite a refunded booking.
 */
export async function markServiceBookingDisputed(paymentIntentId: string): Promise<void> {
  await pool.query(
    `UPDATE service_bookings
       SET payment_status = 'disputed', updated_at = NOW()
     WHERE stripe_payment_intent_id = $1 AND payment_status NOT IN ('disputed', 'refunded')`,
    [paymentIntentId],
  );
}

export { pool as serviceBookingPool };
