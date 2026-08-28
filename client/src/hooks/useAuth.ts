
import { useState, useEffect, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const { toast } = useToast();

  // De-dup guard: Supabase fires several auth events on a cold authenticated load
  // (INITIAL_SESSION, SIGNED_IN, TOKEN_REFRESHED). Without this, each one — plus the
  // initial getSession() — triggers its own /api/profiles/me, producing ~4 identical
  // requests. We fetch a given identity at most once and coalesce concurrent calls.
  const loadedProfileUserIdRef = useRef<string | null>(null);
  const inFlightProfileRef = useRef<Promise<any> | null>(null);

  const fetchProfile = async (_userId?: string) => {
    try {
      const data = await apiRequest('/api/profiles/me');
      setProfile(data || null);
      return data;
    } catch (error: any) {
      const status = error?.message?.match(/failed (\d+)/)?.[1];
      if (status !== '401' && status !== '403') {
        console.error('Error fetching profile:', error?.message);
      }
      setProfile(null);
      return null;
    }
  };

  // Fetch a user's profile once per identity, coalescing concurrent auth events.
  // Explicit refreshes (refreshProfile/updateProfile) bypass this and force a fetch.
  const loadProfileForUser = (userId: string) => {
    if (loadedProfileUserIdRef.current === userId) return inFlightProfileRef.current ?? undefined;
    if (inFlightProfileRef.current) return inFlightProfileRef.current;
    const promise = fetchProfile(userId)
      .then((data) => {
        if (data) loadedProfileUserIdRef.current = userId; // only mark loaded on success
        return data;
      })
      .finally(() => {
        inFlightProfileRef.current = null;
      });
    inFlightProfileRef.current = promise;
    return promise;
  };

  const resetProfileCache = () => {
    loadedProfileUserIdRef.current = null;
    inFlightProfileRef.current = null;
  };

  const refreshProfile = async () => {
    if (user) {
      return await fetchProfile(user.id);
    }
    return null;
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const normalizedEmail = email.trim().toLowerCase();
      const trimmedPassword = password.trim();

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: trimmedPassword,
        options: {
          emailRedirectTo: redirectUrl,
          data: userData
        }
      });

      if (error) throw error;

      if (data.user && !data.session) {
        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link to complete your registration.",
        });
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      let errorMessage = 'An unexpected error occurred during sign up';
      if (error.message?.includes('already registered')) {
        errorMessage = 'This email is already registered. Please sign in instead.';
      } else if (error.message?.includes('invalid email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.message?.includes('password')) {
        errorMessage = 'Password must be at least 6 characters long.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Sign up failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw new Error(errorMessage);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const trimmedPassword = password.trim();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: trimmedPassword,
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "You have been successfully signed in.",
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      let errorMessage = 'Sign in failed';
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage =
          'Invalid email or password. If this works in Safari, retype your password in Chrome or clear saved passwords for this site.';
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and click the confirmation link before signing in.';
      } else if (error.message?.includes('Too many requests')) {
        errorMessage = 'Too many login attempts. Please wait a moment before trying again.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Sign in failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw new Error(errorMessage);
    }
  };

  const signOut = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      } else {
        console.warn('[signOut] skipped, no session present');
      }

      setUser(null);
      setSession(null);
      setProfile(null);
      resetProfileCache(); // next sign-in must refetch the (possibly different) user's profile
      localStorage.removeItem('guestMode');
      localStorage.removeItem('exploreFilters');
      // Drop all cached account-specific data so no stale identity, orders, or
      // private filters survive the sign-out (guest state must load clean).
      try { queryClient.clear(); } catch { /* non-fatal */ }

      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: "Sign out failed",
        description: "There was an error signing you out. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateProfile = async (updates: any) => {
    if (!user) throw new Error('No user logged in');

    try {
      const data = await apiRequest('/api/profiles/me', {
        method: 'PATCH',
        body: updates,
      } as any);

      setProfile(data);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });

      return data;
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast({
        title: "Update failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;

      toast({
        title: "Reset link sent",
        description: "Check your email for a password reset link.",
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: "Reset failed",
        description: "There was an error sending the reset email. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    let mounted = true;

    // Initialize auth state first - critical for preventing "Session Expired" false positives
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // A real authenticated session must never coexist with a stale guest flag.
        localStorage.removeItem('guestMode');
        loadProfileForUser(session.user.id);
      }

      // Mark as loaded after initial session check
      setLoaded(true);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user && event !== 'SIGNED_OUT') {
          // Signing in (or refreshing a session) clears any stale guest flag so
          // guestMode can't linger alongside a valid authenticated session.
          localStorage.removeItem('guestMode');
          setTimeout(() => {
            if (mounted) {
              loadProfileForUser(session.user.id);
            }
          }, 0);
        } else {
          resetProfileCache();
          setProfile(null);
        }

        if (mounted) {
          setLoaded(true);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    session,
    loading,
    loaded,
    profile,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
    resetPassword
  };
};
