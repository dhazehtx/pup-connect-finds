import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

const supabaseUrl = process.env.SUPABASE_URL!;
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE ||
  process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('[consent] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env var');
  throw new Error('Supabase server env not configured');
}

const sb = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

router.use(async (req, res, next) => {
  try {
    const hdr = req.headers.authorization || '';
    const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'auth token required' });

    const { data, error } = await sb.auth.getUser(token);
    if (error || !data?.user) return res.status(401).json({ error: 'invalid token' });

    (req as any).userId = data.user.id;
    next();
  } catch (e) {
    console.error('[consent] auth error', e);
    return res.status(401).json({ error: 'auth check failed' });
  }
});

router.post('/', async (req, res) => {
  try {
    const authedUserId = (req as any).userId as string | undefined;
    const { userId: bodyUserId, doc, version, accepted } = req.body ?? {};

    const user_id = bodyUserId || authedUserId;
    if (!user_id || !doc || !version) {
      return res.status(400).json({ error: 'userId, doc and version are required' });
    }

    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      null;
    const user_agent = (req.headers['user-agent'] as string) || null;
    const acceptedBool = !!accepted;

    const insertRow = { user_id, doc, version, accepted: acceptedBool, ip, user_agent };

    const { error } = await sb.from('user_consents').insert(insertRow);

    if (!error) {
      return res.status(201).end();
    }

    if ((error as any)?.code === '23505') {
      await sb
        .from('user_consents')
        .upsert(insertRow, { onConflict: 'user_id,doc,version' });
      return res.status(204).end();
    }

    console.error('[consent] insert failed', error);
    return res.status(500).json({ error: 'consent insert failed' });
  } catch (e) {
    console.error('[consent] unexpected', e);
    return res.status(500).json({ error: 'unexpected error' });
  }
});

export default router;
