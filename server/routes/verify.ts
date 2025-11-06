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
 * Accepts: { front_url, back_url }
 * Creates/updates provider_applications with ID document URLs
 */
router.post('/start', async (req: Request, res: Response) => {
  try {
    const userId: string | null = (req as any).user?.id || await getUserIdFromToken(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { front_url, back_url } = (req.body ?? {}) as { front_url?: string; back_url?: string };
    if (!front_url || !back_url) {
      return res.status(400).json({ error: 'front_url and back_url are required' });
    }

    const { data, error } = await supabaseAdmin
      .from('provider_applications')
      .upsert(
        {
          user_id: userId,
          front_image_url: front_url,
          back_image_url: back_url,
          status: 'submitted',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select('*')
      .single();

    if (error) {
      console.error('[verify/start] upsert error', error);
      return res.status(500).json({ error: 'DB upsert failed' });
    }

    return res.json({ ok: true, application: data });
  } catch (e) {
    console.error('[verify/start] exception', e);
    return res.status(500).json({ error: 'Internal error' });
  }
});

export default router;
