import { supabase } from '@/integrations/supabase/client';

// Track login event to update last_login_at via Supabase direct update
// This is more reliable than an API call with token that may expire
const trackLoginViaSupabase = async (userId: string) => {
  try {
    // Use type assertion since last_login_at may not be in generated Supabase types yet
    const updateData = { last_login_at: new Date().toISOString() } as Record<string, string>;
    
    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId);
    
    if (error) {
      console.warn('[AUTH] Failed to track login via Supabase:', error.message);
    } else {
      console.log('[AUTH] Login tracked successfully');
    }
  } catch (error) {
    console.warn('[AUTH] Error tracking login:', error);
  }
};

export const setupAuthStateListener = () => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    switch (event) {
      case 'SIGNED_IN':
        if (session?.user?.id) {
          trackLoginViaSupabase(session.user.id);
        }
        break;
      case 'SIGNED_OUT':
        localStorage.removeItem('guestMode');
        break;
    }
  });

  return subscription;
};