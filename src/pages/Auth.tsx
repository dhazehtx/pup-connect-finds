
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import AuthForm from '@/components/auth/AuthForm';
import SocialLogin from '@/components/auth/SocialLogin';
import GuestCheckout from '@/components/auth/GuestCheckout';

const Auth = () => {
  const [activeTab, setActiveTab] = useState('signin');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">DogFinder</h1>
          <p className="text-gray-600 mt-2">Find your perfect companion</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 bg-gray-100 border-0 rounded-none h-12 p-0">
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
            <TabsTrigger 
              value="guest"
              className="data-[state=active]:bg-black data-[state=active]:text-white text-gray-600 font-medium border-0 rounded-none h-full transition-colors"
            >
              Guest
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <Card className="border-0 shadow-none rounded-none bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-gray-900 text-center">Sign In</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-6 pb-6">
                <SocialLogin onSuccess={() => navigate('/')} />
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500 font-medium">Or continue with email</span>
                  </div>
                </div>
                <AuthForm mode="signin" onSuccess={() => navigate('/')} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card className="border-0 shadow-none rounded-none bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-gray-900 text-center">Create Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-6 pb-6">
                <SocialLogin onSuccess={() => navigate('/')} />
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500 font-medium">Or continue with email</span>
                  </div>
                </div>
                <AuthForm mode="signup" onSuccess={() => navigate('/')} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guest">
            <GuestCheckout 
              onComplete={() => navigate('/')}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
