import { Request, Response } from 'express';
import { z } from 'zod';
import { getProviderByUserId, updateProviderDetails, createProvider } from '../../lib/supabase/providers';

// Schema for basic provider creation
const createProviderSchema = z.object({
  userId: z.string().uuid(),
  legalName: z.string().min(2),
  phone: z.string().min(7),
});

// Schema for provider details update
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

    // Check if this is basic provider creation (has userId, legalName, phone)
    if (req.body.userId && req.body.legalName && req.body.phone) {
      const basicData = createProviderSchema.parse(req.body);
      
      // Check if provider already exists
      const existingProvider = await getProviderByUserId(req.user.id);
      if (existingProvider) {
        return res.json({
          success: true,
          providerId: existingProvider.id,
          message: 'Provider already exists'
        });
      }

      // Create new provider
      const newProvider = await createProvider({
        user_id: basicData.userId,
        legal_name: basicData.legalName,
        phone: basicData.phone
      });

      return res.json({
        success: true,
        providerId: newProvider.id,
        message: 'Basic information saved successfully'
      });
    } else {
      // Handle provider details update
      const data = saveProviderSchema.parse(req.body);

      // Get existing provider
      const provider = await getProviderByUserId(req.user.id);
      if (!provider) {
        return res.status(404).json({ error: 'Provider not found' });
      }

      // Update provider with new details
      const updatedProvider = await updateProviderDetails(provider.id, data);

      return res.json({
        success: true,
        provider: updatedProvider,
        message: 'Provider details saved successfully'
      });
    }

  } catch (error) {
    console.error('Save provider details error:', error);
    res.status(500).json({ 
      error: 'Failed to save provider details',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}