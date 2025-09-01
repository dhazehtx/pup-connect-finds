import express from 'express';
import Stripe from 'stripe';

const router = express.Router();

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil',
});

const ORIGIN = process.env.REPLIT_DEV_DOMAIN 
  ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
  : "http://localhost:5000";

router.post('/start', async (req, res) => {
  try {
    const { userId, providerId, applicationId } = req.body;
    
    if (!userId || !providerId || !applicationId) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields: userId, providerId, applicationId" 
      });
    }

    console.log('[PAYOUT START] Creating Stripe Connect account for:', { userId, providerId, applicationId });

    // 1) Create Stripe Connect account (Express account for faster onboarding)
    const account = await stripe.accounts.create({
      type: 'express',
      metadata: { 
        providerId, 
        userId,
        applicationId 
      },
    });

    console.log('[PAYOUT START] Created Stripe account:', account.id);

    // 2) Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${ORIGIN}/services/onboarding?step=4&refresh=1`,
      return_url: `${ORIGIN}/services/onboarding?step=5&connected=1`,
      type: 'account_onboarding',
    });

    console.log('[PAYOUT START] Created account link:', accountLink.url);

    // TODO: Update provider_applications table with stripe_account_id
    // This would be done through your database layer
    
    return res.json({
      success: true,
      url: accountLink.url,
      accountId: account.id
    });

  } catch (error: any) {
    console.error('[PAYOUT START] Error:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Internal server error"
    });
  }
});

export default router;