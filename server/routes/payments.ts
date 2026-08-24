import { Router, Request, Response } from 'express';
import type Stripe from 'stripe';
import { authMiddleware, requireAuth } from '../middleware/auth';
import { generalRateLimit } from '../middleware/rateLimiting';
import { asyncHandler } from '../middleware/errorHandler';
import { storage } from '../storage';
import { getStripe } from '../lib/stripeLazy';
import { getPlatformFeePercent } from '../lib/platformFees';

const router = Router();

/**
 * Connect destination PaymentIntent — funds route to provider with optional application_fee_amount.
 * For launch fees default to 0 (see PLATFORM_FEE_PERCENT in `.env`).
 * True platform-held escrow before provider payout requires PI without `transfer_data` plus a capture/transfer phase (see deals flow).
 */

/**
 * Convert dollars to cents
 * @param amount - Amount in dollars (e.g., 100.00)
 * @returns Amount in cents
 */
function toCents(amount: number): number {
  return Math.round(Math.round(amount * 100 * 100) / 100);
}

/**
 * Create a PaymentIntent with platform fee and provider routing
 * POST /api/payments/create-intent
 */
router.post('/create-intent', authMiddleware, requireAuth, generalRateLimit, asyncHandler(async (req: any, res: any) => {
  const {
    amount,                 // e.g. 100.00 (USD)
    currency = "usd",
    providerStripeAccountId,
    customerId,             // optional if you save customers
    paymentMethodId,        // from client (Elements) if you want immediate confirm
    description,            // optional
    idempotencyKey,         // optional
    providerId,             // to verify provider ownership
  } = req.body;

  // Validate required fields
  if (!amount || !providerStripeAccountId) {
    return res.status(400).json({ 
      success: false, 
      message: "Missing required fields: amount and providerStripeAccountId" 
    });
  }

  // Validate amount
  const amountNum = Number(amount);
  if (isNaN(amountNum) || amountNum <= 0) {
    return res.status(400).json({ 
      success: false, 
      message: "Invalid amount. Must be a positive number" 
    });
  }

  try {
    // If providerId is given, verify the provider exists and owns the Stripe account
    if (providerId) {
      const provider = await storage.getServiceProviderById(providerId);
      if (!provider) {
        return res.status(404).json({ 
          success: false, 
          message: "Provider not found" 
        });
      }
      
      if ((provider as any).stripe_account_id !== providerStripeAccountId) {
        return res.status(403).json({ 
          success: false, 
          message: "Stripe account mismatch for provider" 
        });
      }
    }

    // Calculate amounts
    const platformFeePercent = getPlatformFeePercent();
    const amountCents = toCents(amountNum);
    const feeCents = Math.max(0, Math.floor(amountCents * platformFeePercent));

    // Verify the connected account exists and is active
    try {
      const account = await getStripe().accounts.retrieve(providerStripeAccountId);
      if (!account.charges_enabled || !account.payouts_enabled) {
        return res.status(400).json({ 
          success: false, 
          message: "Provider account is not fully activated for payments" 
        });
      }
    } catch (stripeError: any) {
      console.error('[payments/create-intent] Account verification error:', stripeError);
      return res.status(400).json({ 
        success: false, 
        message: "Invalid provider Stripe account" 
      });
    }

    // Create PaymentIntent parameters
    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount: amountCents,
      currency,
      description: description || `Payment to provider`,
      ...(feeCents > 0 ? { application_fee_amount: feeCents } : {}),
      transfer_data: {
        destination: providerStripeAccountId,
      },
      automatic_payment_methods: { enabled: true },
      metadata: {
        platform_fee_percent: platformFeePercent.toString(),
        provider_id: providerId || '',
        user_id: req.user?.id || '',
      }
    };

    // Add customer if provided
    if (customerId) {
      paymentIntentParams.customer = customerId;
    }

    // If payment method is provided, confirm immediately
    if (paymentMethodId) {
      paymentIntentParams.payment_method = paymentMethodId;
      paymentIntentParams.confirm = true;
      paymentIntentParams.return_url = `${process.env.APP_URL || 'http://localhost:5000'}/payments/return`;
    }

    // Create the PaymentIntent
    const paymentIntent = await getStripe().paymentIntents.create(
      paymentIntentParams, 
      idempotencyKey ? { idempotencyKey } : undefined
    );

    console.log(`[payments/create-intent] Created PaymentIntent ${paymentIntent.id} for $${amountNum} (fee: $${(feeCents / 100).toFixed(2)})`);

    res.json({ 
      success: true, 
      paymentIntent: { 
        id: paymentIntent.id, 
        client_secret: paymentIntent.client_secret,
        status: paymentIntent.status,
        amount: amountCents,
        application_fee_amount: feeCents,
      }
    });

  } catch (error: any) {
    console.error('[payments/create-intent] Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error?.message || "Internal server error" 
    });
  }
}));

/**
 * Confirm a PaymentIntent (for cases where confirmation is deferred)
 * POST /api/payments/confirm-intent
 */
router.post('/confirm-intent', authMiddleware, requireAuth, generalRateLimit, asyncHandler(async (req: any, res: any) => {
  const { paymentIntentId, paymentMethodId } = req.body;

  if (!paymentIntentId) {
    return res.status(400).json({ 
      success: false, 
      message: "Missing paymentIntentId" 
    });
  }

  try {
    const confirmParams: Stripe.PaymentIntentConfirmParams = {
      return_url: `${process.env.APP_URL || 'http://localhost:5000'}/payments/return`,
    };

    if (paymentMethodId) {
      confirmParams.payment_method = paymentMethodId;
    }

    const paymentIntent = await getStripe().paymentIntents.confirm(
      paymentIntentId,
      confirmParams
    );

    console.log(`[payments/confirm-intent] Confirmed PaymentIntent ${paymentIntent.id}`);

    res.json({ 
      success: true, 
      paymentIntent: { 
        id: paymentIntent.id, 
        client_secret: paymentIntent.client_secret,
        status: paymentIntent.status,
      }
    });

  } catch (error: any) {
    console.error('[payments/confirm-intent] Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error?.message || "Internal server error" 
    });
  }
}));

/**
 * Get PaymentIntent status
 * GET /api/payments/intent/:id
 */
router.get('/intent/:id', authMiddleware, requireAuth, generalRateLimit, asyncHandler(async (req: any, res: any) => {
  const { id } = req.params;

  try {
    const paymentIntent = await getStripe().paymentIntents.retrieve(id);

    // Ownership: only the user the PI is stamped with (or an admin) may read it.
    const piUserId = paymentIntent.metadata?.user_id || '';
    if (piUserId && piUserId !== req.user?.id && !req.user?.is_admin) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    res.json({
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        application_fee_amount: paymentIntent.application_fee_amount,
        currency: paymentIntent.currency,
        description: paymentIntent.description,
      }
    });

  } catch (error: any) {
    console.error('[payments/intent] Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error?.message || "Payment intent not found" 
    });
  }
}));

/**
 * Get platform fee configuration
 * GET /api/payments/config
 */
router.get('/config', authMiddleware, asyncHandler(async (req: any, res: any) => {
  res.json({ 
    success: true, 
    config: {
      platform_fee_percent: getPlatformFeePercent(),
      currency: 'usd',
      min_charge_amount: 0.50, // $0.50 minimum
    }
  });
}));

export default router;