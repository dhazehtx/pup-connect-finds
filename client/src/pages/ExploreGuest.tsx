import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Heart, MapPin, Star } from 'lucide-react';
import FeaturedPosts from '@/components/FeaturedPosts';

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

const PuppyGrid = () => {
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
                <Star className="h-4 w-4 text-blue-400 mr-1" />
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

const ExploreGuest = () => {
  // Debug logging - throttled to avoid excessive re-renders

  useEffect(() => {
    console.log('[EXPLORE GUEST] Component mounted');
  }, []);

  return (
    <div className="px-4 py-6 pb-20">
      <h1 className="text-2xl font-bold mb-4">Explore Puppies</h1>
      <p className="mb-6">Find your perfect puppy companion from verified breeders</p>
      <SearchInput placeholder="Search puppies, breeds, or breeders..." />
      <BreedFilterTabs />
      <PuppyGrid />
      
      {/* Featured Posts Section */}
      <h2 className="text-xl font-semibold mt-10 mb-4">Featured Posts</h2>
      <FeaturedPosts />
    </div>
  );
};

export default ExploreGuest;