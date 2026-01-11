import { supabase } from '@/integrations/supabase/client';

// Track login event to update last_login_at
const trackLogin = async (userId: string, accessToken: string) => {
  try {
    const response = await fetch('/api/auth/track-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ userId }),
    });
    
    if (!response.ok) {
      console.warn('[AUTH] Failed to track login:', response.status);
    } else {
      console.log('[AUTH] Login tracked successfully');
    }
  } catch (error) {
    console.warn('[AUTH] Error tracking login:', error);
  }
};

export const setupAuthStateListener = () => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    console.log(`Auth event: ${event}`, session ? 'Session active' : 'No session');
    
    switch (event) {
      case 'SIGNED_IN':
        console.log('User signed in successfully');
        // Track login for admin dashboard metrics
        if (session?.user?.id && session.access_token) {
          trackLogin(session.user.id, session.access_token);
        }
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