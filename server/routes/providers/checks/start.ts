import { Request, Response } from 'express';
import { z } from 'zod';
import { createProviderCheck, getProviderByUserId } from '../../../lib/supabase/providers';
// Import will be added when webhook file is ready

const startBackgroundCheckSchema = z.object({
  providerId: z.string().uuid(),
});

export async function startBackgroundCheck(req: Request, res: Response) {
  try {
    const { providerId } = startBackgroundCheckSchema.parse(req.body);

    // Verify provider exists and belongs to authenticated user
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const provider = await getProviderByUserId(req.user.id);
    if (!provider || provider.id !== providerId) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    // Create provider_check record with pending status
    await createProviderCheck(providerId);

    // Mock background check - webhook will be triggered separately

    res.json({
      status: 'pending',
      message: 'Background check initiated',
      estimatedCompletionTime: '1-3 business days'
    });

  } catch (error) {
    console.error('Background check start error:', error);
    res.status(500).json({ error: 'Failed to start background check' });
  }
}