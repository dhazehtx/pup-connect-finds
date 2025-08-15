import { Request, Response } from 'express';
import { z } from 'zod';
import { updateProviderVerificationStatus } from '../../../lib/supabase/providers';

const idWebhookSchema = z.object({
  providerId: z.string().uuid(),
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

export async function handleIdVerificationWebhook(req: Request, res: Response) {
  try {
    const webhookData = idWebhookSchema.parse(req.body);
    
    const {
      providerId,
      status,
      livenessResult,
      documentResult,
      vendor
    } = webhookData;

    // Determine final verification status
    const idPassed = status === 'passed' && documentResult.verified;
    const livenessPassed = livenessResult.passed;
    
    // Update provider_verification record
    await updateProviderVerificationStatus(providerId, {
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