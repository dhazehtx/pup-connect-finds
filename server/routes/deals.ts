import { debugApiLog, debugApiWarn } from '../lib/debugApi';
import { Router, Request, Response } from "express";
import Stripe from "stripe";
import { Pool } from "@neondatabase/serverless";
import { STRIPE_SECRET_KEY } from "../lib/config";
import { getBreederPlatformFeeBps } from "../lib/platformFees";
import { getOrCreateStripeCustomer } from "../lib/stripeCustomer";
import { generalRateLimit } from "../middleware/rateLimiting";
import {
  MIN_PROTECTED_PAYMENT_TOTAL_CENTS,
  RELEASABLE_DEAL_STATUSES,
  REUSABLE_PI_STATUSES,
  computeDealAmounts,
  isSellerPayoutReady,
  verifyFullyPaid,
  planReleaseTransfers,
  listingIsPurchasable,
  isUuid,
  clampExtensionHours,
  type DealPaymentRow,
} from "../lib/dealRules";
import crypto from "crypto";

const router = Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const stripe = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2025-08-27.basil" as any })
  : null;

/** Breeder platform fee (basis points) recorded on the deal; the seller payout is
 *  net of this. Server-side, config-driven (BREEDER_PLATFORM_FEE_BPS), default 0. */
const PLATFORM_FEE_BPS = getBreederPlatformFeeBps();
const DISPUTE_WINDOW_HOURS = 48;
const RESERVATION_HOURS = 72;

// ─── Authoritative seller Connect account + reusable release/refund helpers ───

/**
 * Authoritative seller Connect account: providers.stripe_account_id (Sprint 3),
 * falling back to profiles.stripe_account_id for legacy sellers. Never a
 * client-supplied account. payoutsEnabled is known only when a providers row exists.
 */
async function getSellerConnectAccount(
  sellerId: string,
): Promise<{ accountId: string | null; payoutsEnabled: boolean | null }> {
  const { rows } = await pool.query<{ pr_account: string | null; p_account: string | null; payouts_enabled: boolean | null }>(
    `SELECT pr.stripe_account_id AS pr_account, p.stripe_account_id AS p_account, pr.payouts_enabled AS payouts_enabled
     FROM profiles p LEFT JOIN providers pr ON pr.user_id = p.id WHERE p.id = $1`,
    [sellerId],
  );
  const r = rows[0];
  if (!r) return { accountId: null, payoutsEnabled: null };
  return { accountId: r.pr_account ?? r.p_account ?? null, payoutsEnabled: r.pr_account ? r.payouts_enabled : null };
}

type DealMoneyResult<T> = ({ ok: true } & T) | { ok: false; code: number; error: string };

/**
 * Atomic, idempotent release of held funds to the seller's authoritative Connect
 * account. An atomic status claim (releasable → RELEASING) prevents a double-payout
 * race, and deterministic per-charge Stripe idempotency keys prevent duplicate
 * transfers even across retries. State only advances to RELEASED after every
 * transfer succeeds.
 *
 * Hard invariants enforced HERE (not only at the endpoint):
 *  - FULLY PAID: succeeded payments must cover total_price_cents. A deposit-only
 *    deal is never releasable, even by an admin.
 *  - Claimable statuses are the RELEASABLE set only (post-full-payment states).
 *  - Transfers are funded from the deal's own charges via source_transaction —
 *    never from the platform's pooled available balance.
 */
async function releaseDealFunds(deal: any): Promise<DealMoneyResult<{ transferId: string; payoutAmount: number }>> {
  if (!stripe) return { ok: false, code: 503, error: "Stripe not configured" };

  const { accountId, payoutsEnabled } = await getSellerConnectAccount(deal.seller_id);
  if (!isSellerPayoutReady({ accountId, payoutsEnabled })) {
    return { ok: false, code: 400, error: "Seller's payout account is not ready to receive funds" };
  }

  // FULL-PAYMENT GATE — authoritative deal_payments rows, not the status column.
  const { rows: paymentRows } = await pool.query<DealPaymentRow>(
    `SELECT id, kind, status, amount_cents, stripe_payment_intent_id
     FROM deal_payments WHERE deal_id = $1 ORDER BY created_at`,
    [deal.id],
  );
  if (!verifyFullyPaid(paymentRows, deal.total_price_cents)) {
    return { ok: false, code: 409, error: "Deal is not fully paid — funds cannot be released" };
  }

  // Atomic claim — only ONE request can move a releasable deal into RELEASING,
  // and only from a post-full-payment status.
  const claim = await pool.query(
    `UPDATE deals SET status = 'RELEASING', updated_at = NOW()
     WHERE id = $1 AND status IN ('PAID_IN_FULL','DELIVERED_PENDING_CONFIRM','DELIVERED_CONFIRMED')
     RETURNING id`,
    [deal.id],
  );
  if (claim.rowCount === 0) {
    return { ok: false, code: 409, error: "Deal is not releasable or a release is already in progress" };
  }
  if (!RELEASABLE_DEAL_STATUSES.includes(deal.status)) {
    // Defensive: the SQL above is the enforcement; keep the constant authoritative.
    debugApiWarn(`[DEAL:RELEASE] status drift for deal=${deal.id}: ${deal.status}`);
  }

  const payoutAmount = deal.total_price_cents - deal.platform_fee_cents;
  if (payoutAmount <= 0) {
    await pool.query(`UPDATE deals SET status = $2, updated_at = NOW() WHERE id = $1 AND status = 'RELEASING'`, [deal.id, deal.status]);
    return { ok: false, code: 409, error: "Nothing to transfer" };
  }

  // Fund each transfer from the deal's own charges. Retry-safe: idempotency keys
  // are stable per (deal, payment), so a partial failure re-run returns the
  // already-created transfers instead of duplicating them.
  let lastTransferId = "";
  try {
    const plan = planReleaseTransfers(paymentRows, payoutAmount);
    for (const item of plan) {
      const pi = await stripe.paymentIntents.retrieve(item.stripePaymentIntentId);
      const chargeId = typeof pi.latest_charge === "string" ? pi.latest_charge : pi.latest_charge?.id;
      if (!chargeId) throw new Error(`No charge on PaymentIntent for payment ${item.paymentId}`);
      const transfer = await stripe.transfers.create(
        {
          amount: item.amountCents,
          currency: "usd",
          destination: accountId as string,
          transfer_group: `deal_${deal.id}`,
          source_transaction: chargeId,
          metadata: { deal_id: deal.id, deal_payment_id: item.paymentId },
        },
        { idempotencyKey: `deal_release_${deal.id}_${item.paymentId}` },
      );
      lastTransferId = transfer.id;
      await pool.query(
        `INSERT INTO deal_payouts (deal_id, stripe_transfer_id, seller_account_id, amount_cents, status)
         VALUES ($1,$2,$3,$4,'completed') ON CONFLICT (stripe_transfer_id) DO NOTHING`,
        [deal.id, transfer.id, accountId, item.amountCents],
      );
    }
  } catch (e: any) {
    // Never mark released on failure — revert the claim and record a failed payout.
    console.error(`[DEAL:RELEASE] transfer failed for deal=${deal.id}:`, e?.message);
    await pool.query(`UPDATE deals SET status = $2, updated_at = NOW() WHERE id = $1 AND status = 'RELEASING'`, [deal.id, deal.status]);
    await pool.query(`INSERT INTO deal_payouts (deal_id, seller_account_id, amount_cents, status) VALUES ($1,$2,$3,'failed')`, [deal.id, accountId, payoutAmount]);
    return { ok: false, code: 502, error: "Transfer to seller failed" };
  }

  await pool.query(`UPDATE deals SET status = 'RELEASED', released_at = NOW(), updated_at = NOW() WHERE id = $1`, [deal.id]);
  await pool.query(`UPDATE dog_listings SET status = 'sold', listing_status = 'sold', updated_at = NOW() WHERE id = $1`, [deal.listing_id]);
  return { ok: true, transferId: lastTransferId, payoutAmount };
}

/**
 * Idempotent buyer refund. Fails SAFE if funds were already released to the seller
 * (a Connect transfer reversal is required, which we do not perform automatically).
 */
async function refundDeal(deal: any, type: string): Promise<DealMoneyResult<{ refunded: string[] }>> {
  if (!stripe) return { ok: false, code: 503, error: "Stripe not configured" };
  if (deal.status === "REFUNDED") return { ok: true, refunded: [] }; // idempotent
  if (deal.status === "RELEASED" || deal.status === "RELEASING") {
    return { ok: false, code: 409, error: "Funds already released to seller; a transfer reversal must be handled manually" };
  }

  const { rows: payments } = await pool.query(
    `SELECT * FROM deal_payments WHERE deal_id = $1 AND status = 'succeeded' ORDER BY kind`,
    [deal.id],
  );
  const refunded: string[] = [];
  for (const payment of payments) {
    if (type === "deposit" && payment.kind !== "DEPOSIT") continue;
    if (type === "balance" && payment.kind !== "BALANCE") continue;
    if (!payment.stripe_payment_intent_id) continue;
    await stripe.refunds.create(
      { payment_intent: payment.stripe_payment_intent_id, metadata: { deal_id: deal.id, kind: payment.kind } },
      { idempotencyKey: `deal_refund_${payment.id}` }, // retries never double-refund
    );
    await pool.query(`UPDATE deal_payments SET status = 'refunded', updated_at = NOW() WHERE id = $1`, [payment.id]);
    refunded.push(payment.kind);
  }
  await pool.query(`UPDATE deals SET status = 'REFUNDED', updated_at = NOW() WHERE id = $1`, [deal.id]);
  await pool.query(`UPDATE dog_listings SET status = 'active', listing_status = 'active', updated_at = NOW() WHERE id = $1`, [deal.listing_id]);
  return { ok: true, refunded };
}

// POST /api/deals/:listingId/deposit
router.post("/:listingId/deposit", generalRateLimit, async (req: Request, res: Response) => {
  try {
    if (!stripe) return res.status(503).json({ error: "Stripe not configured" });

    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { listingId } = req.params;
    if (!isUuid(listingId)) return res.status(400).json({ error: "Invalid listing id" });

    const { rows: listings } = await pool.query(
      `SELECT l.id, l.user_id, l.price, l.status, l.listing_status, l.dog_name, l.rehoming,
              p.user_type AS seller_user_type
       FROM dog_listings l
       LEFT JOIN profiles p ON p.id = l.user_id
       WHERE l.id = $1 AND l.deleted_at IS NULL`,
      [listingId]
    );
    if (!listings[0]) return res.status(404).json({ error: "Listing not found" });

    const listing = listings[0];
    // 'available' is browsable alongside 'active' (useDogListings) — both purchasable.
    if (!listingIsPurchasable(listing.status, listing.listing_status)) {
      return res.status(400).json({ error: "Listing is not active" });
    }
    if (listing.user_id === userId) {
      return res.status(400).json({ error: "Cannot buy your own listing" });
    }

    // PAYOUT-READINESS GATE — a buyer must never commit funds to a seller who
    // cannot receive the resulting payout. Server-authoritative (providers row +
    // affirmative payouts_enabled); the client never supplies eligibility.
    const sellerAccount = await getSellerConnectAccount(listing.user_id);
    if (!isSellerPayoutReady(sellerAccount)) {
      return res.status(409).json({
        error: "This seller hasn't finished setting up payouts yet, so Protected Payment isn't available for this listing. Try contacting the seller instead.",
        code: "SELLER_NOT_PAYOUT_READY",
      });
    }

    const { rows: existingDeals } = await pool.query(
      `SELECT * FROM deals WHERE listing_id = $1 AND status NOT IN ('CANCELED', 'EXPIRED', 'REFUNDED')`,
      [listingId]
    );
    if (existingDeals.length > 0) {
      // Re-entry idempotency: the SAME buyer returning to an unpaid reservation
      // (refresh, second tab, abandoned checkout) resumes the existing deposit
      // PaymentIntent instead of being dead-ended by the duplicate-deal guard —
      // and can never mint a second deal or a second charge for it.
      const own = existingDeals.find((d: any) => d.buyer_id === userId && d.status === "RESERVED");
      if (own) {
        const { rows: depositPayments } = await pool.query(
          `SELECT * FROM deal_payments WHERE deal_id = $1 AND kind = 'DEPOSIT' ORDER BY created_at DESC LIMIT 1`,
          [own.id]
        );
        const existingPayment = depositPayments[0];
        if (existingPayment?.stripe_payment_intent_id) {
          const pi = await stripe.paymentIntents.retrieve(existingPayment.stripe_payment_intent_id);
          if (pi.status === "succeeded") {
            return res.status(409).json({ error: "Your deposit is already paid.", code: "DEPOSIT_ALREADY_PAID", dealId: own.id });
          }
          if ((REUSABLE_PI_STATUSES as readonly string[]).includes(pi.status)) {
            return res.json({
              dealId: own.id,
              clientSecret: pi.client_secret,
              depositCents: own.deposit_cents,
              totalCents: own.total_price_cents,
              balanceCents: own.balance_cents,
              platformFeeCents: own.platform_fee_cents,
              reservedUntil: own.reserved_until ? new Date(own.reserved_until).toISOString() : null,
            });
          }
        }
        return res.status(409).json({ error: "You already have a reservation for this listing.", code: "DEAL_IN_PROGRESS", dealId: own.id });
      }
      const ownActive = existingDeals.find((d: any) => d.buyer_id === userId);
      if (ownActive) {
        return res.status(409).json({ error: "You already have a Protected Payment in progress for this listing.", code: "DEAL_IN_PROGRESS", dealId: ownActive.id });
      }
      return res.status(400).json({ error: "Listing already has an active deal" });
    }

    const totalCents = Math.round(parseFloat(listing.price) * 100);
    // Eligibility gate BEFORE any deal is created: a sub-minimum sale price
    // would produce a deposit Stripe cannot charge (amount_too_small). Clear
    // PAWS message, no Stripe internals, nothing written.
    if (totalCents < MIN_PROTECTED_PAYMENT_TOTAL_CENTS) {
      return res.status(400).json({
        error: `Protected Payment requires a sale price of at least $${(MIN_PROTECTED_PAYMENT_TOTAL_CENTS / 100).toFixed(2)}.`,
        code: "PROTECTED_PAYMENT_MIN_PRICE",
      });
    }
    // PAWS v1 policy: individual rehoming and shelter/rescue transactions carry
    // 0% PAWS commission. The fee is fixed here at deal creation and flows to
    // release from the stored platform_fee_cents, so a zero fee means the
    // seller receives the full amount.
    const commissionExempt = listing.rehoming === true || listing.seller_user_type === 'shelter';
    const { depositCents, balanceCents, platformFeeCents } = computeDealAmounts(totalCents, PLATFORM_FEE_BPS, commissionExempt);

    const reservedUntil = new Date(Date.now() + RESERVATION_HOURS * 60 * 60 * 1000);

    const { rows: dealRows } = await pool.query(
      `INSERT INTO deals (listing_id, buyer_id, seller_id, total_price_cents, deposit_cents, balance_cents, 
        platform_fee_cents, status, reserved_until)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'RESERVED', $8) RETURNING id`,
      [listingId, userId, listing.user_id, totalCents, depositCents, balanceCents, platformFeeCents, reservedUntil]
    );
    const dealId = dealRows[0].id;

    // Failure atomicity: everything after the deal INSERT (customer binding, PI
    // creation, payment-row insert) can fail without a charge existing. If it
    // does, the brand-new deal must not stay RESERVED — that would block the
    // listing behind the duplicate-active-deal guard with no buyer retry path.
    // Cancel it (terminal status the guard ignores) and fail cleanly. The guard
    // is status='RESERVED' so a deal with any real progress can never be
    // touched, and no financial history exists yet to destroy.
    let paymentIntent: Stripe.PaymentIntent;
    try {
      const customerId = await getOrCreateStripeCustomer(userId, req.user?.email ?? undefined);

      // Funds stay on the platform account until POST /release creates a Connect
      // transfer. transfer_group ties the charges and the eventual transfers to
      // this deal on the Stripe side.
      const piParams: Stripe.PaymentIntentCreateParams = {
        amount: depositCents,
        currency: "usd",
        customer: customerId,
        transfer_group: `deal_${dealId}`,
        metadata: {
          deal_id: dealId,
          listing_id: listingId,
          kind: "DEPOSIT",
          user_id: userId,
        },
        automatic_payment_methods: { enabled: true },
      };

      paymentIntent = await stripe.paymentIntents.create(piParams);

      await pool.query(
        `INSERT INTO deal_payments (deal_id, kind, stripe_payment_intent_id, amount_cents, status)
         VALUES ($1, 'DEPOSIT', $2, $3, 'pending')`,
        [dealId, paymentIntent.id, depositCents]
      );
    } catch (initError: any) {
      console.error("[DEAL:DEPOSIT] payment init failed — canceling fresh deal:", initError?.message);
      await pool.query(
        `UPDATE deals SET status = 'CANCELED', updated_at = NOW() WHERE id = $1 AND status = 'RESERVED'`,
        [dealId]
      );
      return res.status(502).json({
        error: "Could not start the payment. No charge was made — please try again.",
        code: "PAYMENT_INIT_FAILED",
      });
    }

    debugApiLog(`[PROOF:DEAL:DEPOSIT_INITIATED] deal=${dealId} pi=${paymentIntent.id} amount=${depositCents}`);

    return res.json({
      dealId,
      clientSecret: paymentIntent.client_secret,
      depositCents,
      totalCents,
      balanceCents,
      platformFeeCents,
      reservedUntil: reservedUntil.toISOString(),
    });
  } catch (error: any) {
    console.error("[DEAL:DEPOSIT] Error:", error);
    return res.status(500).json({ error: "Internal error" });
  }
});

// POST /api/deals/:dealId/balance
router.post("/:dealId/balance", generalRateLimit, async (req: Request, res: Response) => {
  try {
    if (!stripe) return res.status(503).json({ error: "Stripe not configured" });

    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { dealId } = req.params;
    if (!isUuid(dealId)) return res.status(400).json({ error: "Invalid deal id" });

    const { rows: dealRows } = await pool.query(
      "SELECT * FROM deals WHERE id = $1",
      [dealId]
    );
    if (!dealRows[0]) return res.status(404).json({ error: "Deal not found" });

    const deal = dealRows[0];
    if (deal.buyer_id !== userId) return res.status(403).json({ error: "Not the buyer" });
    if (deal.status !== "DEPOSIT_PAID") {
      const code = deal.status === "PAID_IN_FULL" ? "BALANCE_ALREADY_PAID" : "BALANCE_NOT_PAYABLE";
      return res.status(400).json({ error: `Cannot pay balance in status ${deal.status}`, code });
    }

    // DUPLICATE-CHARGE PROTECTION — double-click, refresh, second tab, retry,
    // and late-webhook races all resolve to the SAME PaymentIntent. A new PI is
    // minted only when no BALANCE payment exists or the previous one is dead.
    const { rows: balancePayments } = await pool.query(
      `SELECT * FROM deal_payments WHERE deal_id = $1 AND kind = 'BALANCE' ORDER BY created_at DESC`,
      [dealId]
    );
    if (balancePayments.some((p: any) => p.status === "succeeded")) {
      return res.status(409).json({ error: "The balance for this deal is already paid.", code: "BALANCE_ALREADY_PAID" });
    }
    const pending = balancePayments.find((p: any) => p.status === "pending" && p.stripe_payment_intent_id);
    if (pending) {
      const pi = await stripe.paymentIntents.retrieve(pending.stripe_payment_intent_id);
      if (pi.status === "succeeded") {
        // Webhook hasn't landed yet — sync authoritative state and refuse a second charge.
        await pool.query(`UPDATE deal_payments SET status = 'succeeded', updated_at = NOW() WHERE id = $1`, [pending.id]);
        await pool.query(`UPDATE deals SET status = 'PAID_IN_FULL', updated_at = NOW() WHERE id = $1 AND status = 'DEPOSIT_PAID'`, [dealId]);
        return res.status(409).json({ error: "The balance for this deal is already paid.", code: "BALANCE_ALREADY_PAID" });
      }
      if ((REUSABLE_PI_STATUSES as readonly string[]).includes(pi.status)) {
        return res.json({ clientSecret: pi.client_secret, balanceCents: deal.balance_cents });
      }
      // canceled or otherwise dead — mark the row failed and fall through to a fresh PI.
      await pool.query(`UPDATE deal_payments SET status = 'failed', updated_at = NOW() WHERE id = $1`, [pending.id]);
    }

    const customerId = await getOrCreateStripeCustomer(userId, req.user?.email ?? undefined);

    const piParams: Stripe.PaymentIntentCreateParams = {
      amount: deal.balance_cents,
      currency: "usd",
      customer: customerId,
      transfer_group: `deal_${dealId}`,
      metadata: {
        deal_id: dealId,
        listing_id: deal.listing_id,
        kind: "BALANCE",
        user_id: userId,
      },
      automatic_payment_methods: { enabled: true },
    };

    const paymentIntent = await stripe.paymentIntents.create(piParams);

    await pool.query(
      `INSERT INTO deal_payments (deal_id, kind, stripe_payment_intent_id, amount_cents, status)
       VALUES ($1, 'BALANCE', $2, $3, 'pending')`,
      [dealId, paymentIntent.id, deal.balance_cents]
    );

    debugApiLog(`[PROOF:DEAL:BALANCE_INITIATED] deal=${dealId} pi=${paymentIntent.id} amount=${deal.balance_cents}`);

    return res.json({
      clientSecret: paymentIntent.client_secret,
      balanceCents: deal.balance_cents,
    });
  } catch (error: any) {
    console.error("[DEAL:BALANCE] Error:", error);
    return res.status(500).json({ error: "Could not start the balance payment. Please try again." });
  }
});

// POST /api/deals/:dealId/handoff-code — seller generates handoff code
router.post("/:dealId/handoff-code", async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { dealId } = req.params;
    const { rows } = await pool.query("SELECT * FROM deals WHERE id = $1", [dealId]);
    if (!rows[0]) return res.status(404).json({ error: "Deal not found" });

    const deal = rows[0];
    if (deal.seller_id !== userId) return res.status(403).json({ error: "Not the seller" });
    if (deal.status !== "PAID_IN_FULL") {
      return res.status(400).json({ error: `Cannot generate handoff code in status ${deal.status}` });
    }

    const code = crypto.randomBytes(4).toString("hex").toUpperCase();
    await pool.query(
      "UPDATE deals SET handoff_code = $1, updated_at = NOW() WHERE id = $2",
      [code, dealId]
    );

    debugApiLog(`[PROOF:DEAL:HANDOFF_CODE] deal=${dealId}`);
    return res.json({ handoffCode: code });
  } catch (error: any) {
    console.error("[DEAL:HANDOFF] Error:", error);
    return res.status(500).json({ error: "Internal error" });
  }
});

// POST /api/deals/:dealId/mark-delivered — seller marks as delivered with handoff code
router.post("/:dealId/mark-delivered", async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { dealId } = req.params;
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "Handoff code required" });

    const { rows } = await pool.query("SELECT * FROM deals WHERE id = $1", [dealId]);
    if (!rows[0]) return res.status(404).json({ error: "Deal not found" });

    const deal = rows[0];
    if (deal.seller_id !== userId) return res.status(403).json({ error: "Not the seller" });
    if (deal.status !== "PAID_IN_FULL") {
      return res.status(400).json({ error: `Cannot mark delivered in status ${deal.status}` });
    }
    if (deal.handoff_code !== code) {
      return res.status(400).json({ error: "Invalid handoff code" });
    }

    await pool.query(
      "UPDATE deals SET status = 'DELIVERED_PENDING_CONFIRM', delivered_at = NOW(), updated_at = NOW() WHERE id = $1",
      [dealId]
    );

    debugApiLog(`[PROOF:DEAL:DELIVERED] deal=${dealId}`);
    return res.json({ status: "DELIVERED_PENDING_CONFIRM" });
  } catch (error: any) {
    console.error("[DEAL:DELIVERED] Error:", error);
    return res.status(500).json({ error: "Internal error" });
  }
});

// POST /api/deals/:dealId/confirm-received — buyer confirms receipt
router.post("/:dealId/confirm-received", async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { dealId } = req.params;
    const { rows } = await pool.query("SELECT * FROM deals WHERE id = $1", [dealId]);
    if (!rows[0]) return res.status(404).json({ error: "Deal not found" });

    const deal = rows[0];
    if (deal.buyer_id !== userId) return res.status(403).json({ error: "Not the buyer" });
    if (deal.status !== "DELIVERED_PENDING_CONFIRM") {
      return res.status(400).json({ error: `Cannot confirm in status ${deal.status}` });
    }

    const disputeWindowEnds = new Date(Date.now() + DISPUTE_WINDOW_HOURS * 60 * 60 * 1000);

    await pool.query(
      `UPDATE deals SET status = 'DELIVERED_CONFIRMED', confirmed_at = NOW(), 
       dispute_window_ends = $1, updated_at = NOW() WHERE id = $2`,
      [disputeWindowEnds, dealId]
    );

    debugApiLog(`[PROOF:DEAL:CONFIRMED] deal=${dealId} disputeWindowEnds=${disputeWindowEnds.toISOString()}`);
    return res.json({ status: "DELIVERED_CONFIRMED", disputeWindowEnds: disputeWindowEnds.toISOString() });
  } catch (error: any) {
    console.error("[DEAL:CONFIRM] Error:", error);
    return res.status(500).json({ error: "Internal error" });
  }
});

// POST /api/deals/:dealId/release — release payout to seller (auto or admin)
router.post("/:dealId/release", async (req: Request, res: Response) => {
  try {
    // FIX: release was UNAUTHENTICATED — an anonymous request could trigger a
    // transfer whenever the auto-release condition held. Require authentication.
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { dealId } = req.params;
    const { rows } = await pool.query("SELECT * FROM deals WHERE id = $1", [dealId]);
    if (!rows[0]) return res.status(404).json({ error: "Deal not found" });

    const deal = rows[0];
    if (deal.status === "RELEASED") return res.status(400).json({ error: "Deal payout already released" });
    if (deal.status === "DISPUTED") return res.status(400).json({ error: "Resolve dispute before releasing funds" });
    if (deal.status === "REFUNDED" || deal.status === "CANCELED") {
      return res.status(400).json({ error: `Cannot release a ${String(deal.status).toLowerCase()} deal` });
    }

    // Authorization: an admin, or the auto-release condition (buyer-confirmed
    // delivery whose dispute window has closed). No other party can release.
    const isAdmin = req.user?.is_admin === true;
    const isAutoRelease =
      deal.status === "DELIVERED_CONFIRMED" &&
      deal.dispute_window_ends &&
      new Date(deal.dispute_window_ends) < new Date();
    if (!isAdmin && !isAutoRelease) {
      return res.status(403).json({ error: "Dispute window has not ended, or you are not authorized to release" });
    }

    const result = await releaseDealFunds(deal); // atomic + idempotent + authoritative seller account
    if (!result.ok) return res.status(result.code).json({ error: result.error });

    debugApiLog(`[PROOF:PAYOUT:RELEASED] deal=${dealId} transfer=${result.transferId} amount=${result.payoutAmount}`);
    return res.json({ status: "RELEASED", transferId: result.transferId, payoutAmount: result.payoutAmount });
  } catch (error: any) {
    console.error("[DEAL:RELEASE] Error:", error);
    return res.status(500).json({ error: "Internal error" });
  }
});

// POST /api/deals/:dealId/dispute — buyer opens dispute
router.post("/:dealId/dispute", async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { dealId } = req.params;
    const { reason, description } = req.body;
    if (!reason) return res.status(400).json({ error: "Reason required" });

    const { rows } = await pool.query("SELECT * FROM deals WHERE id = $1", [dealId]);
    if (!rows[0]) return res.status(404).json({ error: "Deal not found" });

    const deal = rows[0];
    if (deal.buyer_id !== userId) return res.status(403).json({ error: "Not the buyer" });
    const validStatuses = ["DELIVERED_PENDING_CONFIRM", "DELIVERED_CONFIRMED", "PAID_IN_FULL"];
    if (!validStatuses.includes(deal.status)) {
      return res.status(400).json({ error: `Cannot dispute in status ${deal.status}` });
    }

    await pool.query(
      `INSERT INTO deal_disputes (deal_id, opened_by, reason, description, status) VALUES ($1, $2, $3, $4, 'open')`,
      [dealId, userId, reason, description || null]
    );

    await pool.query(
      "UPDATE deals SET status = 'DISPUTED', updated_at = NOW() WHERE id = $1",
      [dealId]
    );

    debugApiLog(`[PROOF:DEAL:DISPUTED] deal=${dealId} by=${userId} reason=${reason}`);
    return res.json({ status: "DISPUTED" });
  } catch (error: any) {
    console.error("[DEAL:DISPUTE] Error:", error);
    return res.status(500).json({ error: "Internal error" });
  }
});

// POST /api/deals/:dealId/refund — admin refunds a deal
router.post("/:dealId/refund", async (req: Request, res: Response) => {
  try {
    const isAdmin = req.user?.is_admin === true;
    if (!isAdmin) return res.status(403).json({ error: "Admin only" });

    const { dealId } = req.params;
    const { type } = req.body;

    const { rows } = await pool.query("SELECT * FROM deals WHERE id = $1", [dealId]);
    if (!rows[0]) return res.status(404).json({ error: "Deal not found" });

    const result = await refundDeal(rows[0], type); // idempotent; fails safe if already released
    if (!result.ok) return res.status(result.code).json({ error: result.error });

    debugApiLog(`[PROOF:DEAL:REFUNDED] deal=${dealId} refunded=${result.refunded.join(",")}`);
    return res.json({ status: "REFUNDED", refunded: result.refunded });
  } catch (error: any) {
    console.error("[DEAL:REFUND] Error:", error);
    return res.status(500).json({ error: "Internal error" });
  }
});

// POST /api/deals/:dealId/cancel — cancel a deal (admin or buyer before payment)
router.post("/:dealId/cancel", async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { dealId } = req.params;
    const { rows } = await pool.query("SELECT * FROM deals WHERE id = $1", [dealId]);
    if (!rows[0]) return res.status(404).json({ error: "Deal not found" });

    const deal = rows[0];
    const isAdmin = req.user?.is_admin === true;
    const isBuyer = deal.buyer_id === userId;

    if (!isAdmin && !isBuyer) return res.status(403).json({ error: "Not authorized" });
    if (!isAdmin && !["DRAFT", "RESERVED"].includes(deal.status)) {
      return res.status(400).json({ error: "Cannot cancel after payment" });
    }
    // Cancel must never orphan money. Released/releasing deals are immutable
    // here, and collected funds must go through the refund path (which relists
    // the listing itself) — CANCELED with a succeeded charge would strand the
    // buyer's money with no visible trail.
    if (["RELEASED", "RELEASING"].includes(deal.status)) {
      return res.status(409).json({ error: "Funds were released to the seller — this deal can no longer be canceled" });
    }
    const { rows: paidRows } = await pool.query(
      `SELECT id FROM deal_payments WHERE deal_id = $1 AND status = 'succeeded' LIMIT 1`,
      [dealId]
    );
    if (paidRows.length > 0 && deal.status !== "REFUNDED") {
      return res.status(409).json({ error: "This deal has a completed payment — refund it instead of canceling", code: "REFUND_REQUIRED" });
    }

    // Best-effort: kill any still-confirmable PaymentIntents so a stale checkout
    // tab cannot pay into a canceled deal. If one completed in the meantime, the
    // cancellation is aborted (the webhook will advance the deal instead).
    if (stripe) {
      const { rows: pendingRows } = await pool.query(
        `SELECT id, stripe_payment_intent_id FROM deal_payments WHERE deal_id = $1 AND status = 'pending' AND stripe_payment_intent_id IS NOT NULL`,
        [dealId]
      );
      for (const p of pendingRows) {
        try {
          await stripe.paymentIntents.cancel(p.stripe_payment_intent_id);
        } catch {
          const pi = await stripe.paymentIntents.retrieve(p.stripe_payment_intent_id).catch(() => null);
          if (pi?.status === "succeeded") {
            return res.status(409).json({ error: "A payment on this deal just completed — it can no longer be canceled", code: "PAYMENT_COMPLETED" });
          }
          // already canceled / uncancelable-but-dead: proceed
        }
      }
    }

    await pool.query(
      "UPDATE deals SET status = 'CANCELED', updated_at = NOW() WHERE id = $1",
      [dealId]
    );
    await pool.query(
      "UPDATE dog_listings SET status = 'active', listing_status = 'active', updated_at = NOW() WHERE id = $1",
      [deal.listing_id]
    );

    debugApiLog(`[PROOF:DEAL:CANCELED] deal=${dealId} by=${userId}`);
    return res.json({ status: "CANCELED" });
  } catch (error: any) {
    console.error("[DEAL:CANCEL] Error:", error);
    return res.status(500).json({ error: "Internal error" });
  }
});

// POST /api/deals/:dealId/resolve — admin resolves dispute
router.post("/:dealId/resolve", async (req: Request, res: Response) => {
  try {
    const isAdmin = req.user?.is_admin === true;
    if (!isAdmin) return res.status(403).json({ error: "Admin only" });

    const { dealId } = req.params;
    const { resolution, action } = req.body;

    if (!resolution || !action) {
      return res.status(400).json({ error: "Resolution and action required" });
    }

    const { rows: disputes } = await pool.query(
      "SELECT * FROM deal_disputes WHERE deal_id = $1 AND status = 'open' LIMIT 1",
      [dealId]
    );
    if (!disputes[0]) return res.status(404).json({ error: "No open dispute found" });

    await pool.query(
      `UPDATE deal_disputes SET status = 'resolved', resolution = $1, resolved_by = $2, resolved_at = NOW()
       WHERE id = $3`,
      [resolution, req.user?.id, disputes[0].id]
    );

    const { rows: dealRows } = await pool.query("SELECT * FROM deals WHERE id = $1", [dealId]);
    if (!dealRows[0]) return res.status(404).json({ error: "Deal not found" });
    const deal = dealRows[0];

    // Resolution actions must actually MOVE money — previously they only flipped
    // the status (a stub), so "RELEASED"/"REFUNDED" could be recorded with no
    // Stripe transfer/refund. Delegate to the authoritative, idempotent helpers.
    if (action === "release") {
      // Clear DISPUTED so the atomic release can claim the deal, then release for real.
      await pool.query(`UPDATE deals SET status = 'DELIVERED_CONFIRMED', updated_at = NOW() WHERE id = $1 AND status = 'DISPUTED'`, [dealId]);
      const result = await releaseDealFunds({ ...deal, status: "DELIVERED_CONFIRMED" });
      if (!result.ok) return res.status(result.code).json({ error: result.error });
      debugApiLog(`[PROOF:DEAL:RESOLVED] deal=${dealId} action=release transfer=${result.transferId}`);
      return res.json({ status: "RELEASED", transferId: result.transferId });
    }
    if (action === "refund") {
      const result = await refundDeal(deal, "all");
      if (!result.ok) return res.status(result.code).json({ error: result.error });
      debugApiLog(`[PROOF:DEAL:RESOLVED] deal=${dealId} action=refund refunded=${result.refunded.join(",")}`);
      return res.json({ status: "REFUNDED", refunded: result.refunded });
    }

    await pool.query("UPDATE deals SET status = 'CANCELED', updated_at = NOW() WHERE id = $1", [dealId]);
    debugApiLog(`[PROOF:DEAL:RESOLVED] deal=${dealId} action=cancel resolution=${resolution}`);
    return res.json({ status: "CANCELED" });
  } catch (error: any) {
    console.error("[DEAL:RESOLVE] Error:", error);
    return res.status(500).json({ error: "Internal error" });
  }
});

// GET /api/deals — list user's deals
router.get("/", async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { role } = req.query;
    let query: string;
    let params: any[];

    if (role === "seller") {
      query = `SELECT d.*, dl.dog_name, dl.breed, dl.image_url, 
        p.username as buyer_username, p.avatar_url as buyer_avatar
        FROM deals d 
        LEFT JOIN dog_listings dl ON d.listing_id = dl.id 
        LEFT JOIN profiles p ON d.buyer_id = p.id
        WHERE d.seller_id = $1 ORDER BY d.created_at DESC`;
      params = [userId];
    } else {
      query = `SELECT d.*, dl.dog_name, dl.breed, dl.image_url, 
        p.username as seller_username, p.avatar_url as seller_avatar
        FROM deals d 
        LEFT JOIN dog_listings dl ON d.listing_id = dl.id 
        LEFT JOIN profiles p ON d.seller_id = p.id
        WHERE d.buyer_id = $1 ORDER BY d.created_at DESC`;
      params = [userId];
    }

    const { rows } = await pool.query(query, params);
    return res.json(rows);
  } catch (error: any) {
    console.error("[DEAL:LIST] Error:", error);
    return res.status(500).json({ error: "Internal error" });
  }
});

// GET /api/deals/:dealId — get deal details
router.get("/:dealId", async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { dealId } = req.params;
    if (!isUuid(dealId)) return res.status(400).json({ error: "Invalid deal id" });
    const { rows } = await pool.query(
      `SELECT d.*, dl.dog_name, dl.breed, dl.image_url, dl.price,
        bp.username as buyer_username, bp.avatar_url as buyer_avatar,
        sp.username as seller_username, sp.avatar_url as seller_avatar
       FROM deals d 
       LEFT JOIN dog_listings dl ON d.listing_id = dl.id 
       LEFT JOIN profiles bp ON d.buyer_id = bp.id
       LEFT JOIN profiles sp ON d.seller_id = sp.id
       WHERE d.id = $1`,
      [dealId]
    );
    if (!rows[0]) return res.status(404).json({ error: "Deal not found" });

    const deal = rows[0];
    // Party membership or admin — is_admin is the ONE canonical admin flag
    // (DB-sourced in authMiddleware); profiles.role is not consulted for deals.
    if (deal.buyer_id !== userId && deal.seller_id !== userId && req.user?.is_admin !== true) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const { rows: payments } = await pool.query(
      "SELECT * FROM deal_payments WHERE deal_id = $1 ORDER BY created_at",
      [dealId]
    );
    const { rows: payouts } = await pool.query(
      "SELECT * FROM deal_payouts WHERE deal_id = $1 ORDER BY created_at",
      [dealId]
    );
    const { rows: disputes } = await pool.query(
      "SELECT * FROM deal_disputes WHERE deal_id = $1 ORDER BY created_at",
      [dealId]
    );

    return res.json({ ...deal, payments, payouts, disputes });
  } catch (error: any) {
    console.error("[DEAL:GET] Error:", error);
    return res.status(500).json({ error: "Internal error" });
  }
});

// GET /api/deals/admin/all — admin list all deals
router.get("/admin/all", async (req: Request, res: Response) => {
  try {
    const isAdmin = req.user?.is_admin === true;
    if (!isAdmin) return res.status(403).json({ error: "Admin only" });

    const { status, page = "1", limit = "20" } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let whereClause = "";
    const params: any[] = [];

    if (status && status !== "ALL") {
      whereClause = "WHERE d.status = $1";
      params.push(status);
    }

    const countQ = await pool.query(`SELECT COUNT(*) FROM deals d ${whereClause}`, params);
    const total = parseInt(countQ.rows[0].count);

    const query = `
      SELECT d.*, dl.dog_name, dl.breed, dl.image_url, dl.price,
        bp.username as buyer_username, sp.username as seller_username
      FROM deals d 
      LEFT JOIN dog_listings dl ON d.listing_id = dl.id 
      LEFT JOIN profiles bp ON d.buyer_id = bp.id
      LEFT JOIN profiles sp ON d.seller_id = sp.id
      ${whereClause}
      ORDER BY d.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;

    params.push(parseInt(limit as string), offset);
    const { rows } = await pool.query(query, params);

    return res.json({ deals: rows, total, page: parseInt(page as string), limit: parseInt(limit as string) });
  } catch (error: any) {
    console.error("[DEAL:ADMIN:LIST] Error:", error);
    return res.status(500).json({ error: "Internal error" });
  }
});

// POST /api/deals/admin/:dealId/extend — admin extends reservation
router.post("/admin/:dealId/extend", async (req: Request, res: Response) => {
  try {
    const isAdmin = req.user?.is_admin === true;
    if (!isAdmin) return res.status(403).json({ error: "Admin only" });

    const { dealId } = req.params;
    if (!isUuid(dealId)) return res.status(400).json({ error: "Invalid deal id" });
    const hours = clampExtensionHours(req.body?.hours ?? 72);

    const newDeadline = new Date(Date.now() + hours * 60 * 60 * 1000);
    await pool.query(
      "UPDATE deals SET reserved_until = $1, updated_at = NOW() WHERE id = $2",
      [newDeadline, dealId]
    );

    debugApiLog(`[PROOF:DEAL:EXTENDED] deal=${dealId} hours=${hours}`);
    return res.json({ reservedUntil: newDeadline.toISOString() });
  } catch (error: any) {
    console.error("[DEAL:EXTEND] Error:", error);
    return res.status(500).json({ error: "Internal error" });
  }
});

// ─────────────────── automation: expiry + auto-release sweep ───────────────────

/**
 * Periodic Protected Payment sweep. Idempotent and safe to run repeatedly:
 *
 *  1. EXPIRE unpaid reservations past reserved_until. Only deals with NO
 *     succeeded payment qualify; their still-confirmable PaymentIntents are
 *     canceled FIRST so a stale checkout tab cannot pay into an expired deal —
 *     if a PI turns out to have succeeded, the deal is skipped (the webhook
 *     advances it instead). Listings were never marked reserved for unpaid
 *     deals, so no listing write is needed; expiring frees the listing from
 *     the duplicate-active-deal guard.
 *
 *  2. AUTO-RELEASE buyer-confirmed deals whose dispute window has ended —
 *     the exact rule the release endpoint accepts (releaseDealFunds re-checks
 *     full payment, payout readiness, and claims atomically, so a concurrent
 *     manual release cannot double-pay).
 */
let sweepRunning = false;
export async function sweepProtectedPaymentDeals(): Promise<{ expired: number; released: number; releaseFailures: number }> {
  const result = { expired: 0, released: 0, releaseFailures: 0 };
  if (sweepRunning) return result;
  sweepRunning = true;
  try {
    // 1) Reservation expiry
    const { rows: expireCandidates } = await pool.query(
      `SELECT d.* FROM deals d
       WHERE d.status = 'RESERVED' AND d.reserved_until IS NOT NULL AND d.reserved_until < NOW()
         AND NOT EXISTS (SELECT 1 FROM deal_payments dp WHERE dp.deal_id = d.id AND dp.status = 'succeeded')
       ORDER BY d.reserved_until ASC LIMIT 50`,
    );
    for (const deal of expireCandidates) {
      try {
        let paidMeanwhile = false;
        if (stripe) {
          const { rows: pendingRows } = await pool.query(
            `SELECT id, stripe_payment_intent_id FROM deal_payments WHERE deal_id = $1 AND status = 'pending' AND stripe_payment_intent_id IS NOT NULL`,
            [deal.id],
          );
          for (const p of pendingRows) {
            try {
              await stripe.paymentIntents.cancel(p.stripe_payment_intent_id);
            } catch {
              const pi = await stripe.paymentIntents.retrieve(p.stripe_payment_intent_id).catch(() => null);
              if (pi?.status === "succeeded") paidMeanwhile = true;
            }
          }
        }
        if (paidMeanwhile) continue; // webhook will move it to DEPOSIT_PAID
        const upd = await pool.query(
          `UPDATE deals SET status = 'EXPIRED', updated_at = NOW() WHERE id = $1 AND status = 'RESERVED' RETURNING id`,
          [deal.id],
        );
        if (upd.rowCount) {
          result.expired += 1;
          debugApiLog(`[PROOF:DEAL:EXPIRED] deal=${deal.id}`);
        }
      } catch (e: any) {
        console.error(`[DEAL:SWEEP] expire failed for deal=${deal.id}:`, e?.message);
      }
    }

    // 2) Auto-release after the protection window
    const { rows: releaseCandidates } = await pool.query(
      `SELECT * FROM deals
       WHERE status = 'DELIVERED_CONFIRMED' AND dispute_window_ends IS NOT NULL AND dispute_window_ends < NOW()
       ORDER BY dispute_window_ends ASC LIMIT 20`,
    );
    for (const deal of releaseCandidates) {
      try {
        const r = await releaseDealFunds(deal);
        if (r.ok) {
          result.released += 1;
          debugApiLog(`[PROOF:PAYOUT:AUTO_RELEASED] deal=${deal.id} transfer=${r.transferId} amount=${r.payoutAmount}`);
        } else {
          result.releaseFailures += 1;
          console.error(`[DEAL:SWEEP] auto-release blocked for deal=${deal.id}: ${r.error}`);
        }
      } catch (e: any) {
        result.releaseFailures += 1;
        console.error(`[DEAL:SWEEP] auto-release failed for deal=${deal.id}:`, e?.message);
      }
    }
  } finally {
    sweepRunning = false;
  }
  return result;
}

/**
 * POST /api/deals/jobs/sweep — run the sweep on demand. Moves real money
 * (auto-release), so it is never publicly triggerable: admin session or
 * CRON_SECRET only (same contract as /api/payouts/release). Fails closed.
 */
router.post("/jobs/sweep", async (req: Request, res: Response) => {
  const cronSecret = process.env.CRON_SECRET?.trim();
  let authorized = false;
  if (cronSecret) {
    const headerSecret = (req.get("x-cron-secret") || "").trim();
    const authHeader = req.get("authorization") || "";
    const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
    if (headerSecret === cronSecret || bearer === cronSecret) authorized = true;
  }
  if (req.user?.is_admin === true) authorized = true;
  if (!authorized) return res.status(403).json({ error: "Forbidden", code: "ADMIN_OR_CRON_REQUIRED" });
  try {
    const summary = await sweepProtectedPaymentDeals();
    return res.json({ ok: true, ...summary });
  } catch (error: any) {
    console.error("[DEAL:SWEEP] Error:", error);
    return res.status(500).json({ error: "Internal error" });
  }
});

const SWEEP_DEFAULT_INTERVAL_MS = 10 * 60 * 1000;
let sweepTimer: NodeJS.Timeout | null = null;

/** In-process scheduler (same pattern as bookingReminderScheduler); the cron
 *  route above remains available for external schedulers. Idempotent. */
export function startDealSweepScheduler(): void {
  if (sweepTimer || process.env.NODE_ENV === "test") return;
  const raw = parseInt(process.env.DEAL_SWEEP_INTERVAL_MS || "", 10);
  const interval = Number.isFinite(raw) && raw >= 60_000 ? raw : SWEEP_DEFAULT_INTERVAL_MS;
  const tick = () => {
    sweepProtectedPaymentDeals().catch((e) => console.error("[DEAL:SWEEP] tick failed:", e?.message));
  };
  sweepTimer = setInterval(tick, interval);
  if (typeof sweepTimer.unref === "function") sweepTimer.unref();
  setTimeout(tick, 30_000).unref?.();
  console.log(`[DEAL:SWEEP] scheduler started (every ${Math.round(interval / 1000)}s)`);
}

export { router as dealsRouter };