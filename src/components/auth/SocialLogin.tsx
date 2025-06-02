
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Chrome, Facebook, Apple, Shield, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SocialLoginProps {
  onSuccess?: () => void;
  showTwoFactor?: boolean;
}

const SocialLogin: React.FC<SocialLoginProps> = ({ onSuccess, showTwoFactor = false }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showTwoFactorInput, setShowTwoFactorInput] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    try {
      setLoading(provider);
      
      const redirectUrl = `${window.location.origin}/auth/callback`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Redirecting...",
        description: `Opening ${provider} login`,
      });

    } catch (error: any) {
      console.error('Social login error:', error);
      toast({
        title: "Login Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleGuestCheckout = () => {
    // Create guest session
    localStorage.setItem('guest_checkout', 'true');
    toast({
      title: "Guest Mode",
      description: "You can browse and purchase as a guest",
    });
    onSuccess?.();
  };

  const enable2FA = async () => {
    try {
      // In a real implementation, this would generate a QR code and secret
      const secret = 'sample_2fa_secret_' + Math.random().toString(36);
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          two_factor_enabled: true, 
          two_factor_secret: secret 
        })
        .eq('id', user?.id);

      if (error) throw error;

      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been enabled for your account",
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to enable 2FA",
        variant: "destructive",
      });
    }
  };

  if (showTwoFactor && user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <h4 className="font-medium">2FA Security</h4>
              <p className="text-sm text-gray-600">Add an extra layer of security</p>
            </div>
            <Button onClick={enable2FA} size="sm">
              <Shield className="h-4 w-4 mr-1" />
              Enable 2FA
            </Button>
          </div>
          
          <div className="grid gap-2">
            <h4 className="font-medium">Connected Accounts</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2">
                  <Chrome className="h-4 w-4" />
                  <span className="text-sm">Google</span>
                </div>
                <Badge variant="secondary">Connected</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-2">
        <Button
          variant="outline"
          onClick={() => handleSocialLogin('google')}
          disabled={loading === 'google'}
          className="w-full h-11 bg-black text-white border-black hover:bg-gray-800 rounded-none font-medium"
        >
          <Chrome className="h-4 w-4 mr-2" />
          {loading === 'google' ? 'Connecting...' : 'Continue with Google'}
        </Button>

        <Button
          variant="outline"
          onClick={() => handleSocialLogin('facebook')}
          disabled={loading === 'facebook'}
          className="w-full h-11 bg-gray-800 text-white border-gray-800 hover:bg-gray-700 rounded-none font-medium"
        >
          <Facebook className="h-4 w-4 mr-2" />
          {loading === 'facebook' ? 'Connecting...' : 'Continue with Facebook'}
        </Button>

        <Button
          variant="outline"
          onClick={() => handleSocialLogin('apple')}
          disabled={loading === 'apple'}
          className="w-full h-11 bg-gray-900 text-white border-gray-900 hover:bg-gray-800 rounded-none font-medium"
        >
          <Apple className="h-4 w-4 mr-2" />
          {loading === 'apple' ? 'Connecting...' : 'Continue with Apple'}
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500 font-medium">Or</span>
        </div>
      </div>

      <Button
        variant="ghost"
        onClick={handleGuestCheckout}
        className="w-full h-11 text-gray-600 hover:bg-gray-100 rounded-none font-medium"
      >
        Continue as Guest
      </Button>

      <p className="text-xs text-gray-500 text-center">
        By continuing, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
};

export default SocialLogin;
