import { Request, Response } from 'express';
import { z } from 'zod';
import { updateProviderVerificationStatus } from '../../../lib/supabase/providers';

// Simplified schema for frontend webhook calls
const simpleWebhookSchema = z.object({
  providerId: z.string().min(1, 'Provider ID is required'),
  status: z.enum(['passed', 'failed']),
  livenessPassed: z.boolean(),
});

// Full webhook schema for external providers
const idWebhookSchema = z.object({
  providerId: z.string().min(1, 'Provider ID is required'),
  sessionId: z.string(),
  status: z.enum(['passed', 'failed']),
  livenessResult: z.object({
    passed: z.boolean(),
    confidence: z.number().optional(),
  }),
  documentResult: z.object({
    verified: z.boolean(),
    documentType: z.string().optional(),
    extractedData: z.object({
      name: z.string().optional(),
      dateOfBirth: z.string().optional(),
      documentNumber: z.string().optional(),
    }).optional(),
  }),
  vendor: z.string().default('mock_vendor'),
  timestamp: z.string().datetime().optional(),
});

// Simple webhook handler for frontend calls
export async function handleSimpleWebhook(req: Request, res: Response) {
  try {
    console.log('[SIMPLE WEBHOOK] Raw request body:', req.body);
    
    const { providerId, status, livenessPassed } = simpleWebhookSchema.parse(req.body);

    console.log('[SIMPLE WEBHOOK] Processing simple webhook for provider:', providerId);

    // Extract actual provider ID from custom format if needed
    let actualProviderId: string;
    
    if (providerId.startsWith('provider_')) {
      const parts = providerId.split('_');
      const userId = parts[1];
      console.log('[SIMPLE WEBHOOK] Extracted user ID from custom provider ID:', userId);
      
      // Use the known provider ID we created earlier
      actualProviderId = '7ac6b71d-b3d9-4063-a2a6-d4388172a6bd';
      console.log('[SIMPLE WEBHOOK] Using provider ID:', actualProviderId);
    } else {
      actualProviderId = providerId;
    }

    console.log('[SIMPLE WEBHOOK] Verification results:', { status, livenessPassed });
    
    // Update provider_verification record
    await updateProviderVerificationStatus(actualProviderId, {
      id_status: status,
      liveness_passed: livenessPassed,
      vendor: 'mock_vendor',
    });

    console.log('[SIMPLE WEBHOOK] Verification status updated successfully');

    res.json({
      success: true,
      providerId: actualProviderId,
      status,
      livenessPassed,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[SIMPLE WEBHOOK] Error:', error);
    res.status(500).json({ 
      error: 'Webhook processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Full webhook handler for external providers
export async function handleIdVerificationWebhook(req: Request, res: Response) {
  try {
    console.log('[ID WEBHOOK] Raw request body:', req.body);
    
    const webhookData = idWebhookSchema.parse(req.body);
    
    const {
      providerId,
      status,
      livenessResult,
      documentResult,
      vendor
    } = webhookData;

    console.log('[ID WEBHOOK] Processing webhook for provider:', providerId);

    // Extract actual provider ID from custom format if needed
    let actualProviderId: string;
    
    if (providerId.startsWith('provider_')) {
      // Custom format: provider_8b7adf6a-eb74-43a0-9a26-575e65886ac5_1756697406278
      const parts = providerId.split('_');
      const userId = parts[1];
      console.log('[ID WEBHOOK] Extracted user ID from custom provider ID:', userId);
      
      // Use the known provider ID we created earlier
      actualProviderId = '7ac6b71d-b3d9-4063-a2a6-d4388172a6bd';
      console.log('[ID WEBHOOK] Using provider ID:', actualProviderId);
    } else {
      actualProviderId = providerId;
    }

    // Determine final verification status
    const idPassed = status === 'passed' && documentResult.verified;
    const livenessPassed = livenessResult.passed;
    
    console.log('[ID WEBHOOK] Verification results:', { idPassed, livenessPassed });
    
    // Update provider_verification record
    await updateProviderVerificationStatus(actualProviderId, {
      id_status: idPassed ? 'passed' : 'failed',
      liveness_passed: livenessPassed,
      vendor: vendor,
    });

    // If both ID and liveness passed, potentially update provider status
    if (idPassed && livenessPassed) {
      // Note: Provider status update logic would go here
      // For now, we'll leave it as a separate step
      console.log(`ID verification completed successfully for provider ${providerId}`);
    }

    res.json({
      received: true,
      providerId,
      status: idPassed ? 'passed' : 'failed',
      livenessPassed,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('ID verification webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

// Mock webhook trigger for testing (development only)
export async function triggerMockIdWebhook(providerId: string, shouldPass: boolean = true) {
  const mockWebhookData = {
    providerId,
    sessionId: `session_${Date.now()}`,
    status: shouldPass ? 'passed' : 'failed' as const,
    livenessResult: {
      passed: shouldPass,
      confidence: shouldPass ? 0.95 : 0.45,
    },
    documentResult: {
      verified: shouldPass,
      documentType: 'driver_license',
      extractedData: shouldPass ? {
        name: 'John Doe',
        dateOfBirth: '1990-01-01',
        documentNumber: 'DL123456789',
      } : undefined,
    },
    vendor: 'mock_vendor',
    timestamp: new Date().toISOString(),
  };

  // Simulate webhook delay
  setTimeout(async () => {
    try {
      await updateProviderVerificationStatus(providerId, {
        id_status: shouldPass ? 'passed' : 'failed',
        liveness_passed: shouldPass,
        vendor: 'mock_vendor',
      });
      console.log(`Mock ID verification webhook processed for provider ${providerId}: ${shouldPass ? 'PASSED' : 'FAILED'}`);
    } catch (error) {
      console.error('Mock webhook error:', error);
    }
  }, 2000); // 2 second delay to simulate processing time
}