// server/routes/admin/inbox.ts
import { Router } from 'express';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import { requireAdmin } from '../../middleware/requireAdmin';

const r = Router();
r.use(requireAdmin);

r.get('/notifications', async (req: any, res) => {
  const userId = req.user.id;
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ items: data || [] });
});

export default r;
