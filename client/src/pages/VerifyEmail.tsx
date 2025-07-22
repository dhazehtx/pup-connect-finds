
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const VerifyEmail = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Check if we have the required hash fragments for email verification
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        if (type === 'signup' && accessToken && refreshToken) {
          // User clicked email verification link
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) throw error;

          setStatus('success');
          setMessage('Your email has been verified successfully!');
          
          toast({
            title: "Email Verified!",
            description: "Your account is now active. Welcome to MY PUP!",
          });

          // Redirect to home page after a short delay
          setTimeout(() => {
            navigate('/');
          }, 2000);
        } else {
          throw new Error('Invalid verification link');
        }
      } catch (error: any) {
        console.error('Email verification error:', error);
        setStatus('error');
        setMessage(error.message || 'Failed to verify email');
        
        toast({
          title: "Verification Failed",
          description: "There was an error verifying your email. Please try again.",
          variant: "destructive",
        });
      }
    };

    verifyEmail();
  }, [navigate, toast]);

  const handleResendVerification = async () => {
    const email = searchParams.get('email');
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please sign up again to receive a new verification email.",
        variant: "destructive",
      });
      navigate('/auth?mode=signup');
      return;
    }

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });

      if (error) throw error;

      toast({
        title: "Verification Email Sent",
        description: "We've sent you a new verification email.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend verification email.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center">
            {status === 'loading' && (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            )}
            {status === 'success' && (
              <div className="bg-green-100 rounded-full p-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            )}
            {status === 'error' && (
              <div className="bg-red-100 rounded-full p-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            )}
          </div>
          <CardTitle>
            {status === 'loading' && 'Verifying Email...'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">{message}</p>
          
          {status === 'loading' && (
            <p className="text-sm text-gray-500">
              Please wait while we verify your email address.
            </p>
          )}

          {status === 'success' && (
            <p className="text-sm text-gray-500">
              Redirecting you to the homepage...
            </p>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <Button onClick={handleResendVerification} variant="outline" className="w-full">
                <Mail className="w-4 h-4 mr-2" />
                Resend Verification Email
              </Button>
              <Button onClick={() => navigate('/auth')} className="w-full">
                Back to Sign In
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;
