
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Apple } from 'lucide-react';

interface SocialLoginProps {
  onSuccess?: () => void;
}

const SocialLogin = ({ onSuccess }: SocialLoginProps) => {
  const { toast } = useToast();

  const handleSocialLogin = (provider: string) => {
    toast({
      title: "Coming Soon!",
      description: `${provider} sign-in will be available soon.`,
    });
  };

  return (
    <div className="space-y-3">
      {/* Facebook Login */}
      <Button
        onClick={() => handleSocialLogin('Facebook')}
        className="w-full h-12 bg-[#1877F2] hover:bg-[#166FE5] text-white font-semibold rounded-lg border-0 flex items-center justify-center gap-3 transition-colors"
      >
        <User size={18} className="text-white" />
        <span className="text-white font-semibold">Continue with Facebook</span>
      </Button>
      
      {/* Google Login */}
      <Button
        onClick={() => handleSocialLogin('Google')}
        variant="outline"
        className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg border-2 border-gray-300 flex items-center justify-center gap-3 transition-colors"
      >
        <Mail size={18} className="text-gray-700" />
        <span className="text-gray-700 font-semibold">Continue with Google</span>
      </Button>
      
      {/* Apple Login */}
      <Button
        onClick={() => handleSocialLogin('Apple')}
        className="w-full h-12 bg-black hover:bg-gray-900 text-white font-semibold rounded-lg border-0 flex items-center justify-center gap-3 transition-colors"
      >
        <Apple size={18} className="text-white" />
        <span className="text-white font-semibold">Continue with Apple</span>
      </Button>
    </div>
  );
};

export default SocialLogin;
