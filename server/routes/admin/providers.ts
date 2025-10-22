// server/routes/admin/providers.ts
import { Router } from 'express';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import { requireAdmin } from '../../middleware/requireAdmin';

const r = Router();
r.use(requireAdmin);

r.post('/:id/approve', async (req: any, res) => {
  const providerId = req.params.id;
  const reviewerId = req.user.id;
  const { badge = 'verified', review_notes } = req.body;

  const { data: prov, error: gErr } = await supabaseAdmin
    .from('providers')
    .select('user_id')
    .eq('id', providerId)
    .maybeSingle();
  if (gErr) return res.status(500).json({ error: gErr.message });
  if (!prov) return res.status(404).json({ error: 'Provider not found' });

  const { data, error } = await supabaseAdmin
    .from('providers')
    .update({
      status: 'approved',
      verified: true,
      verified_at: new Date().toISOString(),
      reviewer_id: reviewerId,
      review_notes,
      badge,
    })
    .eq('id', providerId)
    .select()
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });

  await supabaseAdmin.from('notifications').insert({
    user_id: prov.user_id,
    type: 'provider_approved',
    payload: { provider_id: providerId },
  });

  res.json({ ok: true, provider: data });
});

r.post('/:id/reject', async (req: any, res) => {
  const providerId = req.params.id;
  const reviewerId = req.user.id;
  const { review_notes } = req.body;

  const { data: prov, error: gErr } = await supabaseAdmin
    .from('providers')
    .select('user_id')
    .eq('id', providerId)
    .maybeSingle();
  if (gErr) return res.status(500).json({ error: gErr.message });
  if (!prov) return res.status(404).json({ error: 'Provider not found' });

  const { data, error } = await supabaseAdmin
    .from('providers')
    .update({
      status: 'rejected',
      verified: false,
      reviewer_id: reviewerId,
      review_notes,
    })
    .eq('id', providerId)
    .select()
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });

  await supabaseAdmin.from('notifications').insert({
    user_id: prov.user_id,
    type: 'provider_rejected',
    payload: { provider_id: providerId, review_notes },
  });

  res.json({ ok: true, provider: data });
});

export default r;
