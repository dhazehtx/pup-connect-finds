import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabaseAdmin';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

async function getUserIdFromToken(req: Request): Promise<string | null> {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return null;
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error) return null;
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

router.get('/ping', (_req: Request, res: Response) => res.json({ ok: true }));

/**
 * POST /api/verify/start
 * Simplified manual ID verification - no external services
 * Accepts: { frontImageUrl, backImageUrl, applicationId? }
 * Creates/updates provider_applications with ID document URLs and marks as pending verification
 */
router.post('/start', async (req: Request, res: Response) => {
  try {
    // 1. Authenticate user from Bearer token
    const userId: string | null = (req as any).user?.id || await getUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({ error: 'invalid token' });
    }

    // 2. Extract image URLs from request body (support both naming conventions)
    const { 
      frontImageUrl, 
      backImageUrl, 
      front_url, 
      back_url,
      applicationId 
    } = (req.body ?? {}) as { 
      frontImageUrl?: string; 
      backImageUrl?: string;
      front_url?: string;
      back_url?: string;
      applicationId?: string;
    };

    const frontUrl = frontImageUrl || front_url;
    const backUrl = backImageUrl || back_url;

    if (!frontUrl || !backUrl) {
      return res.status(400).json({ error: 'frontImageUrl and backImageUrl are required' });
    }

    console.log('[verify/start] Manual ID verification request:', { userId, applicationId });

    // 3. Upsert to provider_applications table
    const updateData: any = {
      user_id: userId,
      front_image_url: frontUrl,
      back_image_url: backUrl,
      verification_status: 'pending',
      verification_started_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // If applicationId provided, include it in the upsert
    if (applicationId) {
      updateData.id = applicationId;
    }

    const { data, error } = await supabaseAdmin
      .from('provider_applications')
      .upsert(updateData, { onConflict: 'user_id' })
      .select('*')
      .single();

    if (error) {
      console.error('[verify/start] Database upsert error:', error);
      return res.status(500).json({ error: 'internal_error' });
    }

    console.log('[verify/start] Success - ID verification marked as pending for manual review');

    // 4. Return success response
    return res.status(201).json({ 
      ok: true, 
      verification_status: 'pending',
      applicationId: data.id,
      message: 'ID documents submitted for manual review'
    });
  } catch (e: any) {
    console.error('[verify/start] Unexpected error:', e);
    return res.status(500).json({ error: 'internal_error' });
  }
});

export default router;
