import { supabase } from '@/integrations/supabase/client';

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
        if (session?.user?.id) {
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