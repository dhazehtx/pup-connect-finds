import { Router } from 'express';
import { startIdVerification } from './id/start';
import { handleIdVerificationWebhook } from './id/webhook';
import { startBackgroundCheck } from './checks/start';
import { connectStripePayout, checkStripeAccountStatus } from './payouts/connect';
import { saveProviderDetails } from './save';
// Background check webhook will be imported when file is created
import { getProviderWithVerificationStatus } from '../../lib/supabase/providers';

const router = Router();

// ID Verification routes
router.post('/id/start', startIdVerification);
router.post('/id/webhook', handleIdVerificationWebhook);

// Background Check routes  
router.post('/checks/start', startBackgroundCheck);
// Background check webhook route will be added when function is available

// Payout routes
router.post('/payouts/connect', connectStripePayout);
router.get('/payouts/status/:providerId', checkStripeAccountStatus);

// Provider details
router.post('/save', saveProviderDetails);

// Verification status check
router.get('/verification-status/:providerId', async (req, res) => {
  try {
    const { providerId } = req.params;
    
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const providerData = await getProviderWithVerificationStatus(req.user.id);
    
    if (!providerData || providerData.id !== providerId) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    res.json({
      provider: providerData,
      verification: providerData.verification,
      backgroundCheck: providerData.backgroundCheck,
      payout: providerData.payout,
    });

  } catch (error) {
    console.error('Verification status error:', error);
    res.status(500).json({ error: 'Failed to get verification status' });
  }
});

export default router;