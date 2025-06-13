
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, Mail, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [activeTab, setActiveTab] = useState('signin');
  const [resetMode, setResetMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const { user, continueAsGuest, signIn, signUp, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'reset') {
      setResetMode(true);
    }

    if (user) {
      const from = location.state?.from?.pathname || '/explore';
      navigate(from, { replace: true });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      if (activeTab === 'signup') {
        await signUp(email, password, { full_name: fullName });
      } else {
        await signIn(email, password);
      }
      
      const from = location.state?.from?.pathname || '/explore';
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Auth error:', error);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center">Password Reset</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                Your password has been reset successfully. You can now sign in with your new password.
              </AlertDescription>
            </Alert>
            <div className="mt-4 text-center">
              <button 
                onClick={() => {
                  setResetMode(false);
                  setActiveTab('signin');
                }}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Continue to Sign In
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-royal-blue/10 to-mint-green/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-6 bg-royal-blue rounded-full flex items-center justify-center">
            <Heart size={32} className="text-cloud-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-deep-navy mb-2">
            {activeTab === 'signup' ? 'Sign up for MY PUP' : 'Sign in'}
          </h1>
          
          {activeTab === 'signin' && (
            <div className="flex justify-center">
              <button
                onClick={() => setActiveTab('signup')}
                className="text-royal-blue hover:text-royal-blue/80 underline text-sm"
              >
                I don't have an account
              </button>
            </div>
          )}
        </div>

        {/* Main Auth Card */}
        <Card className="bg-cloud-white border-soft-sky shadow-lg">
          <CardContent className="p-8">
            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === 'signup' && (
                <div>
                  <Input
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`h-12 rounded-md border-2 border-gray-300 bg-gray-100 px-4 text-deep-navy placeholder:text-gray-500 focus:border-royal-blue focus:bg-white ${errors.fullName ? 'border-red-500' : ''}`}
                    disabled={loading}
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
                  className={`h-12 rounded-md border-2 border-gray-300 bg-gray-100 px-4 text-deep-navy placeholder:text-gray-500 focus:border-royal-blue focus:bg-white ${errors.email ? 'border-red-500' : ''}`}
                  disabled={loading}
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
                  className={`h-12 rounded-md border-2 border-gray-300 bg-gray-100 px-4 pr-12 text-deep-navy placeholder:text-gray-500 focus:border-royal-blue focus:bg-white ${errors.password ? 'border-red-500' : ''}`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-deep-navy"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-mint-green hover:bg-mint-green/90 text-deep-navy font-semibold rounded-md"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-deep-navy border-t-transparent mr-2" />
                    {activeTab === 'signup' ? 'Creating Account...' : 'Signing In...'}
                  </>
                ) : (
                  'Continue'
                )}
              </Button>
            </form>

            {/* "Can't sign in?" link for sign in page */}
            {activeTab === 'signin' && (
              <div className="text-center mt-4">
                <button className="text-deep-navy/60 hover:text-deep-navy underline text-sm">
                  Can't sign in?
                </button>
              </div>
            )}

            {/* Social Login Buttons */}
            <div className="space-y-3 mt-6">
              <Button
                onClick={() => {
                  toast({
                    title: "Coming Soon!",
                    description: "Google sign-in will be available soon.",
                  });
                }}
                variant="outline"
                className="w-full h-12 bg-white hover:bg-gray-50 text-deep-navy font-medium rounded-md border-2 border-gray-300"
                disabled={loading}
              >
                <Mail size={18} className="mr-3" />
                Sign in with Google
              </Button>
              
              <Button
                onClick={() => {
                  toast({
                    title: "Coming Soon!",
                    description: "Facebook sign-in will be available soon.",
                  });
                }}
                className="w-full h-12 bg-royal-blue hover:bg-royal-blue/90 text-cloud-white font-medium rounded-md"
                disabled={loading}
              >
                <User size={18} className="mr-3" />
                Sign in with Facebook
              </Button>
            </div>

            {/* Toggle between sign in and sign up */}
            {activeTab === 'signup' && (
              <div className="text-center mt-6">
                <button
                  onClick={() => setActiveTab('signin')}
                  className="text-deep-navy/60 hover:text-deep-navy underline text-sm"
                >
                  Already have an account? Sign in here.
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Guest Access - Prominently displayed */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-deep-navy/20" />
            </div>
            <div className="relative flex justify-center text-sm uppercase">
              <span className="bg-gradient-to-br from-royal-blue/10 to-mint-green/10 px-4 text-deep-navy/70 font-medium">
                Just browsing?
              </span>
            </div>
          </div>
          
          <Button 
            onClick={handleGuestAccess}
            variant="outline"
            className="w-full mt-4 h-12 bg-cloud-white hover:bg-royal-blue/10 text-royal-blue border-2 border-royal-blue font-semibold rounded-md"
            disabled={loading}
          >
            Continue as Guest
          </Button>
        </div>
        
        <p className="text-xs text-center text-deep-navy/60 mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Auth;
