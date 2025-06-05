
import React, { useState } from 'react';
import { Search, Filter, Heart, MapPin, Star, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const BrowsePuppies = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBreed, setSelectedBreed] = useState('');
  const [priceRange, setPriceRange] = useState('');

  const featuredPuppies = [
    {
      id: 1,
      name: 'Max',
      breed: 'Golden Retriever',
      age: '8 weeks',
      price: 1200,
      location: 'Austin, TX',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=300&fit=crop',
      seller: 'Happy Tails Breeding',
      verified: true
    },
    {
      id: 2,
      name: 'Luna',
      breed: 'Labrador Mix',
      age: '10 weeks',
      price: 800,
      location: 'Denver, CO',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=300&fit=crop',
      seller: 'Mountain View Puppies',
      verified: true
    },
    {
      id: 3,
      name: 'Charlie',
      breed: 'German Shepherd',
      age: '12 weeks',
      price: 1500,
      location: 'Phoenix, AZ',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=300&h=300&fit=crop',
      seller: 'Desert Paws Kennel',
      verified: false
    },
    {
      id: 4,
      name: 'Bella',
      breed: 'French Bulldog',
      age: '9 weeks',
      price: 2200,
      location: 'Miami, FL',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=300&fit=crop',
      seller: 'Sunshine Bulldogs',
      verified: true
    }
  ];

  const breeds = ['Golden Retriever', 'Labrador', 'German Shepherd', 'French Bulldog', 'Poodle', 'Bulldog'];

  return (
    <div className="min-h-screen bg-cloud-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-royal-blue to-deep-navy text-cloud-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Browse Puppies</h1>
          <p className="text-xl opacity-90">Find your perfect companion from trusted breeders</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-soft-sky p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-deep-navy/60" size={20} />
              <Input
                placeholder="Search by name or breed..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedBreed} onValueChange={setSelectedBreed}>
              <SelectTrigger>
                <SelectValue placeholder="Select breed" />
              </SelectTrigger>
              <SelectContent>
                {breeds.map(breed => (
                  <SelectItem key={breed} value={breed}>{breed}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger>
                <SelectValue placeholder="Price range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-500">$0 - $500</SelectItem>
                <SelectItem value="500-1000">$500 - $1,000</SelectItem>
                <SelectItem value="1000-2000">$1,000 - $2,000</SelectItem>
                <SelectItem value="2000+">$2,000+</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-royal-blue hover:bg-deep-navy">
              <Filter size={16} className="mr-2" />
              Apply Filters
            </Button>
          </div>
        </div>

        {/* Featured Puppies */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-deep-navy mb-6">Featured Puppies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredPuppies.map(puppy => (
              <Card key={puppy.id} className="border-soft-sky hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img 
                    src={puppy.image} 
                    alt={puppy.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                  >
                    <Heart size={16} />
                  </Button>
                  {puppy.verified && (
                    <Badge className="absolute top-2 left-2 bg-green-500">
                      Verified
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-deep-navy">{puppy.name}</h3>
                    <span className="font-bold text-royal-blue">${puppy.price}</span>
                  </div>
                  <p className="text-sm text-deep-navy/70 mb-2">{puppy.breed} • {puppy.age}</p>
                  <div className="flex items-center text-sm text-deep-navy/60 mb-2">
                    <MapPin size={14} className="mr-1" />
                    {puppy.location}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star size={14} className="text-yellow-500 mr-1" />
                      <span className="text-sm">{puppy.rating}</span>
                    </div>
                    <Button size="sm" className="bg-royal-blue hover:bg-deep-navy">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-soft-sky">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-royal-blue mb-2">2,847</div>
              <p className="text-deep-navy/70">Available Puppies</p>
            </CardContent>
          </Card>
          <Card className="border-soft-sky">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-royal-blue mb-2">1,203</div>
              <p className="text-deep-navy/70">Verified Breeders</p>
            </CardContent>
          </Card>
          <Card className="border-soft-sky">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-royal-blue mb-2">95%</div>
              <p className="text-deep-navy/70">Happy Families</p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-soft-sky/30 to-royal-blue/10 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-deep-navy mb-4">Can't Find Your Perfect Match?</h3>
          <p className="text-deep-navy/70 mb-6">Set up a saved search and we'll notify you when new puppies matching your criteria become available.</p>
          <Button className="bg-royal-blue hover:bg-deep-navy">
            <Calendar size={16} className="mr-2" />
            Create Saved Search
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BrowsePuppies;
