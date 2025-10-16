// server/routes/consent.ts
import express from 'express'
import { createClient } from '@supabase/supabase-js'

const router = express.Router()

// Build a service-role Supabase client (SERVER ONLY)
const supabaseUrl = process.env.SUPABASE_URL as string
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('[consent] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY envs')
  // we still export the router so the app starts, but requests will 500
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

// POST /api/consent
// Body: { userId: string, doc: 'tos'|'privacy', version: string, accepted: boolean }
router.post('/consent', async (req, res) => {
  try {
    const { userId, doc, version, accepted } = req.body ?? {}

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId required' })
    }
    if (doc !== 'tos' && doc !== 'privacy') {
      return res.status(400).json({ error: "doc must be 'tos' or 'privacy'" })
    }
    if (!version || typeof version !== 'string') {
      return res.status(400).json({ error: 'version required' })
    }
    if (accepted !== true) {
      return res.status(400).json({ error: 'accepted must be true' })
    }

    const { error } = await supabase
      .from('user_consents')
      .insert({
        user_id: userId,
        doc,
        version,
        accepted_at: new Date().toISOString(),
      })

    if (error) {
      console.error('[consent] insert error', error)
      return res.status(500).json({ error: 'insert failed' })
    }

    // No body needed — client just needs to know it worked
    return res.status(204).end()
  } catch (e) {
    console.error('[consent] unexpected error', e)
    return res.status(500).json({ error: 'unexpected error' })
  }
})

export default router
