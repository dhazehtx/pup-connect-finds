
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Search, Shield, Users, Star, ArrowRight, UserPlus, LogIn, Eye } from 'lucide-react';

const Home = () => {
  const { user, loading, continueAsGuest, isGuest } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'My Pup - Find Your Perfect Puppy Companion';
  }, []);

  useEffect(() => {
    // Redirect authenticated users or guests to home feed
    if (user || isGuest) {
      navigate('/home');
    }
  }, [user, isGuest, navigate]);

  const handleGuestAccess = () => {
    continueAsGuest();
    navigate('/home');
  };

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show landing page for unauthenticated users only
  const features = [
    {
      icon: Shield,
      title: 'Verified Breeders',
      description: 'All our breeders are thoroughly vetted and verified for your peace of mind.'
    },
    {
      icon: Search,
      title: 'Smart Search',
      description: 'Find the perfect puppy with our advanced search and filtering options.'
    },
    {
      icon: Heart,
      title: 'Safe Transactions',
      description: 'Secure payments and escrow protection for all transactions.'
    },
    {
      icon: Users,
      title: 'Community Support',
      description: 'Join our community of dog lovers and get expert advice.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      text: 'Found our perfect Golden Retriever through My Pup. The process was seamless!',
      rating: 5
    },
    {
      name: 'Mike Chen',
      text: 'Great platform with verified breeders. Highly recommend for finding your furry friend.',
      rating: 5
    },
    {
      name: 'Emily Davis',
      text: 'Excellent customer service and beautiful, healthy puppies. Thank you My Pup!',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-blue-100 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Find Your Perfect
            <span className="text-blue-600 block">Puppy Companion</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with verified breeders and discover adorable, healthy puppies 
            waiting for their forever homes.
          </p>
          
          {/* Authentication Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to="/auth">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-black px-8 py-4 text-lg font-semibold transition-all duration-200 hover:scale-105">
                <UserPlus className="w-5 h-5 mr-2" />
                Sign Up
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-black px-8 py-4 text-lg font-semibold transition-all duration-200 hover:scale-105">
                <LogIn className="w-5 h-5 mr-2" />
                Sign In
              </Button>
            </Link>
            <Button 
              size="lg" 
              onClick={handleGuestAccess}
              className="bg-blue-600 hover:bg-blue-700 text-black px-8 py-4 text-lg font-semibold transition-all duration-200 hover:scale-105"
            >
              <Eye className="w-5 h-5 mr-2" />
              Browse as Guest
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/explore">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold transition-all duration-200 hover:scale-105">
                <Search className="w-5 h-5 mr-2" />
                Explore Puppies
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4 text-green-600" />
              <span>Verified Breeders</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4 text-red-500" />
              <span>Health Guaranteed</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>5-Star Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose My Pup?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're committed to connecting loving families with healthy, happy puppies from trusted breeders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-blue-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Breeds Section */}
      <section className="py-16 md:py-24 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Popular Breeds
            </h2>
            <p className="text-xl text-gray-600">
              Browse our most sought-after puppy breeds
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {['Golden Retriever', 'Labrador', 'German Shepherd', 'French Bulldog', 'Poodle', 'Beagle'].map((breed) => (
              <Link key={breed} to="/explore">
                <Badge 
                  variant="outline" 
                  className="w-full p-3 text-center border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  {breed}
                </Badge>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/explore">
              <Button variant="outline" className="bg-blue-600 hover:bg-blue-700 text-black border-blue-600">
                View All Breeds
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Happy Families
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers say about their My Pup experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-blue-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">"{testimonial.text}"</p>
                  <p className="font-semibold text-gray-900">- {testimonial.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Find Your New Best Friend?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of happy families who found their perfect puppy companion through My Pup.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/explore">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-black px-8 py-4 text-lg font-semibold">
                Start Browsing
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-black px-8 py-4 text-lg font-semibold">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
