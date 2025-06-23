
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
      <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
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
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-white rounded-full flex items-center justify-center shadow-lg">
            <Heart size={40} style={{ color: '#2363FF' }} />
          </div>
          
          <h1 className="text-4xl font-bold text-black mb-2">
            MY PUP
          </h1>
          
          <p className="text-black text-lg">
            {activeTab === 'signup' ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

        {/* Main Auth Card */}
        <Card className="bg-white shadow-2xl">
          <CardContent className="p-8">
            {/* Tab Toggle */}
            <div className="flex mb-6 rounded-lg overflow-hidden">
              <button
                onClick={() => setActiveTab('signin')}
                className={`flex-1 py-3 px-4 text-center font-medium transition-all duration-200 ${
                  activeTab === 'signin'
                    ? 'text-white'
                    : 'text-black hover:opacity-80'
                }`}
                style={{
                  backgroundColor: activeTab === 'signin' ? '#2363FF' : '#E5EEFF'
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => setActiveTab('signup')}
                className={`flex-1 py-3 px-4 text-center font-medium transition-all duration-200 ${
                  activeTab === 'signup'
                    ? 'text-white'
                    : 'text-black hover:opacity-80'
                }`}
                style={{
                  backgroundColor: activeTab === 'signup' ? '#2363FF' : '#E5EEFF'
                }}
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
                      borderColor: errors.fullName ? '#EF4444' : '#CBD5E1',
                      focusBorderColor: '#2363FF',
                      focusRingColor: '#2363FF'
                    }}
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
                  className={`h-12 rounded-lg border-2 bg-white px-4 text-black placeholder:text-gray-500 focus:ring-2 focus:ring-opacity-20 ${errors.email ? 'border-red-500' : ''}`}
                  style={{
                    borderColor: errors.email ? '#EF4444' : '#CBD5E1',
                    focusBorderColor: '#2363FF',
                    focusRingColor: '#2363FF'
                  }}
                  disabled={loading}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div className="relative">
                <Input
                  type={show

ault.
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`h-12 rounded-lg border-2 bg-white px-4 pr-12 text-black placeholder:text-gray-500 focus:ring-2 focus:ring-opacity-20 ${errors.password ? 'border-red-500' : ''}`}
                  style={{
                    borderColor: errors.password ? '#EF4444' : '#CBD5E1',
                    focusBorderColor: '#2363FF',
                    focusRingColor: '#2363FF'
                  }}
                  disabled={loading}
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
                className="w-full h-12 text-white font-semibold rounded-lg shadow-lg transition-all duration-200"
                style={{ backgroundColor: '#2363FF', border: 'none' }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.backgroundColor = '#1E52D0';
                }}
                onMouseLeave={(e) => {
                  if (!loading) e.currentTarget.style.backgroundColor = '#2363FF';
                }}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    {activeTab === 'signup' ? 'Creating Account...' : 'Signing In...'}
                  </>
                ) : (
                  activeTab === 'signup' ? 'Create Account' : 'Sign In'
                )}
              </Button>
            </form>

            {/* "Can't sign in?" link for sign in page */}
            {activeTab === 'signin' && (
              <div className="text-center mt-4">
                <button 
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

            {/* Social Login Buttons */}
            <div className="space-y-3 mt-6">
              <Button
                onClick={() => {
                  toast({
                    title: "Coming Soon!",
                    description: "Google sign-in will be available soon.",
                  });
                }}
                className="w-full h-12 text-white font-medium rounded-lg transition-all duration-200"
                style={{ backgroundColor: '#2363FF', border: 'none' }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.backgroundColor = '#1E52D0';
                }}
                onMouseLeave={(e) => {
                  if (!loading) e.currentTarget.style.backgroundColor = '#2363FF';
                }}
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
                className="w-full h-12 text-white font-medium rounded-lg transition-all duration-200"
                style={{ backgroundColor: '#2363FF', border: 'none' }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.backgroundColor = '#1E52D0';
                }}
                onMouseLeave={(e) => {
                  if (!loading) e.currentTarget.style.backgroundColor = '#2363FF';
                }}
                disabled={loading}
              >
                <User size={18} className="mr-3" />
                Sign in with Facebook
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Guest Access */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-blue-400" />
            </div>
            <div className="relative flex justify-center text-sm uppercase">
              <span className="bg-gradient-to-br from-blue-50 to-blue-100 px-4 text-blue-700 font-medium">
                Just browsing?
              </span>
            </div>
          </div>
          
          <Button 
            onClick={handleGuestAccess}
            className="w-full mt-4 h-12 text-white font-semibold rounded-lg transition-all duration-200"
            style={{ backgroundColor: '#2363FF', border: 'none' }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#1E52D0';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#2363FF';
            }}
            disabled={loading}
          >
            Continue as Guest
          </Button>
        </div>
        
        <p className="text-xs text-center text-blue-700 mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Auth;
