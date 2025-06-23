
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Search, MapPin, Star, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import AdBanner from '@/components/advertising/AdBanner';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscribed, subscription_tier } = useSubscription();
  
  const isPremium = subscribed && (subscription_tier === 'Pro' || subscription_tier === 'Enterprise');

  // Sample featured listings
  const featuredListings = [
    {
      id: '1',
      image: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=300&h=300&fit=crop',
      name: 'Golden Retriever',
      location: 'San Francisco, CA',
      price: '$1,200',
      age: '8 weeks',
      sponsored: true
    },
    {
      id: '2',
      image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=300&fit=crop',
      name: 'Beagle',
      location: 'Austin, TX',
      price: '$800',
      age: '10 weeks',
      sponsored: false
    },
    {
      id: '3',
      image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=300&fit=crop',
      name: 'Labrador',
      location: 'Denver, CO',
      price: '$950',
      age: '12 weeks',
      sponsored: true
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Your Perfect Pup
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Connect with trusted breeders and loving families
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Button 
                onClick={() => navigate('/explore')}
                className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-3"
                size="lg"
              >
                <Search className="w-5 h-5 mr-2" />
                Find Puppies
              </Button>
              {!isPremium && (
                <Button 
                  onClick={() => navigate('/monetization')}
                  className="bg-yellow-400 text-gray-900 hover:bg-yellow-300 font-semibold px-8 py-3"
                  size="lg"
                >
                  <Crown className="w-5 h-5 mr-2" />
                  Go Premium
                </Button>
              )}
            </div>
            {!user && (
              <p className="mt-4 text-white/80">
                <Button variant="link" className="text-white underline" onClick={() => navigate('/auth')}>
                  Sign up
                </Button> 
                to save favorites and contact breeders
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Premium Member Welcome */}
        {isPremium && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-center mb-4">
              <Crown className="w-6 h-6 text-yellow-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">Welcome Back, Premium Member!</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4">
                <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <h3 className="font-medium">Early Access</h3>
                <p className="text-sm text-gray-600">See new puppies first</p>
              </div>
              <div className="p-4">
                <Heart className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <p className="font-medium">Smart Matching</p>
                <p className="text-sm text-gray-600">Personalized recommendations</p>
              </div>
              <div className="p-4">
                <Crown className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <h3 className="font-medium">Verified Badge</h3>
                <p className="text-sm text-gray-600">Premium member status</p>
              </div>
            </div>
          </div>
        )}

        {/* Ad Banner */}
        <AdBanner targetPage="home" format="banner" className="mb-8" />

        {/* Featured Puppies */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Featured Puppies</h2>
            <Button variant="outline" onClick={() => navigate('/explore')}>
              View All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredListings.map((listing, index) => (
              <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img 
                    src={listing.image} 
                    alt={listing.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  {listing.sponsored && (
                    <Badge className="absolute top-3 left-3 bg-orange-500 text-white border-0">
                      Sponsored
                    </Badge>
                  )}
                  {/* Insert sponsored ad after every 2 listings */}
                  {index === 1 && (
                    <div className="absolute inset-0 bg-gradient-to-t from-orange-500/20 to-transparent rounded-t-lg"></div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{listing.name}</h3>
                    <div className="text-lg font-bold text-blue-600">{listing.price}</div>
                  </div>
                  <div className="flex items-center text-gray-600 text-sm mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    {listing.location}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{listing.age} old</span>
                    <Button size="sm" onClick={() => navigate('/explore')}>
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Services Preview */}
        <section className="mb-12">
          <div className="bg-blue-50 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Pet Services Marketplace</h2>
            <p className="text-gray-600 mb-6">Find trusted groomers, walkers, and trainers in your area</p>
            <Button onClick={() => navigate('/marketplace')} className="bg-blue-600 hover:bg-blue-700">
              Explore Services
            </Button>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">50K+</div>
            <div className="text-gray-600">Happy Families</div>
          </div>
          <div className="p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">1K+</div>
            <div className="text-gray-600">Verified Breeders</div>
          </div>
          <div className="p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">200+</div>
            <div className="text-gray-600">Breeds Available</div>
          </div>
          <div className="p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">5K+</div>
            <div className="text-gray-600">Service Providers</div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;
