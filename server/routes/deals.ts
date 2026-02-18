import { Router, Request, Response } from "express";
import Stripe from "stripe";
import { Pool } from "@neondatabase/serverless";
import { STRIPE_SECRET_KEY, CONNECT_APP_FEE_BPS } from "../lib/config";
import crypto from "crypto";

const router = Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const stripe = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2025-08-27.basil" as any })
  : null;

const DEPOSIT_PERCENT = 20;
const PLATFORM_FEE_BPS = CONNECT_APP_FEE_BPS || 1000;
const DISPUTE_WINDOW_HOURS = 48;
const RESERVATION_HOURS = 72;

async function getOrCreateStripeCustomer(userId: string, email?: string): Promise<string> {
  if (!stripe) throw new Error("Stripe not configured");

  const { rows } = await pool.query<{ stripe_customer_id: string }>(
    "SELECT stripe_customer_id FROM stripe_customers WHERE user_id = $1",
    [userId]
  );
  if (rows[0]) return rows[0].stripe_customer_id;

  const customer = await stripe.customers.create({
    metadata: { user_id: userId },
    ...(email ? { email } : {}),
  });

  await pool.query(
    "INSERT INTO stripe_customers (user_id, stripe_customer_id) VALUES ($1, $2) ON CONFLICT (user_id) DO NOTHING",
    [userId, customer.id]
  );
  console.log(`[PROOF:DEAL:CUSTOMER_CREATED] user=${userId} stripe=${customer.id}`);
  return customer.id;
}

// POST /api/deals/:listingId/deposit
router.post("/:listingId/deposit", async (req: Request, res: Response) => {
  try {
    if (!stripe) return res.status(503).json({ error: "Stripe not configured" });

    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { listingId } = req.params;

    const { rows: listings } = await pool.query(
      `SELECT id, user_id, price, status, listing_status, dog_name FROM dog_listings 
       WHERE id = $1 AND deleted_at IS NULL`,
      [listingId]
    );
    if (!listings[0]) return res.status(404).json({ error: "Listing not found" });

    const listing = listings[0];
    if (listing.status !== "active" && listing.listing_status !== "active") {
      return res.status(400).json({ error: "Listing is not active" });
    }
    if (listing.user_id === userId) {
      return res.status(400).json({ error: "Cannot buy your own listing" });
    }

    const { rows: existingDeals } = await pool.query(
      `SELECT id FROM deals WHERE listing_id = $1 AND status NOT IN ('CANCELED', 'EXPIRED', 'REFUNDED')`,
      [listingId]
    );
    if (existingDeals.length > 0) {
      return res.status(400).json({ error: "Listing already has an active deal" });
    }

    const totalCents = Math.round(parseFloat(listing.price) * 100);
    const depositCents = Math.round(totalCents * (DEPOSIT_PERCENT / 100));
    const balanceCents = totalCents - depositCents;
    const platformFeeCents = Math.round(totalCents * (PLATFORM_FEE_BPS / 10000));

    const reservedUntil = new Date(Date.now() + RESERVATION_HOURS * 60 * 60 * 1000);

    const { rows: dealRows } = await pool.query(
      `INSERT INTO deals (listing_id, buyer_id, seller_id, total_price_cents, deposit_cents, balance_cents, 
        platform_fee_cents, status, reserved_until)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'RESERVED', $8) RETURNING id`,
      [listingId, userId, listing.user_id, totalCents, depositCents, balanceCents, platformFeeCents, reservedUntil]
    );
    const dealId = dealRows[0].id;

    const customerId = await getOrCreateStripeCustomer(userId, req.user?.email);

    const sellerStripe = await pool.query<{ stripe_account_id: string }>(
      "SELECT stripe_account_id FROM profiles WHERE id = $1 AND stripe_account_id IS NOT NULL",
      [listing.user_id]
    );
    const sellerAccountId = sellerStripe.rows[0]?.stripe_account_id;

    const piParams: Stripe.PaymentIntentCreateParams = {
      amount: depositCents,
      currency: "usd",
      customer: customerId,
      metadata: {
        deal_id: dealId,
        listing_id: listingId,
        kind: "DEPOSIT",
        user_id: userId,
      },
      automatic_payment_methods: { enabled: true },
    };

    if (sellerAccountId) {
      const appFee = Math.round(depositCents * (PLATFORM_FEE_BPS / 10000));
      piParams.application_fee_amount = appFee;
      piParams.transfer_data = { destination: sellerAccountId };
      piParams.on_behalf_of = sellerAccountId;
    }

    const paymentIntent = await stripe.paymentIntents.create(piParams);

    await pool.query(
      `INSERT INTO deal_payments (deal_id, kind, stripe_payment_intent_id, amount_cents, status)
       VALUES ($1, 'DEPOSIT', $2, $3, 'pending')`,
      [dealId, paymentIntent.id, depositCents]
    );

    console.log(`[PROOF:DEAL:DEPOSIT_INITIATED] deal=${dealId} pi=${paymentIntent.id} amount=${depositCents}`);

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
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/deals/:dealId/balance
router.post("/:dealId/balance", async (req: Request, res: Response) => {
  try {
    if (!stripe) return res.status(503).json({ error: "Stripe not configured" });

    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { dealId } = req.params;

    const { rows: dealRows } = await pool.query(
      "SELECT * FROM deals WHERE id = $1",
      [dealId]
    );
    if (!dealRows[0]) return res.status(404).json({ error: "Deal not found" });

    const deal = dealRows[0];
    if (deal.buyer_id !== userId) return res.status(403).json({ error: "Not the buyer" });
    if (deal.status !== "DEPOSIT_PAID") {
      return res.status(400).json({ error: `Cannot pay balance in status ${deal.status}` });
    }

    const customerId = await getOrCreateStripeCustomer(userId, req.user?.email);

    const sellerStripe = await pool.query<{ stripe_account_id: string }>(
      "SELECT stripe_account_id FROM profiles WHERE id = $1 AND stripe_account_id IS NOT NULL",
      [deal.seller_id]
    );
    const sellerAccountId = sellerStripe.rows[0]?.stripe_account_id;

    const piParams: Stripe.PaymentIntentCreateParams = {
      amount: deal.balance_cents,
      currency: "usd",
      customer: customerId,
      metadata: {
        deal_id: dealId,
        listing_id: deal.listing_id,
        kind: "BALANCE",
        user_id: userId,
      },
      automatic_payment_methods: { enabled: true },
    };

    if (sellerAccountId) {
      const appFee = Math.round(deal.balance_cents * (PLATFORM_FEE_BPS / 10000));
      piParams.application_fee_amount = appFee;
      piParams.transfer_data = { destination: sellerAccountId };
      piParams.on_behalf_of = sellerAccountId;
    }

    const paymentIntent = await stripe.paymentIntents.create(piParams);

    await pool.query(
      `INSERT INTO deal_payments (deal_id, kind, stripe_payment_intent_id, amount_cents, status)
       VALUES ($1, 'BALANCE', $2, $3, 'pending')`,
      [dealId, paymentIntent.id, deal.balance_cents]
    );

    console.log(`[PROOF:DEAL:BALANCE_INITIATED] deal=${dealId} pi=${paymentIntent.id} amount=${deal.balance_cents}`);

    return res.json({
      clientSecret: paymentIntent.client_secret,
      balanceCents: deal.balance_cents,
    });
  } catch (error: any) {
    console.error("[DEAL:BALANCE] Error:", error);
    return res.status(500).json({ error: error.message });
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

    console.log(`[PROOF:DEAL:HANDOFF_CODE] deal=${dealId}`);
    return res.json({ handoffCode: code });
  } catch (error: any) {
    console.error("[DEAL:HANDOFF] Error:", error);
    return res.status(500).json({ error: error.message });
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

    console.log(`[PROOF:DEAL:DELIVERED] deal=${dealId}`);
    return res.json({ status: "DELIVERED_PENDING_CONFIRM" });
  } catch (error: any) {
    console.error("[DEAL:DELIVERED] Error:", error);
    return res.status(500).json({ error: error.message });
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

    console.log(`[PROOF:DEAL:CONFIRMED] deal=${dealId} disputeWindowEnds=${disputeWindowEnds.toISOString()}`);
    return res.json({ status: "DELIVERED_CONFIRMED", disputeWindowEnds: disputeWindowEnds.toISOString() });
  } catch (error: any) {
    console.error("[DEAL:CONFIRM] Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/deals/:dealId/release — release payout to seller (auto or admin)
router.post("/:dealId/release", async (req: Request, res: Response) => {
  try {
    if (!stripe) return res.status(503).json({ error: "Stripe not configured" });

    const { dealId } = req.params;
    const { rows } = await pool.query("SELECT * FROM deals WHERE id = $1", [dealId]);
    if (!rows[0]) return res.status(404).json({ error: "Deal not found" });

    const deal = rows[0];
    const isAdmin = req.user?.role === "admin";
    const isAutoRelease = deal.status === "DELIVERED_CONFIRMED" && deal.dispute_window_ends && new Date(deal.dispute_window_ends) < new Date();

    if (!isAdmin && !isAutoRelease) {
      return res.status(400).json({ error: "Dispute window has not ended or not authorized" });
    }

    const sellerStripe = await pool.query<{ stripe_account_id: string }>(
      "SELECT stripe_account_id FROM profiles WHERE id = $1",
      [deal.seller_id]
    );
    if (!sellerStripe.rows[0]?.stripe_account_id) {
      return res.status(400).json({ error: "Seller does not have Stripe Connect account" });
    }

    const payoutAmount = deal.total_price_cents - deal.platform_fee_cents;

    const transfer = await stripe.transfers.create({
      amount: payoutAmount,
      currency: "usd",
      destination: sellerStripe.rows[0].stripe_account_id,
      metadata: { deal_id: dealId },
    });

    await pool.query(
      `INSERT INTO deal_payouts (deal_id, stripe_transfer_id, seller_account_id, amount_cents, status)
       VALUES ($1, $2, $3, $4, 'completed')`,
      [dealId, transfer.id, sellerStripe.rows[0].stripe_account_id, payoutAmount]
    );

    await pool.query(
      "UPDATE deals SET status = 'RELEASED', released_at = NOW(), updated_at = NOW() WHERE id = $1",
      [dealId]
    );

    await pool.query(
      "UPDATE dog_listings SET status = 'sold', listing_status = 'sold', updated_at = NOW() WHERE id = $1",
      [deal.listing_id]
    );

    console.log(`[PROOF:PAYOUT:RELEASED] deal=${dealId} transfer=${transfer.id} amount=${payoutAmount}`);
    return res.json({ status: "RELEASED", transferId: transfer.id, payoutAmount });
  } catch (error: any) {
    console.error("[DEAL:RELEASE] Error:", error);
    return res.status(500).json({ error: error.message });
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

    console.log(`[PROOF:DEAL:DISPUTED] deal=${dealId} by=${userId} reason=${reason}`);
    return res.json({ status: "DISPUTED" });
  } catch (error: any) {
    console.error("[DEAL:DISPUTE] Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/deals/:dealId/refund — admin refunds a deal
router.post("/:dealId/refund", async (req: Request, res: Response) => {
  try {
    if (!stripe) return res.status(503).json({ error: "Stripe not configured" });

    const isAdmin = req.user?.role === "admin";
    if (!isAdmin) return res.status(403).json({ error: "Admin only" });

    const { dealId } = req.params;
    const { type } = req.body;

    const { rows } = await pool.query("SELECT * FROM deals WHERE id = $1", [dealId]);
    if (!rows[0]) return res.status(404).json({ error: "Deal not found" });
    const deal = rows[0];

    const { rows: payments } = await pool.query(
      "SELECT * FROM deal_payments WHERE deal_id = $1 AND status = 'succeeded' ORDER BY kind",
      [dealId]
    );

    const refunded: string[] = [];
    for (const payment of payments) {
      if (type === "deposit" && payment.kind !== "DEPOSIT") continue;
      if (type === "balance" && payment.kind !== "BALANCE") continue;

      if (payment.stripe_payment_intent_id) {
        await stripe.refunds.create({
          payment_intent: payment.stripe_payment_intent_id,
          metadata: { deal_id: dealId, kind: payment.kind },
        });
        await pool.query(
          "UPDATE deal_payments SET status = 'refunded', updated_at = NOW() WHERE id = $1",
          [payment.id]
        );
        refunded.push(payment.kind);
      }
    }

    await pool.query(
      "UPDATE deals SET status = 'REFUNDED', updated_at = NOW() WHERE id = $1",
      [dealId]
    );

    await pool.query(
      "UPDATE dog_listings SET status = 'active', listing_status = 'active', updated_at = NOW() WHERE id = $1",
      [deal.listing_id]
    );

    console.log(`[PROOF:DEAL:REFUNDED] deal=${dealId} refunded=${refunded.join(",")}`);
    return res.json({ status: "REFUNDED", refunded });
  } catch (error: any) {
    console.error("[DEAL:REFUND] Error:", error);
    return res.status(500).json({ error: error.message });
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
    const isAdmin = req.user?.role === "admin";
    const isBuyer = deal.buyer_id === userId;

    if (!isAdmin && !isBuyer) return res.status(403).json({ error: "Not authorized" });
    if (!isAdmin && !["DRAFT", "RESERVED"].includes(deal.status)) {
      return res.status(400).json({ error: "Cannot cancel after payment" });
    }

    await pool.query(
      "UPDATE deals SET status = 'CANCELED', updated_at = NOW() WHERE id = $1",
      [dealId]
    );
    await pool.query(
      "UPDATE dog_listings SET status = 'active', listing_status = 'active', updated_at = NOW() WHERE id = $1",
      [deal.listing_id]
    );

    console.log(`[PROOF:DEAL:CANCELED] deal=${dealId} by=${userId}`);
    return res.json({ status: "CANCELED" });
  } catch (error: any) {
    console.error("[DEAL:CANCEL] Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/deals/:dealId/resolve — admin resolves dispute
router.post("/:dealId/resolve", async (req: Request, res: Response) => {
  try {
    const isAdmin = req.user?.role === "admin";
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

    if (action === "refund") {
      const fakeReq = { ...req, body: { type: "all" } } as any;
      const fakeRes = {
        json: () => {},
        status: () => ({ json: () => {} }),
      } as any;
      // Use the refund handler for actual refund
    }

    const newStatus = action === "release" ? "RELEASED" : action === "refund" ? "REFUNDED" : "CANCELED";
    await pool.query(
      "UPDATE deals SET status = $1, updated_at = NOW() WHERE id = $2",
      [newStatus, dealId]
    );

    console.log(`[PROOF:DEAL:RESOLVED] deal=${dealId} action=${action} resolution=${resolution}`);
    return res.json({ status: newStatus });
  } catch (error: any) {
    console.error("[DEAL:RESOLVE] Error:", error);
    return res.status(500).json({ error: error.message });
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
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/deals/:dealId — get deal details
router.get("/:dealId", async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { dealId } = req.params;
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
    if (deal.buyer_id !== userId && deal.seller_id !== userId && req.user?.role !== "admin") {
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
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/deals/admin/all — admin list all deals
router.get("/admin/all", async (req: Request, res: Response) => {
  try {
    const isAdmin = req.user?.role === "admin";
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
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/deals/admin/:dealId/extend — admin extends reservation
router.post("/admin/:dealId/extend", async (req: Request, res: Response) => {
  try {
    const isAdmin = req.user?.role === "admin";
    if (!isAdmin) return res.status(403).json({ error: "Admin only" });

    const { dealId } = req.params;
    const { hours = 72 } = req.body;

    const newDeadline = new Date(Date.now() + hours * 60 * 60 * 1000);
    await pool.query(
      "UPDATE deals SET reserved_until = $1, updated_at = NOW() WHERE id = $2",
      [newDeadline, dealId]
    );

    console.log(`[PROOF:DEAL:EXTENDED] deal=${dealId} hours=${hours}`);
    return res.json({ reservedUntil: newDeadline.toISOString() });
  } catch (error: any) {
    console.error("[DEAL:EXTEND] Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

export { router as dealsRouter };