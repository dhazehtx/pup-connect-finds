import { supabase } from '@/integrations/supabase/client';

const ensureNeonProfile = async (accessToken: string) => {
  try {
    const res = await fetch('/api/profiles/me', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    const data = await res.json();
    console.log('[PROOF:LOGIN] ensureNeonProfile result', JSON.stringify({ ok: res.ok, status: res.status, id: data?.id, username: data?.username }));
  } catch (err) {
    console.error('[PROOF:LOGIN] ensureNeonProfile failed', err);
  }
};

const trackLoginViaApi = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return;

    await fetch('/api/user/track-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
    });
  } catch {
  }
};

export const setupAuthStateListener = () => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    switch (event) {
      case 'SIGNED_IN':
        if (session?.user?.id && session.access_token) {
          ensureNeonProfile(session.access_token);
          trackLoginViaApi();
        }
        break;
      case 'SIGNED_OUT':
        localStorage.removeItem('guestMode');
        break;
    }
  });

  return subscription;
};