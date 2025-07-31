import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, UserPlus, LogIn, Eye, Star, Shield, MessageCircle } from 'lucide-react';

const Greeting = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8" style={{ color: '#2363FF' }} />
              <span className="text-xl font-bold text-gray-900">MY PUP</span>
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/explore')}
              >
                Back to Browse
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/auth')}
              >
                Sign In
              </Button>
              <Button 
                onClick={() => navigate('/auth')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 mb-4">
              <Eye className="w-4 h-4 mr-1" />
              Demo Mode
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Ready to Find Your
            <span className="text-blue-600 block">Perfect Puppy?</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            You've been browsing our sample listings. Join MY PUP to access thousands of verified puppies, 
            advanced search filters, and connect directly with breeders.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="border-2 border-blue-200 hover:border-blue-300 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <UserPlus className="h-8 w-8 text-blue-600" />
                <h3 className="text-xl font-semibold">New to MY PUP?</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Create your free account to access our full marketplace with verified breeders and advanced search features.
              </p>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => navigate('/auth')}
              >
                Sign Up Free
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 hover:border-green-300 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <LogIn className="h-8 w-8 text-green-600" />
                <h3 className="text-xl font-semibold">Already Have an Account?</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Sign in to access your saved searches, favorite listings, and message conversations with breeders.
              </p>
              <Button 
                variant="outline"
                className="w-full border-green-600 text-green-600 hover:bg-green-50"
                onClick={() => navigate('/auth')}
              >
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <h2 className="text-2xl font-semibold text-center mb-8">Why Join MY PUP?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="font-semibold mb-2">Verified Breeders</h4>
              <p className="text-sm text-gray-600">All breeders go through our verification process for your safety and peace of mind.</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <MessageCircle className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="font-semibold mb-2">Direct Messaging</h4>
              <p className="text-sm text-gray-600">Chat directly with breeders, ask questions, and schedule visits securely.</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Star className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="font-semibold mb-2">Advanced Search</h4>
              <p className="text-sm text-gray-600">Filter by breed, location, price, health testing, and more to find your perfect match.</p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <p className="text-gray-600 mb-6">
            Join thousands of happy families who found their perfect puppy on MY PUP
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => navigate('/auth')}
              className="bg-blue-600 hover:bg-blue-700 px-8"
            >
              Get Started Free
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate('/explore')}
              className="px-8"
            >
              Continue Browsing
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Greeting;