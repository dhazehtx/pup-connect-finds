
import React from 'react';
import { Separator } from '@/components/ui/separator';
import RippleButton from '@/components/ui/ripple-button';

interface AuthToggleProps {
  isSignUp: boolean;
  onToggle: () => void;
  loading: boolean;
}

const AuthToggle = ({ isSignUp, onToggle, loading }: AuthToggleProps) => {
  return (
    <>
      <div className="relative">
        <Separator className="my-4" />
        <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-cloud-white px-2 text-sm text-deep-navy/60">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
        </span>
      </div>

      <RippleButton
        onClick={onToggle}
        variant="ghost"
        className="w-full text-royal-blue hover:bg-royal-blue/10"
        disabled={loading}
      >
        {isSignUp ? 'Sign In Instead' : 'Create Account'}
      </RippleButton>

      <p className="text-xs text-center text-deep-navy/60 mt-4">
        By continuing, you agree to our Terms of Service and Privacy Policy
      </p>
    </>
  );
};

export default AuthToggle;
