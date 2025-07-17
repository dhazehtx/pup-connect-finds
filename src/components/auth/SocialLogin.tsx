
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mail, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SocialLoginProps {
  onSuccess?: () => void;
}

const SocialLogin = ({ onSuccess }: SocialLoginProps) => {
  const { toast } = useToast();

  const handleGoogleLogin = async () => {
    toast({
      title: "Coming Soon!",
      description: "Google sign-in will be available soon.",
    });
  };

  const handleFacebookLogin = async () => {
    toast({
      title: "Coming Soon!",
      description: "Facebook sign-in will be available soon.",
    });
  };

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleLogin}
        className="w-full"
      >
        <Mail className="w-4 h-4 mr-2" />
        Continue with Google
      </Button>
      
      <Button
        type="button"
        variant="outline"
        onClick={handleFacebookLogin}
        className="w-full"
      >
        <User className="w-4 h-4 mr-2" />
        Continue with Facebook
      </Button>
    </div>
  );
};

export default SocialLogin;
