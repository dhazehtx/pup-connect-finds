
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, Heart, MapPin, Star } from 'lucide-react';

const SearchInput = ({ placeholder }: { placeholder: string }) => (
  <div className="relative mb-6">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
    <Input 
      placeholder={placeholder}
      className="pl-10 h-12 text-lg border-2 border-gray-200 focus:border-blue-500"
    />
  </div>
);

const BreedFilterTabs = () => {
  const breeds = ['All Breeds', 'Golden Retriever', 'Labrador', 'German Shepherd', 'Bulldog', 'Poodle', 'Beagle'];
  const [activeBreed, setActiveBreed] = useState('All Breeds');

  return (
    <div className="flex overflow-x-auto pb-4 mb-6 space-x-2">
      {breeds.map((breed) => (
        <Badge
          key={breed}
          variant={activeBreed === breed ? "default" : "outline"}
          className="whitespace-nowrap cursor-pointer px-4 py-2 text-sm font-medium"
          onClick={() => setActiveBreed(breed)}
        >
          {breed}
        </Badge>
      ))}
    </div>
  );
};

const PuppyGrid = ({ data }: { data: any[] }) => {
  const puppyResults = [
    {
      id: 1,
      name: "Golden Retriever Puppy",
      breed: "Golden Retriever",
      age: "8 weeks",
      price: "$1,200",
      location: "San Francisco, CA",
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400",
      breeder: "Golden Dreams Kennel"
    },
    {
      id: 2,
      name: "Labrador Puppy",
      breed: "Labrador Retriever",
      age: "10 weeks",
      price: "$1,000",
      location: "Los Angeles, CA",
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400",
      breeder: "Happy Tails Breeding"
    },
    {
      id: 3,
      name: "German Shepherd Puppy",
      breed: "German Shepherd",
      age: "12 weeks",
      price: "$1,500",
      location: "New York, NY",
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400",
      breeder: "Elite Shepherd Kennels"
    },
    {
      id: 4,
      name: "French Bulldog Puppy",
      breed: "French Bulldog",
      age: "9 weeks",
      price: "$2,000",
      location: "Miami, FL",
      rating: 4.6,
      image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400",
      breeder: "Frenchie Paradise"
    },
    {
      id: 5,
      name: "Poodle Puppy",
      breed: "Standard Poodle",
      age: "11 weeks",
      price: "$1,300",
      location: "Seattle, WA",
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1616190264687-b7ebf7698bb2?w=400",
      breeder: "Poodle Paradise"
    },
    {
      id: 6,
      name: "Beagle Puppy",
      breed: "Beagle",
      age: "7 weeks",
      price: "$800",
      location: "Austin, TX",
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400",
      breeder: "Beagle Bay Kennels"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {puppyResults.map((puppy) => (
        <Card key={puppy.id} className="hover:shadow-lg transition-shadow cursor-pointer">
          <div className="relative">
            <img 
              src={puppy.image} 
              alt={puppy.name}
              className="w-full h-48 object-cover rounded-t-lg"
            />
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-2 right-2 bg-white/80 hover:bg-white"
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg">{puppy.name}</h3>
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
  );
};

const Explore = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Auth guard - redirect unauthenticated users
  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Puppies</h1>
          <p className="text-gray-600">Find your perfect puppy companion from verified breeders</p>
        </div>
        
        <SearchInput placeholder="Search puppies, breeds, or breeders..." />
        <BreedFilterTabs />
        <PuppyGrid data={[]} />
      </div>
    </div>
  );
};

export default Explore;
