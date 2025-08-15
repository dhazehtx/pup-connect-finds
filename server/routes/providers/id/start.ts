import { Request, Response } from 'express';
import { z } from 'zod';
import { createProviderVerification, getProviderByUserId } from '../../../lib/supabase/providers';

const startIdVerificationSchema = z.object({
  providerId: z.string().uuid(),
  documentType: z.string().optional(),
});

export async function startIdVerification(req: Request, res: Response) {
  try {
    const { providerId, documentType } = startIdVerificationSchema.parse(req.body);

    // Verify provider exists and belongs to authenticated user
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const provider = await getProviderByUserId(req.user.id);
    if (!provider || provider.id !== providerId) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    // Mock vendor ID verification session creation
    const mockVendorResponse = await mockIdVerificationStart(providerId, documentType);
    
    // Create provider_verification record
    await createProviderVerification({
      provider_id: providerId,
      vendor: 'mock_vendor',
      id_status: 'pending',
      liveness_passed: false,
    });

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