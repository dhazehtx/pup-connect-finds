
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mail, User, Apple } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SocialLoginButtonsProps {
  onSuccess?: () => void;
  disabled?: boolean;
}

const SocialLoginButtons = ({ onSuccess, disabled = false }: SocialLoginButtonsProps) => {
  const { toast } = useToast();

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast({
        title: "Error",
        description: "Failed to sign in with Google",
        variant: "destructive",
      });
    }
  };

  const handleFacebookLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Facebook login error:', error);
      toast({
        title: "Error",
        description: "Failed to sign in with Facebook",
        variant: "destructive",
      });
    }
  };

  const handleAppleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Apple login error:', error);
      toast({
        title: "Error",
        description: "Failed to sign in with Apple",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleLogin}
        disabled={disabled}
        className="w-full h-12 bg-white hover:bg-gray-50 text-black font-semibold rounded-full border-2 border-gray-300"
      >
        <Mail size={18} className="mr-3" />
        Continue with Google
      </Button>
      
      <Button
        type="button"
        onClick={handleFacebookLogin}
        disabled={disabled}
        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full border-0"
      >
        <User size={18} className="mr-3" />
        Continue with Facebook
      </Button>
      
      <Button
        type="button"
        onClick={handleAppleLogin}
        disabled={disabled}
        className="w-full h-12 bg-black hover:bg-gray-800 text-white font-semibold rounded-full border-0"
      >
        <Apple size={18} className="mr-3" />
        Continue with Apple
      </Button>
    </div>
  );
};

export default SocialLoginButtons;
