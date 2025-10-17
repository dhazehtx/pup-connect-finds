// server/routes/admin/queue.ts
import { Router } from 'express';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import { requireAdmin } from '../../middleware/requireAdmin';

const r = Router();
r.use(requireAdmin);

r.get('/providers', async (_req, res) => {
  const { data, error } = await supabaseAdmin
    .from('admin_provider_queue')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ items: data || [] });
});

export default r;
