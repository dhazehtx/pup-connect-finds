
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { LegalBlurb } from '@/components/legal/LegalBlurb';
import { ChromaticAmbience } from '@/components/greeting/ChromaticAmbience';
import { PawsWordmarkLockup } from '@/components/brand/PawsWordmark';

const Auth = () => {
  const [activeTab, setActiveTab] = useState('signin');
  const [resetMode, setResetMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const { user, continueAsGuest, signIn, signUp, loading } = useAuth();
  // Enhanced auth utilities will be integrated in next update
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    document.title = 'PAWS — Sign in or create an account';
  }, []);

  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'reset') {
      setResetMode(true);
    }

    if (user) {
      // Check for return URL in query params or location state
      const next = searchParams.get('next');
      const from = location.state?.from?.pathname;
      const redirectTo = next || from || '/explore';
      navigate(redirectTo, { replace: true });
    }
  }, [user, navigate, searchParams, location]);

  const isFromProtectedRoute = location.state?.from;
  const showWelcomeMessage = !isFromProtectedRoute;

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (activeTab === 'signup' && !fullName) {
      newErrors.fullName = 'Full name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper to record user consent with Supabase session token
  const recordConsent = async (userId: string, sessionToken: string, doc: 'tos' | 'privacy') => {
    try {
      const version = '2025-10-15';

      const response = await fetch('/api/consent', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({
          userId,
          doc,
          version,
          accepted: true
        }),
      });
      
      if (!response.ok) {
        console.error(`[CONSENT] Failed to record ${doc} consent:`, response.status);
      } else {
        console.log(`[CONSENT] Recorded ${doc} consent for user ${userId}`);
      }
    } catch (error) {
      console.error('[CONSENT] Error recording consent:', error);
      // Don't block user flow if consent recording fails
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;
    
    setIsSubmitting(true);
    console.log('Attempting to', activeTab === 'signup' ? 'sign up' : 'sign in', 'with email:', email);
    
    try {
      if (activeTab === 'signup') {
        const { data } = await signUp(email, password, { full_name: fullName });
        console.log('Sign up successful');
        
        // Record consent using the signup response data and session token
        const newUserId = data?.user?.id;
        const sessionToken = data?.session?.access_token;
        
        if (newUserId && sessionToken) {
          console.log('[CONSENT] Recording consent for new user:', newUserId);
          await Promise.all([
            recordConsent(newUserId, sessionToken, 'tos'),
            recordConsent(newUserId, sessionToken, 'privacy'),
          ]);
        } else {
          console.warn('[CONSENT] Unable to record consent - missing user ID or session token');
        }
      } else {
        await signIn(email, password);
        console.log('Sign in successful');
        // Handle return URL after sign in
        const next = searchParams.get('next');
        const from = location.state?.from?.pathname;
        const redirectTo = next || from || '/explore';
        navigate(redirectTo, { replace: true });
      }
    } catch (error) {
      console.error('Auth error:', error);
      // Error handling is done in the useAuth hook via toasts
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestAccess = () => {
    continueAsGuest();
    navigate('/explore');
  };

  if (user) {
    return null;
  }

  if (resetMode) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-slate-50 to-blue-50/20">
        <ChromaticAmbience />
        <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md border border-blue-100/50 shadow-lg shadow-[0_0_50px_-12px_rgba(37,99,235,0.1)]">
          <CardHeader>
            <CardTitle className="text-center text-black">Password Reset</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription className="text-black">
                Your password has been reset successfully. You can now sign in with your new password.
              </AlertDescription>
            </Alert>
            <div className="mt-4 text-center">
              <button 
                onClick={() => {
                  setResetMode(false);
                  setActiveTab('signin');
                }}
                className="underline transition-colors duration-200"
                style={{ color: '#2363FF' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#1E52D0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#2363FF';
                }}
              >
                Continue to Sign In
              </button>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-slate-50 to-blue-50/20">
      <ChromaticAmbience />
      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center px-4 pt-6 pb-[calc(6.25rem+env(safe-area-inset-bottom,0px))] sm:pt-8 sm:pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))]">
        {/* Logo + subtitle — centered, no boxed icon; room above bottom nav */}
        <div className="mb-6 w-full text-center sm:mb-7">
          <h1
            className="group font-brand-wordmark mb-2 flex w-full items-baseline justify-center gap-1 text-[clamp(1.35rem,4vw,2rem)] font-medium leading-none tracking-widest text-slate-700"
            aria-label="PAWS"
          >
            <PawsWordmarkLockup />
          </h1>

          <p className="mx-auto max-w-sm text-[15px] font-extralight leading-snug tracking-wide text-slate-500 sm:text-base">
            Pet Adoption &amp; Web Services
          </p>
          <p className="mt-3 text-[15px] font-normal text-slate-600">
            {activeTab === 'signup' ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

        {/* Main Auth Card */}
        <Card className="w-full border border-blue-100/50 bg-white/95 shadow-2xl shadow-[0_0_50px_-12px_rgba(37,99,235,0.12)] backdrop-blur-sm">
          <CardContent className="p-8">
            {/* Tab Toggle */}
            <div className="flex mb-6 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setActiveTab('signin')}
                className={`flex-1 py-3 px-4 text-center font-medium transition-all duration-200 ${
                  activeTab === 'signin' ? 'auth-tab-active' : 'auth-tab-inactive'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('signup')}
                className={`flex-1 py-3 px-4 text-center font-medium transition-all duration-200 ${
                  activeTab === 'signup' ? 'auth-tab-active' : 'auth-tab-inactive'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === 'signup' && (
                <div>
                  <Input
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`h-12 rounded-lg border-2 bg-white px-4 text-black placeholder:text-gray-500 focus:ring-2 focus:ring-opacity-20 ${errors.fullName ? 'border-red-500' : ''}`}
                    style={{
                      borderColor: errors.fullName ? '#EF4444' : '#CBD5E1'
                    }}
                    disabled={loading || isSubmitting}
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                  )}
                </div>
              )}

              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`h-12 rounded-lg border-2 bg-white px-4 text-black placeholder:text-gray-500 focus:ring-2 focus:ring-opacity-20 ${errors.email ? 'border-red-500' : ''}`}
                  style={{
                    borderColor: errors.email ? '#EF4444' : '#CBD5E1'
                  }}
                  disabled={loading || isSubmitting}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`h-12 rounded-lg border-2 bg-white px-4 pr-12 text-black placeholder:text-gray-500 focus:ring-2 focus:ring-opacity-20 ${errors.password ? 'border-red-500' : ''}`}
                  style={{
                    borderColor: errors.password ? '#EF4444' : '#CBD5E1'
                  }}
                  disabled={loading || isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200"
                  style={{ color: '#2363FF' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#1E52D0';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#2363FF';
                  }}
                  disabled={loading || isSubmitting}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading || isSubmitting}
                className="w-full h-12 shadow-lg"
                style={{
                  backgroundColor: '#2563eb !important',
                  color: '#ffffff !important',
                  borderColor: '#2563eb !important',
                  border: '1px solid #2563eb',
                  outline: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1d4ed8';
                  e.currentTarget.style.borderColor = '#1d4ed8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                  e.currentTarget.style.borderColor = '#2563eb';
                }}
              >
                {loading || isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    {activeTab === 'signup' ? 'Creating Account...' : 'Signing In...'}
                  </>
                ) : (
                  activeTab === 'signup' ? 'Create Account' : 'Sign In'
                )}
              </Button>

              {/* Signup Disclaimer */}
              {activeTab === 'signup' && (
                <div style={{ textAlign: 'center' }}>
                  <LegalBlurb variant="generic" />
                </div>
              )}
            </form>

            {/* "Can't sign in?" link for sign in page */}
            {activeTab === 'signin' && (
              <div className="text-center mt-4">
                <button 
                  type="button"
                  className="underline text-sm transition-colors duration-200"
                  style={{ color: '#2363FF' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#1E52D0';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#2363FF';
                  }}
                >
                  Can't sign in?
                </button>
              </div>
            )}

          </CardContent>
        </Card>

        {/* Guest Access */}
        <div className="mt-6 w-full">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200/90" />
            </div>
            <div className="relative flex justify-center text-sm uppercase tracking-wide">
              <span className="bg-gradient-to-b from-white via-slate-50 to-blue-50/20 px-4 font-semibold text-blue-600">
                Just browsing?
              </span>
            </div>
          </div>
          
          <button 
            type="button"
            onClick={handleGuestAccess}
            className="guest-continue-btn w-full mt-4 h-12 rounded-lg font-semibold text-lg shadow-lg transition-colors duration-200"
            disabled={loading || isSubmitting}
          >
            Continue as Guest
          </button>
        </div>
        
        <p className="mt-6 text-center text-xs text-slate-500">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Auth;
