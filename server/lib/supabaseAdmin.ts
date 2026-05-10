// server/lib/supabaseAdmin.ts
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!url || !serviceKey) {
  console.warn(
    '[SupabaseAdmin] Missing SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Supabase-dependent features may run in degraded mode.',
  );
}

export const supabaseAdmin = createClient(url, serviceKey, {
  auth: { persistSession: false }
})
