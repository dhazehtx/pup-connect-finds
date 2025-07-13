
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Star, CheckCircle, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user, isGuest, continueAsGuest } = useAuth();

  // If user is authenticated, redirect to home
  React.useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  const handleBrowseAsGuest = () => {
    continueAsGuest();
    navigate('/explore');
  };

  const handleExplore = () => {
    navigate('/explore');
  };

  return (
    <div className="min-h-screen bg-white unified-theme">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-slate-900">MY PUP</span>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={() => navigate('/auth')}
                className="border-2 border-blue-600 text-blue-600 bg-white hover:bg-blue-50 rounded-lg font-medium transition-all duration-200"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => navigate('/auth')}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200"
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 md:py-16 bg-white">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-12 md:mb-16">
          <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-slate-900 mb-4 md:mb-6">
            Find Your Perfect Puppy Companion
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-slate-600 mb-8 md:mb-12">
            Connect with verified breeders and discover adorable, healthy puppies waiting for their forever homes.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center max-w-2xl mx-auto mb-12 md:mb-16">
            <Button 
              onClick={() => navigate('/auth')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold rounded-lg"
              size="lg"
            >
              👤 Sign Up
            </Button>
            <Button 
              onClick={() => navigate('/auth')}
              variant="outline"
              className="border-2 border-blue-600 text-blue-600 bg-white hover:bg-blue-50 px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold rounded-lg"
              size="lg"
            >
              🔐 Sign In
            </Button>
            <Button 
              onClick={handleBrowseAsGuest}
              variant="outline"
              className="border-2 border-blue-600 text-blue-600 bg-white hover:bg-blue-50 px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold rounded-lg"
              size="lg"
            >
              👁️ Browse as Guest
            </Button>
            <Button 
              onClick={handleExplore}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold rounded-lg"
              size="lg"
            >
              🔍 Explore Puppies
            </Button>
          </div>

          {/* Trust Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-3xl mx-auto">
            <div className="text-center p-4 md:p-6 bg-white rounded-lg">
              <CheckCircle className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 md:mb-4 text-blue-600" />
              <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-2">✅ Verified Breeders</h3>
              <p className="text-sm md:text-base text-slate-600">All breeders are thoroughly vetted and verified for quality and ethics</p>
            </div>
            <div className="text-center p-4 md:p-6 bg-white rounded-lg">
              <Heart className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 md:mb-4 text-blue-600" />
              <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-2">❤️ Health Guaranteed</h3>
              <p className="text-sm md:text-base text-slate-600">Every puppy comes with comprehensive health guarantees and records</p>
            </div>
            <div className="text-center p-4 md:p-6 bg-white rounded-lg">
              <Star className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 md:mb-4 text-blue-600" />
              <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-2">⭐ 5-Star Support</h3>
              <p className="text-sm md:text-base text-slate-600">Expert guidance and support throughout your puppy journey</p>
            </div>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="bg-blue-50 rounded-lg p-6 md:p-8 text-center max-w-4xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 md:mb-4">Join Thousands of Happy Families</h2>
          <p className="text-slate-600 mb-4 md:mb-6">
            Over 50,000 families have found their perfect puppy companion through our platform
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center">
            <div>
              <div className="text-2xl md:text-3xl font-bold mb-1 md:mb-2 text-blue-600">50K+</div>
              <div className="text-sm md:text-base text-slate-600">Happy Families</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold mb-1 md:mb-2 text-blue-600">1K+</div>
              <div className="text-sm md:text-base text-slate-600">Verified Breeders</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold mb-1 md:mb-2 text-blue-600">200+</div>
              <div className="text-sm md:text-base text-slate-600">Breeds Available</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold mb-1 md:mb-2 text-blue-600">99%</div>
              <div className="text-sm md:text-base text-slate-600">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
