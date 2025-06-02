
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

interface AuthToggleProps {
  isSignUp: boolean;
  onToggle: () => void;
  loading: boolean;
}

const AuthToggle = ({ isSignUp, onToggle, loading }: AuthToggleProps) => {
  return (
    <>
      <div className="relative">
        <Separator className="my-4 bg-gray-300" />
        <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-gray-500 font-medium">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
        </span>
      </div>

      <Button
        onClick={onToggle}
        variant="ghost"
        className="w-full h-11 text-gray-600 hover:bg-gray-100 rounded-none font-medium"
        disabled={loading}
      >
        {isSignUp ? 'Sign In Instead' : 'Create Account'}
      </Button>

      <p className="text-xs text-center text-gray-500 mt-4">
        By continuing, you agree to our Terms of Service and Privacy Policy
      </p>
    </>
  );
};

export default AuthToggle;
