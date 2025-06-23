
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, ArrowRight, Shield, Star, Users } from 'lucide-react';
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

  const handleSignUp = () => {
    const redirectPath = redirectFrom || '/home';
    navigate(`/auth?redirect=${encodeURIComponent(redirectPath)}`);
  };

  const handleBrowseAsGuest = () => {
    navigate('/explore');
  };

  const handleExplorePuppies = () => {
    navigate('/explore');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">MY PUP</span>
            </div>

            {/* Header Buttons */}
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={handleSignIn}
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                Sign In
              </Button>
              <Button 
                onClick={handleSignUp}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        
        {/* Redirect Message */}
        {redirectFrom && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4 text-center max-w-md">
            <p className="text-blue-700 font-medium">
              Please sign in to continue to {redirectFrom.replace('/', '')}
            </p>
          </div>
        )}

        {/* Hero Section */}
        <div className="text-center mb-12 max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Find Your Perfect
            <br />
            <span className="text-blue-600">Puppy Companion</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Connect with verified breeders and discover adorable, healthy puppies waiting for their forever homes.
          </p>
        </div>

        {/* Primary CTAs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16 w-full max-w-4xl">
          <Button 
            onClick={handleSignUp}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white h-14 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Users className="w-5 h-5 mr-2" />
            Sign Up
          </Button>
          
          <Button 
            onClick={handleSignIn}
            variant="outline"
            size="lg"
            className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white h-14 rounded-xl font-semibold text-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            <ArrowRight className="w-5 h-5 mr-2" />
            Sign In
          </Button>
          
          <Button 
            onClick={handleBrowseAsGuest}
            variant="outline"
            size="lg"
            className="border-2 border-gray-300 text-gray-600 hover:bg-gray-50 h-14 rounded-xl font-semibold text-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            👁️ Browse as Guest
          </Button>
          
          <Button 
            onClick={handleExplorePuppies}
            variant="outline"
            size="lg"
            className="border-2 border-gray-300 text-gray-600 hover:bg-gray-50 h-14 rounded-xl font-semibold text-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            🔍 Explore Puppies
          </Button>
        </div>

        {/* Trust Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full">
          <Card className="bg-white/70 backdrop-blur-sm border-blue-100 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">✅ Verified Breeders</h3>
              <p className="text-gray-600 text-sm">
                All breeders are thoroughly vetted and verified for quality and ethics
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-blue-100 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">❤️ Health Guaranteed</h3>
              <p className="text-gray-600 text-sm">
                Every puppy comes with health records and genetic testing documentation
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-blue-100 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">⭐ 5-Star Support</h3>
              <p className="text-gray-600 text-sm">
                Dedicated customer support to help you every step of the way
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/50 border-t border-blue-100 py-6 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs text-gray-500">
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
      </footer>
    </div>
  );
};

export default Index;
