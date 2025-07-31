import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, Star, Eye, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Sample demo puppies for guest users
const demoPuppies = [
  {
    id: 'demo-1',
    name: "Golden Retriever Puppy",
    breed: "Golden Retriever",
    age: "8 weeks",
    price: "$1,200",
    location: "San Francisco, CA",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400",
    breeder: "Golden Dreams Kennel",
    verified: true
  },
  {
    id: 'demo-2',
    name: "Labrador Puppy",
    breed: "Labrador Retriever", 
    age: "10 weeks",
    price: "$1,000",
    location: "Los Angeles, CA",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400",
    breeder: "Happy Tails Breeding",
    verified: false
  },
  {
    id: 'demo-3',
    name: "German Shepherd Puppy",
    breed: "German Shepherd",
    age: "12 weeks", 
    price: "$1,500",
    location: "New York, NY",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400",
    breeder: "Elite Shepherd Kennels",
    verified: true
  },
  {
    id: 'demo-4',
    name: "French Bulldog Puppy",
    breed: "French Bulldog",
    age: "9 weeks",
    price: "$2,000", 
    location: "Miami, FL",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400",
    breeder: "Frenchie Paradise",
    verified: true
  },
  {
    id: 'demo-5', 
    name: "Poodle Puppy",
    breed: "Standard Poodle",
    age: "11 weeks",
    price: "$1,300",
    location: "Seattle, WA", 
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1616190264687-b7ebf7698bb2?w=400",
    breeder: "Poodle Paradise",
    verified: false
  },
  {
    id: 'demo-6',
    name: "Beagle Puppy", 
    breed: "Beagle",
    age: "7 weeks",
    price: "$800",
    location: "Austin, TX",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400",
    breeder: "Beagle Bay Kennels",
    verified: true
  }
];

const DemoExplore = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handlePuppyClick = (puppyId: string) => {
    // Redirect to greeting page for guests
    if (!user) {
      navigate('/greeting');
    } else {
      // For authenticated users (shouldn't reach here in demo mode)
      navigate(`/listing/${puppyId}`);
    }
  };

  return (
    <div className="px-4 py-6">
      {/* Demo Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <Eye className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Demo Preview</h2>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <Users className="w-3 h-3 mr-1" />
            Guest Mode
          </Badge>
        </div>
        <p className="text-gray-600 mb-4">
          You're viewing sample puppies available on MY PUP. Sign up to access our full marketplace with advanced filters and real-time listings.
        </p>
        <div className="flex gap-3">
          <Button 
            onClick={() => navigate('/auth')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Sign Up Free
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/auth')}
          >
            Sign In
          </Button>
        </div>
      </div>

      {/* Demo Puppies Grid */}
      <h1 className="text-2xl font-bold mb-4">Explore Puppies</h1>
      <p className="mb-6 text-gray-600">Discover adorable puppies from verified breeders</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {demoPuppies.map((puppy) => (
          <Card 
            key={puppy.id} 
            className="hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => handlePuppyClick(puppy.id)}
          >
            <div className="relative">
              <img 
                src={puppy.image} 
                alt={puppy.name}
                className="w-full h-48 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-200"
              />
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePuppyClick(puppy.id);
                }}
              >
                <Heart className="h-4 w-4" />
              </Button>
              {puppy.verified && (
                <Badge className="absolute top-2 left-2 bg-green-600 hover:bg-green-700">
                  ✓ Verified
                </Badge>
              )}
            </div>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
                  {puppy.name}
                </h3>
                <span className="text-lg font-bold text-blue-600">{puppy.price}</span>
              </div>
              <p className="text-gray-600 mb-2">{puppy.breed} • {puppy.age}</p>
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <MapPin className="h-4 w-4 mr-1" />
                {puppy.location}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span className="text-sm font-medium">{puppy.rating}</span>
                </div>
                <span className="text-sm text-gray-500">{puppy.breeder}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Call to Action */}
      <div className="mt-12 text-center bg-gray-50 rounded-lg p-8">
        <h3 className="text-xl font-semibold mb-3">Ready to Find Your Perfect Puppy?</h3>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Join MY PUP to access thousands of verified listings, advanced search filters, and direct messaging with breeders.
        </p>
        <div className="flex gap-4 justify-center">
          <Button 
            size="lg"
            onClick={() => navigate('/auth')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Get Started Free
          </Button>
          <Button 
            size="lg"
            variant="outline"
            onClick={() => navigate('/marketplace')}
          >
            View Marketplace
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DemoExplore;