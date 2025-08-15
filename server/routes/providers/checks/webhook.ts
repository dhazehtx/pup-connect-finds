import { Request, Response } from 'express';
import { z } from 'zod';
import { updateProviderCheck } from '../../../lib/supabase/providers';

const backgroundCheckWebhookSchema = z.object({
  providerId: z.string().uuid(),
  status: z.enum(['passed', 'failed', 'pending']),
  checkData: z.object({
    criminal: z.boolean().optional(),
    identity: z.boolean().optional(),
    eligibility: z.boolean().optional(),
    overall_score: z.number().min(0).max(100).optional()
  }).optional()
});

export async function handleBackgroundCheckWebhook(req: Request, res: Response) {
  try {
    const { providerId, status, checkData } = backgroundCheckWebhookSchema.parse(req.body);

    // Update provider_check record in database
    await updateProviderCheck(providerId, {
      check_status: status,
      check_data: checkData || null,
      completed_at: status !== 'pending' ? new Date() : null
    });

    console.log('Background check webhook processed:', {
      providerId,
      status,
      checkData
    });

    res.json({ 
      success: true, 
      message: `Background check ${status} for provider ${providerId}` 
    });

  } catch (error) {
    console.error('Background check webhook error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Webhook processing failed' 
    });
  }
}