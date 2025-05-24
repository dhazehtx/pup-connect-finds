
import React, { useState } from 'react';
import { Search, Filter, Star, MapPin, Heart, MessageCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const Explore = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBreed, setSelectedBreed] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedAge, setSelectedAge] = useState('');
  const [selectedGenetics, setSelectedGenetics] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [showFilters, setShowFilters] = useState(false);

  const breeds = [
    'French Bulldog', 'Golden Retriever', 'German Shepherd', 'Labrador', 
    'Poodle', 'Bulldog', 'Beagle', 'Rottweiler', 'Siberian Husky', 'Dachshund'
  ];

  const colors = [
    'Black', 'White', 'Brown', 'Golden', 'Cream', 'Blue', 'Fawn', 'Brindle', 'Merle', 'Chocolate'
  ];

  const ages = [
    '8-12 weeks', '3-6 months', '6-12 months', '1-2 years', '2+ years'
  ];

  const frenchBulldogGenetics = [
    'BB (Non-dilute)', 'Bb (Carrier dilute)', 'bb (Dilute blue)', 
    'DD (Non-dilute)', 'Dd (Carrier dilute)', 'dd (Dilute)',
    'COCO (Cream/White)', 'COco (Cream carrier)', 'coco (Normal)',
    'AtAt (Tan points)', 'Ata (Tan carrier)', 'aa (Recessive black)',
    'EmEm (Dark mask)', 'Eme (Mask carrier)', 'ee (Red/Yellow)',
    'NN (Normal)', 'Nn (Carrier)', 'nn (Recessive trait)'
  ];

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
      genetics: ["bb", "DD", "COCO", "AtAt"], // French Bulldogs often have genetics
      rating: 4.9,
      reviews: 23,
      image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop",
      breeder: "Elite French Bulldogs",
      verified: true,
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
      genetics: [], // No genetics testing done
      rating: 4.8,
      reviews: 45,
      image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop",
      breeder: "Sunset Retrievers",
      verified: true,
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
      genetics: [], // No genetics testing done
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
      genetics: [], // No genetics testing done
      rating: 4.7,
      reviews: 18,
      image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=300&fit=crop",
      breeder: "Happy Tails Labradors",
      verified: true,
      available: 4
    }
  ];

  const handleGeneticsChange = (genetic: string, checked: boolean) => {
    if (checked) {
      setSelectedGenetics([...selectedGenetics, genetic]);
    } else {
      setSelectedGenetics(selectedGenetics.filter(g => g !== genetic));
    }
  };

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
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter size={18} />
            Filters
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="border-t pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Breed</label>
                <Select value={selectedBreed} onValueChange={setSelectedBreed}>
                  <SelectTrigger>
                    <SelectValue placeholder="All breeds" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {breeds.map((breed) => (
                      <SelectItem key={breed} value={breed}>{breed}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <Select value={selectedColor} onValueChange={setSelectedColor}>
                  <SelectTrigger>
                    <SelectValue placeholder="All colors" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {colors.map((color) => (
                      <SelectItem key={color} value={color}>{color}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <Select value={selectedGender} onValueChange={setSelectedGender}>
                  <SelectTrigger>
                    <SelectValue placeholder="All genders" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                <Select value={selectedAge} onValueChange={setSelectedAge}>
                  <SelectTrigger>
                    <SelectValue placeholder="All ages" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {ages.map((age) => (
                      <SelectItem key={age} value={age}>{age}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                  />
                  <Input
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Genetics Filter for French Bulldogs */}
            {selectedBreed === 'French Bulldog' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Genetics</label>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {frenchBulldogGenetics.map((genetic) => (
                    <div key={genetic} className="flex items-center space-x-2">
                      <Checkbox
                        id={genetic}
                        checked={selectedGenetics.includes(genetic)}
                        onCheckedChange={(checked) => handleGeneticsChange(genetic, checked as boolean)}
                      />
                      <label htmlFor={genetic} className="text-sm text-gray-700 cursor-pointer">
                        {genetic}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{listings.length} puppies available</h2>
        <Select defaultValue="newest">
          <SelectTrigger className="w-48">
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

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {listings.map((listing) => (
          <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
            <div className="relative">
              <img
                src={listing.image}
                alt={listing.title}
                className="w-full h-48 object-cover"
              />
              <button className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
                <Heart size={16} className="text-gray-600" />
              </button>
              {listing.verified && (
                <div className="absolute top-3 left-3 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                  Verified
                </div>
              )}
            </div>
            
            <CardContent className="p-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 line-clamp-2">{listing.title}</h3>
                <p className="text-xl font-bold text-gray-900">{listing.price}</p>
                
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    {listing.location} • {listing.distance}
                  </div>
                  <div>Breed: {listing.breed}</div>
                  <div>Color: {listing.color} • Gender: {listing.gender}</div>
                  <div>Age: {listing.age}</div>
                  {listing.genetics && listing.genetics.length > 0 && (
                    <div>Genetics: {listing.genetics.join(', ')}</div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-amber-500 fill-current" />
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
