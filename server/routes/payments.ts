import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { authMiddleware } from '../middleware/auth';
import { generalRateLimit } from '../middleware/rateLimiting';
import { asyncHandler } from '../middleware/errorHandler';
import { storage } from '../storage';

const router = Router();

// Initialize Stripe with the correct API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { 
  apiVersion: '2025-08-27.basil' as any 
});

// Platform fee percentage (default 15% if not set)
const PLATFORM_FEE_PERCENT = Number(process.env.PLATFORM_FEE_PERCENT ?? "0.15");

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
router.post('/create-intent', authMiddleware, generalRateLimit, asyncHandler(async (req: any, res: any) => {
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
      
      if (provider.stripe_account_id !== providerStripeAccountId) {
        return res.status(403).json({ 
          success: false, 
          message: "Stripe account mismatch for provider" 
        });
      }
    }

    // Calculate amounts
    const amountCents = toCents(amountNum);
    const feeCents = Math.max(0, Math.floor(amountCents * PLATFORM_FEE_PERCENT));

    // Verify the connected account exists and is active
    try {
      const account = await stripe.accounts.retrieve(providerStripeAccountId);
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
      application_fee_amount: feeCents,
      transfer_data: {
        destination: providerStripeAccountId,
      },
      automatic_payment_methods: { enabled: true },
      metadata: {
        platform_fee_percent: PLATFORM_FEE_PERCENT.toString(),
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
    const paymentIntent = await stripe.paymentIntents.create(
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
router.post('/confirm-intent', authMiddleware, generalRateLimit, asyncHandler(async (req: any, res: any) => {
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

    const paymentIntent = await stripe.paymentIntents.confirm(
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
router.get('/intent/:id', authMiddleware, generalRateLimit, asyncHandler(async (req: any, res: any) => {
  const { id } = req.params;

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(id);

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
      platform_fee_percent: PLATFORM_FEE_PERCENT,
      currency: 'usd',
      min_charge_amount: 0.50, // $0.50 minimum
    }
  });
}));

export default router;