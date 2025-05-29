
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RippleButton from '@/components/ui/ripple-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Heart, Mail, User, Eye, EyeOff, Shield, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface AuthScreenProps {
  onSignIn: () => void;
  onGuestBrowse: () => void;
  onSkip?: () => void;
}

const AuthScreen = ({ onSignIn, onGuestBrowse, onSkip }: AuthScreenProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});
  const { signIn, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: {email?: string; password?: string} = {};
    
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
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      await signIn(email, password);
      onSignIn();
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const handleGuestBrowse = () => {
    onGuestBrowse();
  };

  const handleGoToFullAuth = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-royal-blue/10 to-mint-green/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto bg-cloud-white border-soft-sky shadow-lg">
        <CardHeader className="text-center pb-4">
          {onSkip && (
            <div className="flex justify-end mb-2">
              <RippleButton
                onClick={onSkip}
                variant="ghost"
                size="sm"
                className="text-deep-navy/60 hover:text-deep-navy"
              >
                Skip for now
              </RippleButton>
            </div>
          )}
          
          <div className="w-16 h-16 mx-auto mb-4 bg-royal-blue rounded-full flex items-center justify-center">
            <Heart size={32} className="text-cloud-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-deep-navy">Welcome to MY PUP</CardTitle>
          <p className="text-deep-navy/70">Join our community of dog lovers</p>
          
          <div className="flex items-center justify-center gap-2 mt-2 text-xs text-deep-navy/60">
            <Shield size={12} />
            <span>Your data is secure and encrypted</span>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <RippleButton
              onClick={() => {
                toast({
                  title: "Coming Soon!",
                  description: "Google sign-in will be available soon.",
                });
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
            >
              <Mail size={18} className="mr-2" />
              Continue with Google
            </RippleButton>
            
            <RippleButton
              onClick={() => {
                toast({
                  title: "Coming Soon!",
                  description: "Facebook sign-in will be available soon.",
                });
              }}
              variant="outline"
              className="w-full border-gray-300 text-deep-navy hover:bg-gray-50"
              disabled={loading}
            >
              <User size={18} className="mr-2" />
              Continue with Facebook
            </RippleButton>
          </div>

          <div className="relative">
            <Separator className="my-4" />
            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-cloud-white px-2 text-sm text-deep-navy/60">
              or
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label htmlFor="email" className="text-deep-navy">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`mt-1 ${errors.email ? 'border-red-500' : ''}`}
                disabled={loading}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="password" className="text-deep-navy">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`mt-1 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <RippleButton
              type="submit"
              disabled={loading}
              className="w-full bg-royal-blue hover:bg-royal-blue/90 text-cloud-white disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Signing In...
                </>
              ) : (
                <>
                  <Lock size={16} className="mr-2" />
                  Sign In Securely
                </>
              )}
            </RippleButton>
          </form>

          <div className="text-center">
            <RippleButton
              onClick={handleGoToFullAuth}
              variant="ghost"
              className="text-sm text-royal-blue hover:bg-royal-blue/10"
              disabled={loading}
            >
              Need to create an account? Sign up here
            </RippleButton>
          </div>

          <div className="relative">
            <Separator className="my-4" />
            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-cloud-white px-2 text-sm text-deep-navy/60">
              Just browsing?
            </span>
          </div>

          <RippleButton
            onClick={handleGuestBrowse}
            variant="ghost"
            className="w-full text-royal-blue hover:bg-royal-blue/10"
            disabled={loading}
          >
            Continue as Guest
          </RippleButton>

          <p className="text-xs text-center text-deep-navy/60 mt-4">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthScreen;
