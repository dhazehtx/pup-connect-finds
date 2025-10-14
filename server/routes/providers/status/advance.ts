import { Request, Response } from 'express';
import { getProviderWithVerificationStatus, updateProviderStatus } from '../../../lib/supabase/providers';
import { ensureVerifiedBadge } from '../../../lib/badges';

export async function advanceProviderStatus(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get provider with all verification statuses
    const providerData = await getProviderWithVerificationStatus(req.user.id);
    
    if (!providerData) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    const { verification, backgroundCheck } = providerData;

    // Check if provider meets verification requirements
    const idPassed = verification?.id_status === 'passed' && verification?.liveness_passed === true;
    const checkPassed = backgroundCheck?.check_status === 'passed';

    if (!idPassed) {
      return res.status(400).json({ 
        error: 'ID verification not completed',
        requirements: {
          idVerification: idPassed,
          backgroundCheck: checkPassed
        }
      });
    }

    if (!checkPassed) {
      return res.status(400).json({ 
        error: 'Background check not completed',
        requirements: {
          idVerification: idPassed,
          backgroundCheck: checkPassed
        }
      });
    }

    // Advance provider status to verified
    const updatedProvider = await updateProviderStatus(providerData.id, 'verified');
    
    // Check if provider is now fully verified and add badge
    await ensureVerifiedBadge(req.user.id);

    res.json({
      success: true,
      provider: updatedProvider,
      status: 'verified',
      message: 'Provider status advanced to verified successfully'
    });

  } catch (error) {
    console.error('Advance provider status error:', error);
    res.status(500).json({ 
      error: 'Failed to advance provider status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}