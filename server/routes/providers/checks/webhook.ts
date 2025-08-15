import { Request, Response } from 'express';
import { z } from 'zod';
import { setCheckStatus } from '../../../lib/supabase/providers';

const backgroundCheckWebhookSchema = z.object({
  providerId: z.string().uuid(),
  checkId: z.string(),
  status: z.enum(['passed', 'failed']),
  reasons: z.array(z.string()).optional(),
  reportUrl: z.string().url().optional(),
  vendor: z.string().default('mock_vendor'),
  timestamp: z.string().datetime().optional(),
});

export async function handleBackgroundCheckWebhook(req: Request, res: Response) {
  try {
    const webhookData = backgroundCheckWebhookSchema.parse(req.body);
    
    const { providerId, status, reasons, vendor } = webhookData;

    // Update provider_check record
    await setCheckStatus(providerId, status);

    console.log(`Background check ${status} for provider ${providerId}${reasons ? ` - Reasons: ${reasons.join(', ')}` : ''}`);

    res.json({
      received: true,
      providerId,
      status,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Background check webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

// Mock webhook trigger for testing (development only)
export async function triggerMockBackgroundCheckWebhook(providerId: string, shouldPass: boolean = true) {
  const mockWebhookData = {
    providerId,
    checkId: `check_${Date.now()}`,
    status: shouldPass ? 'passed' : 'failed' as const,
    reasons: shouldPass ? [] : ['Criminal record found', 'Identity mismatch'],
    vendor: 'mock_vendor',
    timestamp: new Date().toISOString(),
  };

  // Simulate background check delay (5 seconds for demo)
  setTimeout(async () => {
    try {
      await setCheckStatus(providerId, shouldPass ? 'passed' : 'failed');
      console.log(`Mock background check webhook processed for provider ${providerId}: ${shouldPass ? 'PASSED' : 'FAILED'}`);
    } catch (error) {
      console.error('Mock background check webhook error:', error);
    }
  }, 5000); // 5 second delay to simulate processing time
}