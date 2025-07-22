
import React from 'react';
import { Button } from '@/components/ui/button';

interface AuthToggleProps {
  isSignUp: boolean;
  onToggle: () => void;
  loading: boolean;
}

const AuthToggle = ({ isSignUp, onToggle, loading }: AuthToggleProps) => {
  return (
    <div className="text-center">
      <p className="text-sm text-gray-600">
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
      </p>
      <Button
        type="button"
        variant="ghost"
        onClick={onToggle}
        disabled={loading}
        className="text-blue-600 hover:text-blue-800 underline"
      >
        {isSignUp ? 'Sign in here' : 'Sign up here'}
      </Button>
    </div>
  );
};

export default AuthToggle;
