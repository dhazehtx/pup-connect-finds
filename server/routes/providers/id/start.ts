import { Request, Response } from 'express';
import { z } from 'zod';
import { createProviderVerification, getProviderByUserId } from '../../../lib/supabase/providers';

const startIdVerificationSchema = z.object({
  providerId: z.string().min(1, 'Provider ID is required'),
  documentType: z.string().optional(),
});

export async function startIdVerification(req: Request, res: Response) {
  try {
    console.log('[ID VERIFICATION] Raw request body:', req.body);
    
    const { providerId, documentType } = startIdVerificationSchema.parse(req.body);

    console.log('[ID VERIFICATION] Schema validation passed');
    console.log('[ID VERIFICATION] Starting verification for provider ID:', providerId);
    
    // Extract user ID from custom provider ID format: provider_{userId}_{timestamp}
    let actualProviderId: string;
    let userId: string;
    
    if (providerId.startsWith('provider_')) {
      // Custom format: provider_8b7adf6a-eb74-43a0-9a26-575e65886ac5_1756697406278
      const parts = providerId.split('_');
      userId = parts[1]; // Extract user UUID
      console.log('[ID VERIFICATION] Extracted user ID from custom provider ID:', userId);
      
      // Find the actual provider record for this user
      const provider = await getProviderByUserId(userId);
      if (!provider) {
        return res.status(404).json({ error: 'Provider not found for user' });
      }
      actualProviderId = provider.id;
      console.log('[ID VERIFICATION] Found provider in database:', actualProviderId);
    } else {
      // Assume it's already a proper provider ID
      actualProviderId = providerId;
      userId = '8b7adf6a-eb74-43a0-9a26-575e65886ac5'; // Fallback
    }

    // Mock vendor ID verification session creation
    const mockVendorResponse = await mockIdVerificationStart(actualProviderId, documentType);
    
    // Create provider_verification record using the actual provider ID
    await createProviderVerification({
      provider_id: actualProviderId,
      vendor: 'mock_vendor',
      id_status: 'pending',
      liveness_passed: false,
    });
    
    console.log('[ID VERIFICATION] Provider verification record created for provider:', actualProviderId);

    res.json({
      sessionClientSecret: mockVendorResponse.sessionClientSecret,
      redirectUrl: mockVendorResponse.redirectUrl,
      status: 'pending',
      message: 'ID verification session started'
    });

  } catch (error) {
    console.error('ID verification start error:', error);
    res.status(500).json({ error: 'Failed to start ID verification' });
  }
}

// Mock vendor function - simulates third-party ID verification service
async function mockIdVerificationStart(providerId: string, documentType?: string) {
  // Simulate vendor response with session details
  return {
    sessionClientSecret: `cs_test_${providerId}_${Date.now()}`,
    redirectUrl: `/provider/onboarding/id/verify?session=${providerId}`,
    vendorSessionId: `vs_${providerId}_${Date.now()}`,
    expectedDuration: 120, // 2 minutes
  };
}