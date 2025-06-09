
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import TwoFactorLogin from './TwoFactorLogin';
import { supabase } from '@/integrations/supabase/client';

interface SignInData {
  email: string;
  password: string;
}

interface EnhancedSignInFormProps {
  onSubmit: (data: SignInData) => Promise<void>;
  loading: boolean;
}

const EnhancedSignInForm = ({ onSubmit, loading }: EnhancedSignInFormProps) => {
  const [formData, setFormData] = useState<SignInData>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempUserId, setTempUserId] = useState<string | null>(null);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      // First, try to sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          setEmailNotVerified(true);
          return;
        }
        throw error;
      }

      // Check if user has 2FA enabled
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('two_factor_enabled')
          .eq('id', data.user.id)
          .single();

        if (profile?.two_factor_enabled) {
          // Sign out temporarily and require 2FA
          await supabase.auth.signOut();
          setRequires2FA(true);
          setTempUserId(data.user.id);
          return;
        }
      }

      // If no 2FA required, proceed with normal login
      await onSubmit(formData);
    } catch (error: any) {
      console.error('Sign in error:', error);
      setErrors({ general: error.message });
    }
  };

  const handle2FAVerification = async (code: string) => {
    try {
      // In a real implementation, verify the TOTP code
      // For now, simulate verification
      if (code.length === 6) {
        await onSubmit(formData);
        setRequires2FA(false);
      } else {
        throw new Error('Invalid verification code');
      }
    } catch (error: any) {
      throw error;
    }
  };

  const handleBackupCodeVerification = async (code: string) => {
    try {
      // In a real implementation, verify the backup code
      // For now, simulate verification
      if (code.length >= 4) {
        await onSubmit(formData);
        setRequires2FA(false);
      } else {
        throw new Error('Invalid backup code');
      }
    } catch (error: any) {
      throw error;
    }
  };

  const resendVerificationEmail = async () => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Verification email sent!",
        description: "Please check your inbox for the verification link.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: keyof SignInData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (requires2FA) {
    return (
      <TwoFactorLogin
        onVerify={handle2FAVerification}
        onBackupCodeVerify={handleBackupCodeVerification}
        onBack={() => setRequires2FA(false)}
        loading={loading}
      />
    );
  }

  if (emailNotVerified) {
    return (
      <div className="space-y-4">
        <Alert>
          <Mail className="h-4 w-4" />
          <AlertDescription>
            Please verify your email address before signing in. Check your inbox for a verification link.
          </AlertDescription>
        </Alert>
        <div className="space-y-2">
          <Button onClick={resendVerificationEmail} variant="outline" className="w-full">
            Resend Verification Email
          </Button>
          <Button onClick={() => setEmailNotVerified(false)} variant="ghost" className="w-full">
            Back to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.general && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.general}</AlertDescription>
        </Alert>
      )}

      <div>
        <Label htmlFor="signin-email" className="text-white">Email Address</Label>
        <Input
          id="signin-email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className={`mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${errors.email ? 'border-red-500' : ''}`}
          disabled={loading}
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email}</p>
        )}
      </div>

      <div>
        <Label htmlFor="signin-password" className="text-white">Password</Label>
        <div className="relative">
          <Input
            id="signin-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className={`mt-1 pr-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${errors.password ? 'border-red-500' : ''}`}
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
          <p className="text-red-500 text-sm mt-1">{errors.password}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
            Signing In...
          </>
        ) : (
          'Sign In'
        )}
      </Button>
    </form>
  );
};

export default EnhancedSignInForm;
