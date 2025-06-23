
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Shield, Star, UserCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const GreetingPage = () => {
  const navigate = useNavigate();
  const { user, continueAsGuest } = useAuth();

  // If user is already authenticated, redirect to home
  React.useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  const handleSignUp = () => {
    navigate('/auth');
  };

  const handleSignIn = () => {
    navigate('/auth');
  };

  const handleBrowseAsGuest = () => {
    continueAsGuest();
    navigate('/home');
  };

  const handleExplorePuppies = () => {
    navigate('/explore');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">MY PUP</span>
            </div>

            {/* Header Auth Buttons */}
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
      <main className="flex-1">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Find Your Perfect Puppy Companion
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Connect with verified breeders and discover adorable, healthy puppies waiting for their forever homes.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto mb-16">
            <Button 
              onClick={handleSignUp}
              className="bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold rounded-lg"
              size="lg"
            >
              👤 Sign Up
            </Button>
            <Button 
              onClick={handleSignIn}
              className="bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold rounded-lg"
              size="lg"
            >
              🔐 Sign In
            </Button>
            <Button 
              variant="outline"
              onClick={handleBrowseAsGuest}
              className="border-blue-600 text-blue-600 hover:bg-blue-50 py-4 text-lg font-semibold rounded-lg"
              size="lg"
            >
              👁 Browse as Guest
            </Button>
            <Button 
              variant="outline"
              onClick={handleExplorePuppies}
              className="border-blue-600 text-blue-600 hover:bg-blue-50 py-4 text-lg font-semibold rounded-lg"
              size="lg"
            >
              🔍 Explore Puppies
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <Card className="border-blue-100 hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <UserCheck className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">Verified Breeders</h3>
                <p className="text-sm text-gray-600">All breeders are thoroughly vetted</p>
              </CardContent>
            </Card>

            <Card className="border-blue-100 hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <Heart className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">Health Guaranteed</h3>
                <p className="text-sm text-gray-600">Health certificates and guarantees</p>
              </CardContent>
            </Card>

            <Card className="border-blue-100 hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <Star className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">5-Star Support</h3>
                <p className="text-sm text-gray-600">Dedicated customer support team</p>
              </CardContent>
            </Card>

            <Card className="border-blue-100 hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <Shield className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">Safe & Secure</h3>
                <p className="text-sm text-gray-600">Secure transactions and privacy</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GreetingPage;
