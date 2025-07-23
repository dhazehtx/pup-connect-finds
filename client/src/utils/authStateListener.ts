import { supabase } from '@/integrations/supabase/client';

export const setupAuthStateListener = () => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    console.log(`Auth event: ${event}`, session ? 'Session active' : 'No session');
    
    switch (event) {
      case 'SIGNED_IN':
        console.log('User signed in successfully');
        break;
      case 'SIGNED_OUT':
        console.log('User signed out');
        localStorage.removeItem('guestMode');
        break;
      case 'TOKEN_REFRESHED':
        console.log('Token refreshed automatically by Supabase');
        break;
      case 'PASSWORD_RECOVERY':
        console.log('Password recovery initiated');
        break;
      case 'USER_UPDATED':
        console.log('User profile updated');
        break;
    }
  });

  return subscription;
};