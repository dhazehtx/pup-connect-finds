
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RippleButton from '@/components/ui/ripple-button';
import { Heart, Lock, MessageCircle } from 'lucide-react';

interface GuestPromptProps {
  action: string;
  description?: string;
  onCancel?: () => void;
}

const GuestPrompt = ({ action, description, onCancel }: GuestPromptProps) => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md mx-auto bg-cloud-white">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-royal-blue rounded-full flex items-center justify-center">
            <Lock size={32} className="text-cloud-white" />
          </div>
          <CardTitle className="text-xl font-bold text-deep-navy">
            Sign In Required
          </CardTitle>
          <p className="text-deep-navy/70">
            {description || `To ${action}, you need to have an account.`}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <RippleButton
            onClick={() => navigate('/auth')}
            className="w-full bg-royal-blue hover:bg-royal-blue/90 text-cloud-white"
          >
            <Heart size={16} className="mr-2" />
            Sign In / Sign Up
          </RippleButton>
          
          {onCancel && (
            <RippleButton
              onClick={onCancel}
              variant="ghost"
              className="w-full text-royal-blue hover:bg-royal-blue/10"
            >
              Continue Browsing
            </RippleButton>
          )}
          
          <p className="text-xs text-center text-deep-navy/60">
            Join thousands of dog lovers finding their perfect pup
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default GuestPrompt;
