
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, ArrowRight } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

const Index = () => {
  const navigate = useNavigate();
  const { user, isGuest } = useAuth();
  const [searchParams] = useSearchParams();
  const redirectFrom = searchParams.get('redirect');

  // If user is already authenticated, redirect to home
  useEffect(() => {
    if (user || isGuest) {
      navigate('/home');
    }
  }, [user, isGuest, navigate]);

  const handleSignIn = () => {
    const redirectPath = redirectFrom || '/home';
    navigate(`/auth?redirect=${encodeURIComponent(redirectPath)}`);
  };

  const handleCreateAccount = () => {
    const redirectPath = redirectFrom || '/home';
    navigate(`/auth?redirect=${encodeURIComponent(redirectPath)}`);
  };

  const handleExploreAsGuest = () => {
    navigate('/explore');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col">
      {/* Main Content Container */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        
        {/* Top Section - Logo & Tagline */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-white rounded-full p-4 shadow-lg border border-blue-100">
              <Heart className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            MY PUP
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 max-w-md mx-auto leading-relaxed">
            Connecting Loving Families With Their Perfect Pup Companion
          </p>
        </div>

        {/* Middle Section - Hero Card */}
        <Card className="w-full max-w-md mx-auto shadow-xl border-0 bg-white/80 backdrop-blur-sm animate-scale-in">
          <CardContent className="p-8">
            
            {/* Redirect Message */}
            {redirectFrom && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-center">
                <p className="text-blue-700 font-medium">
                  Please sign in to continue
                </p>
              </div>
            )}

            {/* Hero Illustration Area */}
            <div className="text-center mb-8">
              <div className="relative">
                <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-inner">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <Heart className="w-10 h-10 text-white" />
                  </div>
                </div>
                
                {/* Floating hearts animation */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 animate-pulse">
                  <Heart className="w-4 h-4 text-blue-300 absolute -top-2 -left-6" />
                  <Heart className="w-3 h-3 text-blue-400 absolute -top-1 right-4" />
                </div>
              </div>
              
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Welcome to My Pup
              </h2>
              <p className="text-gray-600 text-sm">
                Find your perfect furry companion today
              </p>
            </div>

            {/* Primary CTA Buttons */}
            <div className="space-y-4">
              <Button 
                onClick={handleSignIn}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 h-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                size="lg"
              >
                <span>Sign In</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Button 
                onClick={handleCreateAccount}
                variant="outline"
                className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold py-3 h-12 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                size="lg"
              >
                <span>Create Account</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            {/* Guest Access Option */}
            <div className="mt-6 text-center">
              <Button 
                variant="link" 
                onClick={handleExploreAsGuest}
                className="text-gray-500 hover:text-blue-600 text-sm underline-offset-4"
              >
                Continue as Guest
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Preview - Public Pages */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm mb-4">Or explore without signing in:</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/explore')}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
            >
              Browse Puppies
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/marketplace')}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
            >
              Pet Services
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Section - Legal */}
      <div className="text-center py-6 px-4 border-t border-blue-100 bg-white/50">
        <p className="text-xs text-gray-500 max-w-md mx-auto">
          By continuing, you agree to our{' '}
          <button 
            onClick={() => navigate('/legal')}
            className="text-blue-600 hover:text-blue-700 underline"
          >
            Terms of Use
          </button>
          {' '}and{' '}
          <button 
            onClick={() => navigate('/legal')}
            className="text-blue-600 hover:text-blue-700 underline"
          >
            Privacy Policy
          </button>
          .
        </p>
      </div>
    </div>
  );
};

export default Index;
