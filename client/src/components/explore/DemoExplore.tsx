import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Heart, MapPin, Star, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Demo puppies matching the specification
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
  }
];

// Static breed pills for demo
const staticBreeds = ['Golden Retriever', 'Labrador', 'German Shepherd', 'Bulldog', 'Poodle', 'Beagle'];

const DemoExplore = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handlePuppyClick = (puppyId: string) => {
    // Always redirect to greeting for guests (as per requirement)
    if (!user) {
      navigate('/greeting');
    } else {
      // For authenticated users (shouldn't reach here in demo mode)
      navigate(`/listing/${puppyId}`);
    }
  };

  return (
    <div className="px-4 py-6">
      {/* Search bar clone (static, no query) */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input 
          placeholder="Search puppies, breeds, or breeders..."
          className="pl-10 h-12 text-lg border-2 border-gray-200 focus:border-blue-500"
          readOnly
        />
      </div>

      {/* Horizontal static breed pills */}
      <div className="flex overflow-x-auto pb-4 mb-6 space-x-2">
        {staticBreeds.map((breed) => (
          <Badge
            key={breed}
            variant="outline"
            className="whitespace-nowrap cursor-pointer px-4 py-2 text-sm font-medium hover:bg-blue-50"
          >
            {breed}
          </Badge>
        ))}
      </div>

      {/* Grid with two demo cards as specified */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
    </div>
  );
};

export default DemoExplore;