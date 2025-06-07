
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Heart, Mail, User, Eye, EyeOff, Shield, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const ProfileAuthScreen = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const { signIn, signUp, loading, continueAsGuest } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

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

    if (isSignUp) {
      if (!fullName) {
        newErrors.fullName = 'Full name is required';
      }
      if (!username) {
        newErrors.username = 'Username is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      if (isSignUp) {
        await signUp(email, password, { full_name: fullName, username });
      } else {
        await signIn(email, password);
      }
      // Auth context will handle redirect
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  const handleGuestBrowse = () => {
    continueAsGuest();
    navigate('/');
  };

  return (
    <div className="max-w-md mx-auto bg-background min-h-screen flex items-center justify-center p-4">
      <Card className="w-full bg-card border-border shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center">
            <Heart size={32} className="text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            {isSignUp ? 'Join MY PUP' : 'Welcome Back'}
          </CardTitle>
          <p className="text-muted-foreground">
            {isSignUp ? 'Create your account to connect with breeders' : 'Sign in to your MY PUP account'}
          </p>
          
          <div className="flex items-center justify-center gap-2 mt-2 text-xs text-muted-foreground">
            <Shield size={12} />
            <span>Your data is secure and encrypted</span>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Button
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
            </Button>
            
            <Button
              onClick={() => {
                toast({
                  title: "Coming Soon!",
                  description: "Facebook sign-in will be available soon.",
                });
              }}
              variant="outline"
              className="w-full border-border text-foreground hover:bg-muted"
              disabled={loading}
            >
              <User size={18} className="mr-2" />
              Continue with Facebook
            </Button>
          </div>

          <div className="relative">
            <Separator className="my-4" />
            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-sm text-muted-foreground">
              or
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {isSignUp && (
              <>
                <div>
                  <Label htmlFor="fullName" className="text-foreground">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`mt-1 ${errors.fullName ? 'border-destructive' : ''}`}
                    disabled={loading}
                  />
                  {errors.fullName && (
                    <p className="text-destructive text-xs mt-1">{errors.fullName}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="username" className="text-foreground">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`mt-1 ${errors.username ? 'border-destructive' : ''}`}
                    disabled={loading}
                  />
                  {errors.username && (
                    <p className="text-destructive text-xs mt-1">{errors.username}</p>
                  )}
                </div>
              </>
            )}

            <div>
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`mt-1 ${errors.email ? 'border-destructive' : ''}`}
                disabled={loading}
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
                  className={`mt-1 pr-10 ${errors.password ? 'border-destructive' : ''}`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-destructive text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent mr-2" />
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </>
              ) : (
                <>
                  <Lock size={16} className="mr-2" />
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </>
              )}
            </Button>
          </form>

          <div className="text-center">
            <Button
              onClick={() => setIsSignUp(!isSignUp)}
              variant="ghost"
              className="text-sm text-primary hover:bg-primary/10"
              disabled={loading}
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </Button>
          </div>

          <div className="relative">
            <Separator className="my-4" />
            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-sm text-muted-foreground">
              Just browsing?
            </span>
          </div>

          <Button
            onClick={handleGuestBrowse}
            variant="ghost"
            className="w-full text-primary hover:bg-primary/10"
            disabled={loading}
          >
            Continue as Guest
          </Button>

          <p className="text-xs text-center text-muted-foreground mt-4">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileAuthScreen;
