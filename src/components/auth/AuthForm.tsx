
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import AuthHeader from './AuthHeader';
import SignUpForm from './SignUpForm';
import SignInForm from './SignInForm';
import AuthToggle from './AuthToggle';

interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  username: string;
}

interface SignInData {
  email: string;
  password: string;
}

const AuthForm = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const { signUp, signIn, user, loading } = useAuth();

  // Redirect if user is already logged in
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSignUp = async (data: SignUpData) => {
    console.log('Sign up data:', data);
    try {
      await signUp(data.email, data.password, {
        full_name: data.fullName,
        username: data.username,
      });
    } catch (error) {
      console.error('Sign up error:', error);
    }
  };

  const handleSignIn = async (data: SignInData) => {
    console.log('Sign in data:', data);
    try {
      await signIn(data.email, data.password);
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-royal-blue/10 to-mint-green/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto bg-cloud-white border-soft-sky shadow-lg">
        <AuthHeader isSignUp={isSignUp} />
        
        <CardContent className="space-y-4">
          {isSignUp ? (
            <SignUpForm onSubmit={handleSignUp} loading={loading} />
          ) : (
            <SignInForm onSubmit={handleSignIn} loading={loading} />
          )}

          <AuthToggle 
            isSignUp={isSignUp} 
            onToggle={() => setIsSignUp(!isSignUp)} 
            loading={loading} 
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthForm;
