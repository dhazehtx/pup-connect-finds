
import React, { useState } from 'react';
import { Search, Filter, Star, MapPin, Heart, MessageCircle, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const Explore = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const listings = [
    {
      id: 1,
      title: "Beautiful French Bulldog Puppies",
      price: "$4,200",
      location: "San Francisco, CA",
      distance: "2.3 miles",
      breed: "French Bulldog",
      color: "Blue Fawn",
      gender: "Male",
      age: "8 weeks",
      rating: 4.9,
      reviews: 23,
      image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop",
      breeder: "Elite French Bulldogs",
      verified: true,
      verifiedBreeder: true,
      idVerified: true,
      vetVerified: true,
      available: 3
    },
    {
      id: 2,
      title: "Golden Retriever Puppies Ready Now",
      price: "$2,800",
      location: "Oakland, CA",
      distance: "5.7 miles",
      breed: "Golden Retriever",
      color: "Golden",
      gender: "Female",
      age: "10 weeks",
      rating: 4.8,
      reviews: 45,
      image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop",
      breeder: "Sunset Retrievers",
      verified: true,
      verifiedBreeder: true,
      idVerified: true,
      vetVerified: false,
      available: 2
    },
    {
      id: 3,
      title: "German Shepherd Puppy - Champion Lines",
      price: "$3,500",
      location: "San Jose, CA",
      distance: "8.1 miles",
      breed: "German Shepherd",
      color: "Black & Tan",
      gender: "Male",
      age: "12 weeks",
      rating: 4.9,
      reviews: 31,
      image: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400&h=300&fit=crop",
      breeder: "Metro German Shepherds",
      verified: true,
      available: 1
    },
    {
      id: 4,
      title: "Labrador Retriever Puppies",
      price: "$2,400",
      location: "Berkeley, CA",
      distance: "12.4 miles",
      breed: "Labrador",
      color: "Chocolate",
      gender: "Female",
      age: "9 weeks",
      rating: 4.7,
      reviews: 18,
      image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=300&fit=crop",
      breeder: "Happy Tails Labradors",
      verified: true,
      available: 4
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Marketplace</h1>
        <p className="text-gray-600">Find your perfect puppy companion</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg border p-4 mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Search for puppies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-white hover:bg-soft-sky"
          >
            <Filter size={18} />
            Filters
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{listings.length} puppies available</h2>
        <Select defaultValue="newest">
          <SelectTrigger className="w-48 bg-white">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="distance">Distance</SelectItem>
            <SelectItem value="rating">Highest rated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Listings Grid - 2x2 layout */}
      <div className="grid grid-cols-2 gap-6 max-w-4xl mx-auto">
        {listings.map((listing) => (
          <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer bg-white">
            <div className="relative">
              <img
                src={listing.image}
                alt={listing.title}
                className="w-full h-48 object-cover"
              />
              <button className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
                <Heart size={16} className="text-gray-600" />
              </button>
              <div className="absolute top-3 left-3 flex flex-col gap-1">
                {listing.verified && (
                  <Badge className="bg-blue-500 text-white text-xs">
                    Verified
                  </Badge>
                )}
                {listing.verifiedBreeder && (
                  <Badge className="bg-green-500 text-white text-xs flex items-center gap-1">
                    <Award size={10} />
                    Breeder
                  </Badge>
                )}
              </div>
            </div>
            
            <CardContent className="p-4 bg-white">
              <div className="space-y-2">
                <div className="bg-white p-3 rounded-lg border border-gray-100">
                  <h3 className="font-semibold text-gray-900 line-clamp-2">{listing.title}</h3>
                </div>
                <p className="text-xl font-bold text-gray-900">{listing.price}</p>
                
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    {listing.location} • {listing.distance}
                  </div>
                  <div>Breed: {listing.breed}</div>
                  <div>Color: {listing.color} • Gender: {listing.gender}</div>
                  <div>Age: {listing.age}</div>
                </div>

                {/* Verification Badges */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {listing.idVerified && (
                    <Badge variant="outline" className="text-xs">ID Verified</Badge>
                  )}
                  {listing.vetVerified && (
                    <Badge variant="outline" className="text-xs">Vet Licensed</Badge>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-royal-blue fill-current" />
                    <span className="text-sm text-gray-600">{listing.rating} ({listing.reviews})</span>
                  </div>
                  <span className="text-sm text-gray-600">{listing.available} available</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button className="flex-1" size="sm">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageCircle size={16} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Explore;
