import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabaseAdmin';
import { requireAuth } from '../middleware/requireAuth';
import { pool } from '../db';

const router = Router();

async function getUserIdFromToken(req: Request): Promise<string | null> {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return null;
    const admin = supabaseAdmin;
    if (!admin) return null;
    const { data, error } = await admin.auth.getUser(token);
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

    // 3. Upsert to provider_applications table using direct pool query
    const now = new Date();
    
    // Use pool.query() to execute raw SQL, bypassing all schema/cache issues
    let result;
    if (applicationId) {
      result = await pool.query(
        `INSERT INTO provider_applications (
          id, user_id, front_image_url, back_image_url, verification_status, verification_started_at
        ) VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (user_id) 
        DO UPDATE SET
          front_image_url = EXCLUDED.front_image_url,
          back_image_url = EXCLUDED.back_image_url,
          verification_status = EXCLUDED.verification_status,
          verification_started_at = EXCLUDED.verification_started_at
        RETURNING *`,
        [applicationId, userId, frontUrl, backUrl, 'pending', now]
      );
    } else {
      result = await pool.query(
        `INSERT INTO provider_applications (
          user_id, front_image_url, back_image_url, verification_status, verification_started_at
        ) VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id) 
        DO UPDATE SET
          front_image_url = EXCLUDED.front_image_url,
          back_image_url = EXCLUDED.back_image_url,
          verification_status = EXCLUDED.verification_status,
          verification_started_at = EXCLUDED.verification_started_at
        RETURNING *`,
        [userId, frontUrl, backUrl, 'pending', now]
      );
    }

    const row = result.rows[0];
    if (!row) {
      console.error('[verify/start] Database upsert failed - no result returned');
      return res.status(500).json({ error: 'internal_error' });
    }

    console.log('[verify/start] Success - ID verification marked as pending for manual review');

    // 4. Return success response
    return res.status(201).json({ 
      ok: true, 
      verification_status: 'pending',
      applicationId: row.id,
      message: 'ID documents submitted for manual review'
    });
  } catch (e: any) {
    console.error('[verify/start] Unexpected error:', e);
    return res.status(500).json({ error: 'internal_error' });
  }
});

export default router;
