import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabaseAdmin'

const r = Router()

r.get('/consent/status', async (req, res) => {
  const jwt = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  if (!jwt) return res.status(401).json({ error: 'Bearer token required' })

  const { data: u, error } = await supabaseAdmin.auth.getUser(jwt)
  if (error || !u?.user) return res.status(401).json({ error: 'invalid token' })

  const { data, error: qErr } = await supabaseAdmin
    .from('user_consents')
    .select('doc, version, consented_at')
    .eq('user_id', u.user.id)
    .order('consented_at', { ascending: false })
    .limit(1)

  if (qErr) return res.status(500).json({ error: qErr.message })
  res.json({ latest: data?.[0] || null })
})

export default r
