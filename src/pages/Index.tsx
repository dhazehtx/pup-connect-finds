
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8" style={{ color: '#2363FF' }} />
              <span className="text-xl font-bold text-gray-900">MY PUP</span>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={() => navigate('/auth')}
                className="border-2 rounded-lg font-medium transition-all duration-200"
                style={{ 
                  borderColor: '#2363FF', 
                  color: '#2363FF',
                  backgroundColor: 'white'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#E5EEFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                Sign In
              </Button>
              <Button 
                onClick={() => navigate('/auth')}
                className="rounded-lg font-medium transition-all duration-200"
                style={{ 
                  backgroundColor: '#2363FF', 
                  color: 'white',
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1E52D0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#2363FF';
                }}
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Find Your Perfect Puppy Companion
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12">
            Connect with verified breeders and discover adorable, healthy puppies waiting for their forever homes.
          </p>

          {/* CTA Buttons - All Royal Blue Themed */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto mb-16">
            <Button 
              onClick={() => navigate('/auth')}
              className="rounded-lg font-semibold px-8 py-4 text-lg transition-all duration-200"
              style={{ 
                backgroundColor: '#2363FF', 
                color: 'white',
                border: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1E52D0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#2363FF';
              }}
              size="lg"
            >
              👤 Sign Up
            </Button>
            <Button 
              onClick={() => navigate('/auth')}
              variant="outline"
              className="border-2 rounded-lg font-semibold px-8 py-4 text-lg transition-all duration-200"
              style={{ 
                borderColor: '#2363FF', 
                color: '#2363FF',
                backgroundColor: 'white'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#E5EEFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
              }}
              size="lg"
            >
              🔐 Sign In
            </Button>
            <Button 
              onClick={handleBrowseAsGuest}
              variant="outline"
              className="border-2 rounded-lg font-semibold px-8 py-4 text-lg transition-all duration-200"
              style={{ 
                borderColor: '#2363FF', 
                color: '#2363FF',
                backgroundColor: 'white'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#E5EEFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
              }}
              size="lg"
            >
              👁️ Browse as Guest
            </Button>
            <Button 
              onClick={handleExplore}
              className="rounded-lg font-semibold px-8 py-4 text-lg transition-all duration-200"
              style={{ 
                backgroundColor: '#2363FF', 
                color: 'white',
                border: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1E52D0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#2363FF';
              }}
              size="lg"
            >
              🔍 Explore Puppies
            </Button>
          </div>

          {/* Trust Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center p-6">
              <CheckCircle className="w-12 h-12 mx-auto mb-4" style={{ color: '#2363FF' }} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">✅ Verified Breeders</h3>
              <p className="text-gray-600">All breeders are thoroughly vetted and verified for quality and ethics</p>
            </div>
            <div className="text-center p-6">
              <Heart className="w-12 h-12 mx-auto mb-4" style={{ color: '#2363FF' }} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">❤️ Health Guaranteed</h3>
              <p className="text-gray-600">Every puppy comes with comprehensive health guarantees and records</p>
            </div>
            <div className="text-center p-6">
              <Star className="w-12 h-12 mx-auto mb-4" style={{ color: '#2363FF' }} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">⭐ 5-Star Support</h3>
              <p className="text-gray-600">Expert guidance and support throughout your puppy journey</p>
            </div>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="rounded-lg p-8 text-center max-w-4xl mx-auto" style={{ backgroundColor: '#E5EEFF' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Join Thousands of Happy Families</h2>
          <p className="text-gray-600 mb-6">
            Over 50,000 families have found their perfect puppy companion through our platform
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold mb-2" style={{ color: '#2363FF' }}>50K+</div>
              <div className="text-gray-600">Happy Families</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2" style={{ color: '#2363FF' }}>1K+</div>
              <div className="text-gray-600">Verified Breeders</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2" style={{ color: '#2363FF' }}>200+</div>
              <div className="text-gray-600">Breeds Available</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2" style={{ color: '#2363FF' }}>99%</div>
              <div className="text-gray-600">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
