import { supabase } from '@/integrations/supabase/client';
import { AuthError } from '@supabase/supabase-js';

interface SignInWithRetryResult {
  success: boolean;
  error?: string;
}

/**
 * Enhanced sign-in function with session validation and retry logic
 * Fixes first-attempt login failures by ensuring session is properly established
 */
export async function signInWithRetry(email: string, password: string): Promise<SignInWithRetryResult> {
  try {
    // Attempt to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });

    if (signInError) {
      return { success: false, error: signInError.message };
    }

    // Wait for session to be properly established
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      const { data: session } = await supabase.auth.getSession();
      
      if (session.session && session.session.user) {
        console.log('[AUTH] Session established successfully');
        return { success: true };
      }
      
      // Wait 100ms before next attempt
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }

    // If we get here, session wasn't established in time
    console.warn('[AUTH] Session not established within expected timeframe');
    return { success: false, error: 'Session could not be established. Please try again.' };

  } catch (error) {
    console.error('[AUTH] Unexpected error during sign-in:', error);
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}

/**
 * Enhanced session checker that validates both client and server session state
 */
export async function validateSession(): Promise<{ isValid: boolean; user: any | null }> {
  try {
    const { data: session, error } = await supabase.auth.getSession();
    
    if (error || !session.session) {
      return { isValid: false, user: null };
    }

    // Additional validation to ensure session is not expired
    const now = Math.floor(Date.now() / 1000);
    if (session.session.expires_at && session.session.expires_at <= now) {
      console.log('[AUTH] Session expired, attempting refresh');
      const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError || !refreshed.session) {
        return { isValid: false, user: null };
      }
      
      return { isValid: true, user: refreshed.session.user };
    }

    return { isValid: true, user: session.session.user };
  } catch (error) {
    console.error('[AUTH] Error validating session:', error);
    return { isValid: false, user: null };
  }
}