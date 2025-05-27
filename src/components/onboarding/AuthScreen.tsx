
import React, { useState } from 'react';
import RippleButton from '@/components/ui/ripple-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Heart, Mail, User, Eye, EyeOff, Shield, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Success! 🎉",
        description: "Welcome to MY PUP! You're all set.",
      });
      onSignIn();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto bg-background border-border shadow-lg">
        <CardHeader className="text-center pb-4">
          {onSkip && (
            <div className="flex justify-end mb-2">
              <RippleButton
                onClick={onSkip}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                Skip for now
              </RippleButton>
            </div>
          )}
          
          <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center">
            <Heart size={32} className="text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">Welcome to MY PUP</CardTitle>
          <p className="text-muted-foreground">Join our community of dog lovers</p>
          
          {/* Security indicator */}
          <div className="flex items-center justify-center gap-2 mt-2 text-xs text-muted-foreground">
            <Shield size={12} />
            <span>Your data is secure and encrypted</span>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Social Login Options */}
          <div className="space-y-3">
            <RippleButton
              onClick={() => {
                toast({
                  title: "Coming Soon!",
                  description: "Google sign-in will be available soon.",
                });
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
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
              className="w-full border-border text-foreground hover:bg-muted"
            >
              <User size={18} className="mr-2" />
              Continue with Facebook
            </RippleButton>
          </div>

          <div className="relative">
            <Separator className="my-4" />
            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-sm text-muted-foreground">
              or
            </span>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`mt-1 bg-background border-border ${errors.email ? 'border-destructive' : ''}`}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-destructive text-xs mt-1">{errors.email}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`mt-1 pr-10 bg-background border-border ${errors.password ? 'border-destructive' : ''}`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-destructive text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <RippleButton
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent mr-2" />
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

          <div className="relative">
            <Separator className="my-4" />
            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-sm text-muted-foreground">
              Just browsing?
            </span>
          </div>

          {/* Guest Browse Option */}
          <RippleButton
            onClick={onGuestBrowse}
            variant="ghost"
            className="w-full text-primary hover:bg-primary/10"
            disabled={isLoading}
          >
            Continue as Guest
          </RippleButton>

          <p className="text-xs text-center text-muted-foreground mt-4">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthScreen;
