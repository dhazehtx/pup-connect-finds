
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
      <Button
        type="button"
        variant="ghost"
        onClick={onToggle}
        disabled={loading}
        className="text-sm"
      >
        {isSignUp 
          ? 'Already have an account? Sign in here' 
          : "Don't have an account? Sign up for MY PUP"
        }
      </Button>
    </div>
  );
};

export default AuthToggle;
