
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import AuthForm from '@/components/auth/AuthForm';
import SocialLogin from '@/components/auth/SocialLogin';

const Auth = () => {
  const [activeTab, setActiveTab] = useState('signin');
  const [resetMode, setResetMode] = useState(false);
  const { user, continueAsGuest } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check if we're in password reset mode
    const mode = searchParams.get('mode');
    if (mode === 'reset') {
      setResetMode(true);
    }

    // Redirect if user is already logged in
    if (user) {
      navigate('/');
    }
  }, [user, navigate, searchParams]);

  const handleGuestAccess = () => {
    continueAsGuest();
    navigate('/');
  };

  if (user) {
    return null;
  }

  if (resetMode) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center">Password Reset</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                Your password has been reset successfully. You can now sign in with your new password.
              </AlertDescription>
            </Alert>
            <div className="mt-4 text-center">
              <button 
                onClick={() => {
                  setResetMode(false);
                  setActiveTab('signin');
                }}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Continue to Sign In
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">MY PUP</h1>
          <p className="text-gray-600 mt-2">Find your perfect companion</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 bg-white border border-gray-200 rounded-none h-12 p-0">
            <TabsTrigger 
              value="signin"
              className="data-[state=active]:bg-black data-[state=active]:text-white text-gray-600 font-medium border-0 rounded-none h-full transition-colors"
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger 
              value="signup"
              className="data-[state=active]:bg-black data-[state=active]:text-white text-gray-600 font-medium border-0 rounded-none h-full transition-colors"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <Card className="border border-gray-200 shadow-sm rounded-none bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-gray-900 text-center">Sign In</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 px-6 pb-6">
                <SocialLogin onSuccess={() => navigate('/')} />
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-3 text-gray-500 font-medium">Or continue with email</span>
                  </div>
                </div>
                <AuthForm mode="signin" onSuccess={() => navigate('/')} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card className="border border-gray-200 shadow-sm rounded-none bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-gray-900 text-center">Create Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 px-6 pb-6">
                <SocialLogin onSuccess={() => navigate('/')} />
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-3 text-gray-500 font-medium">Or continue with email</span>
                  </div>
                </div>
                <AuthForm mode="signup" onSuccess={() => navigate('/')} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Simple Guest Access Button */}
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-50 px-3 text-gray-500 font-medium">Just browsing?</span>
            </div>
          </div>
          <Button
            onClick={handleGuestAccess}
            variant="ghost"
            className="w-full mt-4 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            Continue as Guest
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
