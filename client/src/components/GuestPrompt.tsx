
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Lock, ArrowLeft } from 'lucide-react';

interface GuestPromptProps {
  action: string;
  description?: string;
  onCancel?: () => void;
}

const GuestPrompt = ({ action, description, onCancel }: GuestPromptProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto bg-white">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-600 rounded-full flex items-center justify-center">
            <Lock size={32} className="text-white" />
          </div>
          <CardTitle className="text-xl font-bold text-gray-900">
            Sign In Required
          </CardTitle>
          <p className="text-gray-600">
            {description || `To ${action}, you need to have an account.`}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Button
            onClick={() => navigate('/auth')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Heart size={16} className="mr-2" />
            Sign In / Sign Up
          </Button>
          
          <Button
            onClick={() => navigate('/explore')}
            variant="outline"
            className="w-full text-blue-600 hover:bg-blue-50 border-blue-200"
          >
            <ArrowLeft size={16} className="mr-2" />
            Continue Browsing
          </Button>
          
          <p className="text-xs text-center text-gray-500">
            Join thousands of dog lovers finding their perfect pup
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default GuestPrompt;
