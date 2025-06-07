import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Heart, Mail, User, Eye, EyeOff, Shield, Lock, Apple } from 'lucide-react';
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-6 bg-primary rounded-full flex items-center justify-center">
            <Heart size={32} className="text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {isSignUp ? 'Sign up for MY PUP' : 'Log in to MY PUP'}
          </h1>
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-4 mb-6">
          <Button
            onClick={() => {
              toast({
                title: "Coming Soon!",
                description: "Facebook sign-in will be available soon.",
              });
            }}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full border-0"
            disabled={loading}
          >
            <User size={18} className="mr-3 text-white" />
            <span className="text-white">CONTINUE WITH FACEBOOK</span>
          </Button>
          
          <Button
            onClick={() => {
              toast({
                title: "Coming Soon!",
                description: "Apple sign-in will be available soon.",
              });
            }}
            className="w-full h-12 bg-black hover:bg-gray-800 text-white font-semibold rounded-full border-0"
            disabled={loading}
          >
            <Apple size={18} className="mr-3 text-white" />
            <span className="text-white">CONTINUE WITH APPLE</span>
          </Button>
          
          <Button
            onClick={() => {
              toast({
                title: "Coming Soon!",
                description: "Google sign-in will be available soon.",
              });
            }}
            variant="outline"
            className="w-full h-12 bg-white hover:bg-gray-50 text-black font-semibold rounded-full border-2 border-gray-300"
            disabled={loading}
          >
            <Mail size={18} className="mr-3" />
            CONTINUE WITH GOOGLE
          </Button>
        </div>

        <div className="relative mb-6">
          <Separator className="my-4" />
          <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background px-4 text-sm font-bold text-foreground">
            OR
          </span>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <>
              <div>
                <Label htmlFor="fullName" className="text-sm font-semibold text-foreground">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`mt-2 h-12 rounded-md border-2 border-gray-300 bg-gray-100 px-4 text-foreground placeholder:text-gray-500 focus:border-black focus:bg-white ${errors.fullName ? 'border-destructive' : ''}`}
                  disabled={loading}
                />
                {errors.fullName && (
                  <p className="text-destructive text-xs mt-1">{errors.fullName}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="username" className="text-sm font-semibold text-foreground">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`mt-2 h-12 rounded-md border-2 border-gray-300 bg-gray-100 px-4 text-foreground placeholder:text-gray-500 focus:border-black focus:bg-white ${errors.username ? 'border-destructive' : ''}`}
                  disabled={loading}
                />
                {errors.username && (
                  <p className="text-destructive text-xs mt-1">{errors.username}</p>
                )}
              </div>
            </>
          )}

          <div>
            <Label htmlFor="email" className="text-sm font-semibold text-foreground">Email address or username</Label>
            <Input
              id="email"
              type="email"
              placeholder="Email address or username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`mt-2 h-12 rounded-md border-2 border-gray-300 bg-gray-100 px-4 text-foreground placeholder:text-gray-500 focus:border-black focus:bg-white ${errors.email ? 'border-destructive' : ''}`}
              disabled={loading}
            />
            {errors.email && (
              <p className="text-destructive text-xs mt-1">{errors.email}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="password" className="text-sm font-semibold text-foreground">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`mt-2 h-12 rounded-md border-2 border-gray-300 bg-gray-100 px-4 pr-12 text-foreground placeholder:text-gray-500 focus:border-black focus:bg-white ${errors.password ? 'border-destructive' : ''}`}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-foreground"
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
            className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full border-0 mt-6"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                {isSignUp ? 'Creating Account...' : 'Logging In...'}
              </>
            ) : (
              isSignUp ? 'Sign Up' : 'Log In'
            )}
          </Button>
        </form>

        <div className="text-center mt-6">
          <Button
            onClick={() => setIsSignUp(!isSignUp)}
            variant="ghost"
            className="text-sm text-gray-600 hover:text-foreground hover:bg-transparent underline"
            disabled={loading}
          >
            {isSignUp ? 'Already have an account? Log in here.' : "Don't have an account? Sign up for MY PUP"}
          </Button>
        </div>

        <div className="relative mt-8 mb-4">
          <Separator className="my-4" />
          <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background px-4 text-sm text-gray-600">
            Just browsing?
          </span>
        </div>

        <Button
          onClick={handleGuestBrowse}
          variant="ghost"
          className="w-full text-gray-600 hover:text-foreground hover:bg-transparent underline"
          disabled={loading}
        >
          Continue as Guest
        </Button>

        <div className="flex items-center justify-center gap-2 mt-8 text-xs text-gray-500">
          <Shield size={12} />
          <span>Your data is secure and encrypted</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileAuthScreen;
