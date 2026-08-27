import { Router } from 'express';
import { startIdVerification } from './id/start';
import { handleIdVerificationWebhook } from './id/webhook';
import { uploadIdImages, handleIdUpload } from './id/upload';
import { linkIdMedia } from './id/link-media';
import { startBackgroundCheck } from './checks/start';
import { handleBackgroundCheckWebhook } from './checks/webhook';
import { connectStripePayout, checkStripeAccountStatus } from './payouts/connect';
import { saveProviderDetails } from './save';
import { advanceProviderStatus } from './status/advance';
import { uploadDocuments, handleDocumentUpload } from './upload-documents';
// Background check webhook will be imported when file is created
import { getProviderWithVerificationStatus } from '../../lib/supabase/providers';

const router = Router();

// SECURITY: the mock ID / background-check WEBHOOK callbacks accept a providerId +
// status from the request body with NO signature and NO auth, so anyone could POST
// {status:'passed'} to forge identity/background-check verification. They are mock
// stubs (a real vendor integration must verify an HMAC signature). Block them in
// production — fail closed — until a signed vendor webhook is wired. (Mirrors the
// blockMockIdVerifyInProd guard on the /id/webhook + /id/link-media routes in
// server/routes.ts.) The user-initiated /start endpoints stay available.
const blockMockWebhookInProd = (_req: any, res: any, next: any) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not available' });
  }
  next();
};

// ID Verification routes
router.post('/id/start', startIdVerification);
router.post('/id/webhook', blockMockWebhookInProd, handleIdVerificationWebhook);
router.post('/id/upload', uploadIdImages, handleIdUpload);
router.post('/id/link-media', linkIdMedia);

// Background Check routes
router.post('/checks/start', startBackgroundCheck);
router.post('/checks/webhook', blockMockWebhookInProd, handleBackgroundCheckWebhook);

// Payout routes
router.post('/payouts/connect', connectStripePayout);
router.get('/payouts/status/:providerId', checkStripeAccountStatus);

// Provider details
router.post('/save', saveProviderDetails);
router.post('/upload-documents', uploadDocuments, handleDocumentUpload);

// Status management
router.post('/status/advance', advanceProviderStatus);

// Get provider status (for Step 7 display)
router.get('/status', async (req, res) => {
  try {
    const userId = req.query.userId as string;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Get provider status from database
    const { supabase } = await import('../../lib/supabase.js');
    if (!supabase) {
      return res.json({ status: 'pending' });
    }
    const { data: provider, error } = await supabase
      .from('providers')
      .select('status')
      .eq('user_id', userId)
      .single();

    if (error || !provider) {
      // If provider doesn't exist yet, return pending status
      return res.json({ status: 'pending' });
    }

    res.json({ status: provider.status || 'pending' });

  } catch (error) {
    console.error('Get provider status error:', error);
    res.status(500).json({ error: 'Failed to get provider status' });
  }
});

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