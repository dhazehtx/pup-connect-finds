import { Request, Response } from 'express';
import { z } from 'zod';
import { getProviderByUserId, updateProviderDetails } from '../../lib/supabase/providers';

const saveProviderSchema = z.object({
  description: z.string().optional(),
  pricePerService: z.number().positive().optional(),
  availability: z.string().optional(),
  serviceTypes: z.array(z.string()).optional(),
  radiusKm: z.number().positive().max(50).optional(),
});

export async function saveProviderDetails(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const data = saveProviderSchema.parse(req.body);

    // Get existing provider
    const provider = await getProviderByUserId(req.user.id);
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    // Update provider with new details
    const updatedProvider = await updateProviderDetails(provider.id, data);

    res.json({
      success: true,
      provider: updatedProvider,
      message: 'Provider details saved successfully'
    });

  } catch (error) {
    console.error('Save provider details error:', error);
    res.status(500).json({ 
      error: 'Failed to save provider details',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}