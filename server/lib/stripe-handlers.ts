import Stripe from 'stripe';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

interface ProviderStatus {
  stripeAccountId: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  requirementsDue: string[];
}

export async function logStripeEvent(event: Stripe.Event): Promise<void> {
  try {
    const query = `
      INSERT INTO stripe_events (event_id, type, payload) 
      VALUES ($1, $2, $3)
      ON CONFLICT (event_id) DO NOTHING
    `;
    
    await pool.query(query, [
      event.id,
      event.type,
      JSON.stringify(event) // Store the full event as jsonb
    ]);

    console.log(`[STRIPE HANDLERS] Logged event: ${event.type} (${event.id})`);
  } catch (error) {
    console.error('[STRIPE HANDLERS] Error logging event:', error);
    // Don't throw - logging failure shouldn't break webhook processing
  }
}

export async function upsertProviderStatus(status: ProviderStatus): Promise<void> {
  try {
    // Check if account is fully connected (both charges and payouts enabled)
    const isFullyConnected = status.chargesEnabled && status.payoutsEnabled;
    const onboardingStatus = status.chargesEnabled ? 'verified' : 'requires_action';

    const query = `
      UPDATE providers 
      SET 
        charges_enabled = $2,
        payouts_enabled = $3,
        requirements_due = $4,
        onboarding_status = $5,
        payout_setup_complete = $6,
        updated_at = NOW()
      WHERE stripe_account_id = $1
    `;

    const result = await pool.query(query, [
      status.stripeAccountId,
      status.chargesEnabled,
      status.payoutsEnabled,
      JSON.stringify(status.requirementsDue),
      onboardingStatus,
      isFullyConnected // Set payout_setup_complete to true when both are enabled
    ]);

    if (result.rowCount === 0) {
      console.warn(`[STRIPE HANDLERS] No provider found with Stripe account: ${status.stripeAccountId}`);
    } else {
      console.log(`[STRIPE HANDLERS] Updated provider status for account: ${status.stripeAccountId}`, {
        chargesEnabled: status.chargesEnabled,
        payoutsEnabled: status.payoutsEnabled,
        payoutSetupComplete: isFullyConnected
      });
    }
  } catch (error) {
    console.error('[STRIPE HANDLERS] Error updating provider status:', error);
    throw error;
  }
}

export async function markBookingPaid({ checkoutSessionId }: { checkoutSessionId: string }): Promise<void> {
  try {
    // First find the booking/order by checkout session ID
    const findQuery = `
      SELECT id, user_id, amount_total FROM orders WHERE checkout_session_id = $1
    `;
    const result = await pool.query(findQuery, [checkoutSessionId]);

    if (result.rows.length === 0) {
      console.warn(`[STRIPE HANDLERS] No booking found for checkout session: ${checkoutSessionId}`);
      return;
    }

    const booking = result.rows[0];

    // Update booking status
    const updateQuery = `
      UPDATE orders 
      SET status = 'paid', updated_at = NOW() 
      WHERE id = $1
    `;
    await pool.query(updateQuery, [booking.id]);

    console.log(`[STRIPE HANDLERS] Marked booking ${booking.id} as paid`);

    // Create pending payout record
    const payoutQuery = `
      INSERT INTO payouts (booking_id, status, net_to_provider, app_fee)
      VALUES ($1, 'pending_release', NULL, NULL)
    `;
    await pool.query(payoutQuery, [booking.id]);

    console.log(`[STRIPE HANDLERS] Created pending payout for booking ${booking.id}`);

  } catch (error) {
    console.error('[STRIPE HANDLERS] Error marking booking as paid:', error);
    throw error;
  }
}

export async function handleTransferResult(event: Stripe.Event): Promise<void> {
  try {
    const transfer = event.data.object as Stripe.Transfer;
    
    const query = `
      INSERT INTO provider_transfers (
        stripe_transfer_id, 
        stripe_account_id,
        amount, 
        currency, 
        status,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (stripe_transfer_id) DO UPDATE SET
        status = $5,
        updated_at = NOW()
    `;

    await pool.query(query, [
      transfer.id,
      transfer.destination,
      transfer.amount,
      transfer.currency,
      event.type.includes('failed') ? 'failed' : 'completed',
      new Date(transfer.created * 1000)
    ]);

    console.log(`[STRIPE HANDLERS] Recorded transfer ${transfer.id}: ${event.type}`);
  } catch (error) {
    console.error('[STRIPE HANDLERS] Error handling transfer result:', error);
    throw error;
  }
}

export async function handleRefund(event: Stripe.Event): Promise<void> {
  try {
    let refundId: string;
    let chargeId: string;
    let amount: number;

    if (event.type === 'charge.refunded') {
      const charge = event.data.object as Stripe.Charge;
      // Get the latest refund from the charge
      const latestRefund = charge.refunds?.data?.[0];
      if (!latestRefund) return;
      
      refundId = latestRefund.id;
      chargeId = charge.id;
      amount = latestRefund.amount;
    } else {
      const refund = event.data.object as Stripe.Refund;
      refundId = refund.id;
      chargeId = refund.charge as string;
      amount = refund.amount;
    }

    const query = `
      INSERT INTO refunds (
        stripe_refund_id,
        stripe_charge_id,
        amount,
        status,
        created_at
      ) VALUES ($1, $2, $3, 'completed', NOW())
      ON CONFLICT (stripe_refund_id) DO NOTHING
    `;

    await pool.query(query, [refundId, chargeId, amount]);
    console.log(`[STRIPE HANDLERS] Recorded refund ${refundId} for charge ${chargeId}`);

  } catch (error) {
    console.error('[STRIPE HANDLERS] Error handling refund:', error);
    throw error;
  }
}