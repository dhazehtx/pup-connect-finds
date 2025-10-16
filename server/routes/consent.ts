// server/routes/consent.ts
import type { Request, Response } from 'express'
import { supabaseAdmin } from '../lib/supabaseAdmin'

export async function consentHandler(req: Request, res: Response) {
  try {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed')

    // 1) Require bearer token
    const auth = req.headers.authorization ?? ''
    const token = auth.replace(/^Bearer\s+/i, '')
    if (!token) return res.status(401).json({ error: 'missing bearer token' })

    // 2) Validate token and get user id
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token)
    if (userErr || !userData?.user) return res.status(401).json({ error: 'invalid token' })
    const user_id = userData.user.id

    // 3) Basic payload
    const { doc, version, accepted } = req.body ?? {}
    if (!doc || !version || typeof accepted !== 'boolean') {
      return res.status(400).json({ error: 'doc, version, accepted required' })
    }

    // 4) Audit
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      null
    const user_agent = (req.headers['user-agent'] as string) || null

    // 5) Idempotent insert (unique on user_id,doc,version)
    const payload = {
      user_id,
      doc,
      version,
      accepted,
      accepted_at: new Date().toISOString(),
      ip,
      user_agent
    }

    // Try plain insert and treat unique violation as success (204)
    const { error: insErr } = await supabaseAdmin.from('user_consents').insert(payload)
    if (insErr) {
      // 23505 = unique_violation
      if ((insErr as any).code === '23505') return res.status(204).end()
      return res.status(500).json({ error: insErr.message })
    }

    return res.status(201).json({ ok: true })
  } catch (e: any) {
    return res.status(500).json({ error: e?.message ?? 'server error' })
  }
}
