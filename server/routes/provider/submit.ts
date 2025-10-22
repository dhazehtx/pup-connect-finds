import { Router } from 'express';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import { requireAuth } from '../../middleware/requireAuth';
import { notifyAdmins } from '../../lib/adminNotify';

const r = Router();
r.use(requireAuth);

r.post('/', async (req: any, res) => {
  const userId = req.user.id;
  const { provider_id } = req.body;

  // Ensure consent recorded
  const { data: consent, error: cErr } = await supabaseAdmin
    .from('consents')
    .select('id, created_at')
    .eq('user_id', userId)
    .eq('doc', 'service_provider_terms')
    .eq('version', 'v1')
    .eq('accepted', true)
    .limit(1)
    .maybeSingle();
  if (cErr) return res.status(500).json({ error: cErr.message });
  if (!consent) return res.status(400).json({ error: 'Terms not accepted for service_provider_terms v1' });

  // Set pending_review
  const { data, error } = await supabaseAdmin
    .from('providers')
    .update({ status: 'pending_review' })
    .eq('id', provider_id)
    .eq('user_id', userId)
    .select()
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Provider application not found' });

  // Notify admins of new submission
  await notifyAdmins('provider_submitted', {
    provider_id: data.id,
    user_id: data.user_id,
    submitted_at: new Date().toISOString(),
  });

  return res.json({ ok: true, provider: data });
});

export default r;
