import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabaseAdmin'

const router = Router()

router.post('/consent', async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ error: 'Supabase is not configured' })
    }

    // 1) Require bearer token and get user_id
    const auth = req.headers.authorization || ''
    const jwt = auth.replace(/^Bearer\s+/i, '')
    if (!jwt) return res.status(401).json({ error: 'Bearer token required' })

    const { data: userRes, error: userErr } = await supabaseAdmin.auth.getUser(jwt)
    if (userErr || !userRes?.user) {
      return res.status(401).json({ error: 'invalid token' })
    }
    const user_id = userRes.user.id

    // 2) Validate body against your table's columns
    const { doc, version } = req.body || {}
    if (!doc || !version) {
      // we map version -> terms_version, so require them here
      return res.status(400).json({ error: 'doc and version are required' })
    }

    // 3) Build the row using actual column names
    const row = {
      user_id,
      terms_version: String(version),          // REQUIRED (NOT NULL)
      doc: String(doc),                        // nullable in DB but we require it
      version: String(version),                // optional mirror (your table has it)
      ip: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || null,
      user_agent: req.get('user-agent') || null,
      // consented_at will default to now()
    }

    // 4) Upsert for idempotency on (user_id, doc, version)
    const { error } = await supabaseAdmin
      .from('user_consents')
      .upsert(row, { onConflict: 'user_id,doc,version' })

    if (error) {
      console.error('CONSENT insert/upsert error', error)
      return res.status(500).json({ error: error.message, details: error.details })
    }

    // If it was an update (conflict), return 204; otherwise 201
    // Supabase doesn't directly tell us conflict vs insert, so 201 is fine.
    return res.status(201).json({ ok: true })
  } catch (e: any) {
    console.error('CONSENT route exception', e)
    return res.status(500).json({ error: e?.message || String(e) })
  }
})

export default router
