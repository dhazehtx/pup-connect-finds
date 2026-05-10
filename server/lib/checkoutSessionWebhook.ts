import type Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { storage } from "../storage";
import { whelpingWaitlistEntries, subscriptions } from "@shared/schema";
import { debugApiLog } from "./debugApi";
import { markBookingPaid } from "./stripe-handlers";

/**
 * Single source of truth for Stripe Checkout session completion (store, whelping, legacy).
 * Used by POST /api/webhooks/stripe and POST /api/stripe/webhook so both endpoints behave the same.
 */
export async function processCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const kind = session.metadata?.kind;

  if (kind === "whelping_waitlist") {
    const waitlistId = session.metadata?.waitlist_id;
    if (waitlistId) {
      await db
        .update(whelpingWaitlistEntries)
        .set({
          deposit_status: "paid",
          status: "approved",
          stripe_payment_intent_id:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id || null,
          updated_at: new Date(),
        })
        .where(eq(whelpingWaitlistEntries.id, waitlistId));
      debugApiLog(`[PROOF:WHELPING:WAITLIST_DEPOSIT_PAID] waitlist=${waitlistId} session=${session.id}`);
    }
    return;
  }

  const orderId = session.metadata?.order_id;
  const userId = session.metadata?.user_id || session.client_reference_id;

  debugApiLog(`[PROOF:WEBHOOK:CHECKOUT_COMPLETED] session=${session.id} order=${orderId} user=${userId}`);

  if (orderId) {
    const existingOrder = await storage.getOrder(orderId);
    if (existingOrder && existingOrder.status === "pending") {
      const piId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id || null;

      await storage.updateOrder(orderId, {
        status: "paid",
        stripe_session_id: session.id,
        checkout_session_id: session.id,
        stripe_payment_intent_id: piId,
      });

      const orderItems = await storage.getOrderItems(orderId);
      for (const item of orderItems) {
        if (item.product_id) {
          await storage.decrementProductInventory(item.product_id, item.qty);
        }
      }

      if (session.mode === "subscription") {
        const subRef = session.subscription;
        const stripeSubId = typeof subRef === "string" ? subRef : subRef?.id;
        const uid = existingOrder.user_id;
        if (stripeSubId && uid) {
          const existing = await db
            .select({ id: subscriptions.id })
            .from(subscriptions)
            .where(eq(subscriptions.stripe_subscription_id, stripeSubId))
            .limit(1);
          if (existing.length === 0) {
            await db.insert(subscriptions).values({
              user_id: uid,
              stripe_subscription_id: stripeSubId,
              status: "active",
            });
            debugApiLog(`[PROOF:CHECKOUT:SUBSCRIPTION_ROW] order=${orderId} sub=${stripeSubId}`);
          }
        }
      }

      debugApiLog(`[PROOF:CHECKOUT:ORDER_PAID] order=${orderId} amount=${existingOrder.amount_total}`);
    } else {
      debugApiLog(`[PROOF:CHECKOUT:SKIP] order=${orderId} status=${existingOrder?.status || "not_found"}`);
    }
    return;
  }

  const productId = session.metadata?.product_id;
  const qty = parseInt(session.metadata?.quantity || "1", 10);
  if (userId && productId) {
    const product = await storage.getProduct(productId);
    if (product) {
      const piId =
        typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id || null;
      const order = await storage.createOrder({
        user_id: userId,
        amount_total: ((session.amount_total ?? 0) / 100).toString(),
        status: "paid",
        stripe_session_id: session.id,
        checkout_session_id: session.id,
        stripe_payment_intent_id: piId,
      });
      await storage.createOrderItem({
        order_id: order.id,
        product_id: productId,
        qty,
        unit_price: product.unit_price,
      });
      await storage.decrementProductInventory(productId, qty);
      debugApiLog(`[PROOF:CHECKOUT:LEGACY_ORDER_PAID] order=${order.id}`);
    }
    return;
  }

  await markBookingPaid({ checkoutSessionId: session.id });
}
