import { useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'

export function useEnsureConsent() {
  useEffect(() => {
    let off = false
    ;(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) return
      try {
        const r = await fetch('/api/consent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ doc: 'tos', version: 'v1' }),
        })
        if (!off) console.log('consent status', r.status)
      } catch (e) {
        if (!off) console.warn('consent post failed', e)
      }
    })()
    return () => { off = true }
  }, [])
}
