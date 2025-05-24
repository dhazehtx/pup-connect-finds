
import React, { useState } from 'react';
import { Search, Filter, Star, MapPin, Heart, MessageCircle, Phone, Mail, Shield, Camera, Video } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

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
      adoptionFee: false,
      location: "San Francisco, CA",
      distance: "2.3 miles",
      breed: "French Bulldog",
      color: "Blue Fawn",
      gender: "Male",
      age: "8 weeks",
      genetics: ["bb", "DD", "COCO", "AtAt"],
      rating: 4.9,
      reviews: 23,
      images: [
        "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&h=400&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=600&h=400&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=400&fit=crop&crop=center"
      ],
      videos: ["video1.mp4"],
      breeder: {
        name: "Elite French Bulldogs",
        profilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
        phone: "(555) 123-4567",
        email: "contact@elitefrenchies.com"
      },
      verified: true,
      available: 3,
      vaccinations: {
        status: "Up to date",
        details: ["DHPP", "Rabies", "Bordetella"]
      },
      healthHistory: "Clean bill of health from vet",
      dnaTests: ["Genetic panel clear", "No hereditary diseases"],
      healthTests: ["Heart clear", "Eyes clear", "Hips good"]
    },
    {
      id: 2,
      title: "Golden Retriever Puppies Ready Now",
      price: "$2,800",
      adoptionFee: false,
      location: "Oakland, CA",
      distance: "5.7 miles",
      breed: "Golden Retriever",
      color: "Golden",
      gender: "Female",
      age: "10 weeks",
      genetics: [],
      rating: 4.8,
      reviews: 45,
      images: [
        "https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&h=400&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1551717743-49959800b1f6?w=600&h=400&fit=crop&crop=center"
      ],
      videos: [],
      breeder: {
        name: "Sunset Retrievers",
        profilePicture: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
        phone: "(555) 987-6543",
        email: "info@sunsetretrievers.com"
      },
      verified: true,
      available: 2,
      vaccinations: {
        status: "First shots done",
        details: ["DHPP (1st)", "Dewormed"]
      },
      healthHistory: "Regular vet checkups, healthy lineage",
      dnaTests: ["Embark DNA test completed"],
      healthTests: ["OFA hips pending", "Eyes clear"]
    },
    {
      id: 3,
      title: "German Shepherd Puppy - Champion Lines",
      price: "$3,500",
      adoptionFee: false,
      location: "San Jose, CA",
      distance: "8.1 miles",
      breed: "German Shepherd",
      color: "Black & Tan",
      gender: "Male",
      age: "12 weeks",
      genetics: [],
      rating: 4.9,
      reviews: 31,
      images: [
        "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=600&h=400&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=600&h=400&fit=crop&crop=center"
      ],
      videos: ["video2.mp4"],
      breeder: {
        name: "Metro German Shepherds",
        profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
        phone: "(555) 456-7890",
        email: "metro@germanshepherds.com"
      },
      verified: true,
      available: 1,
      vaccinations: {
        status: "Fully vaccinated",
        details: ["DHPP (2 shots)", "Rabies", "Bordetella", "Lyme"]
      },
      healthHistory: "Champion bloodline, excellent health records",
      dnaTests: ["Full genetic panel clear"],
      healthTests: ["Hips excellent", "Elbows normal", "DM clear"]
    },
    {
      id: 4,
      title: "Rescue Labrador - Needs Loving Home",
      price: "Adoption Fee: $150",
      adoptionFee: true,
      location: "Berkeley, CA",
      distance: "12.4 miles",
      breed: "Labrador",
      color: "Chocolate",
      gender: "Female",
      age: "2 years",
      genetics: [],
      rating: 4.7,
      reviews: 18,
      images: [
        "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=600&h=400&fit=crop&crop=center"
      ],
      videos: [],
      breeder: {
        name: "Happy Tails Rescue",
        profilePicture: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
        phone: "(555) 321-0987",
        email: "rescue@happytails.org"
      },
      verified: true,
      available: 1,
      vaccinations: {
        status: "Up to date",
        details: ["All core vaccines current", "Spayed"]
      },
      healthHistory: "Rescued at 6 months, fully rehabilitated",
      dnaTests: ["Mixed breed DNA test completed"],
      healthTests: ["General health check clear"]
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

      {/* Enhanced Listings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {listings.map((listing) => (
          <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
            <div className="relative">
              {/* Image Carousel */}
              <Carousel className="w-full">
                <CarouselContent>
                  {listing.images.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="relative h-72 overflow-hidden">
                        <img
                          src={image}
                          alt={`${listing.title} - Image ${index + 1}`}
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {listing.images.length > 1 && (
                  <>
                    <CarouselPrevious className="left-2" />
                    <CarouselNext className="right-2" />
                  </>
                )}
              </Carousel>

              {/* Overlays */}
              <button className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
                <Heart size={16} className="text-gray-600" />
              </button>
              
              {listing.verified && (
                <Badge className="absolute top-3 left-3 bg-blue-500 text-white">
                  <Shield size={12} className="mr-1" />
                  Verified
                </Badge>
              )}

              {/* Media indicators */}
              <div className="absolute bottom-3 left-3 flex gap-1">
                {listing.images.length > 1 && (
                  <Badge variant="secondary" className="text-xs">
                    <Camera size={10} className="mr-1" />
                    {listing.images.length}
                  </Badge>
                )}
                {listing.videos.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    <Video size={10} className="mr-1" />
                    {listing.videos.length}
                  </Badge>
                )}
              </div>
            </div>
            
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Title and Price */}
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-gray-900 text-lg flex-1 mr-2">{listing.title}</h3>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">{listing.price}</p>
                    {listing.adoptionFee && (
                      <Badge variant="outline" className="text-xs mt-1">Rescue</Badge>
                    )}
                  </div>
                </div>

                {/* Breeder Info */}
                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={listing.breeder.profilePicture} alt={listing.breeder.name} />
                    <AvatarFallback>{listing.breeder.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{listing.breeder.name}</p>
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-amber-500 fill-current" />
                      <span className="text-xs text-gray-600">{listing.rating} ({listing.reviews})</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Phone size={14} />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Mail size={14} />
                    </Button>
                  </div>
                </div>

                {/* Pet Details */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><strong>Breed:</strong> {listing.breed}</div>
                  <div><strong>Age:</strong> {listing.age}</div>
                  <div><strong>Gender:</strong> {listing.gender}</div>
                  <div><strong>Color:</strong> {listing.color}</div>
                </div>

                {/* Health Information */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Shield size={14} className="text-green-600" />
                    <span className="text-sm font-medium">Health Status</span>
                  </div>
                  <div className="ml-6 space-y-1 text-sm">
                    <div><strong>Vaccinations:</strong> {listing.vaccinations.status}</div>
                    <div className="text-xs text-gray-600">
                      {listing.vaccinations.details.join(", ")}
                    </div>
                    {listing.healthHistory && (
                      <div><strong>Health:</strong> {listing.healthHistory}</div>
                    )}
                    {listing.dnaTests.length > 0 && (
                      <div><strong>DNA Tests:</strong> {listing.dnaTests.join(", ")}</div>
                    )}
                    {listing.healthTests.length > 0 && (
                      <div><strong>Health Tests:</strong> {listing.healthTests.join(", ")}</div>
                    )}
                  </div>
                </div>

                {/* Genetics (for applicable breeds) */}
                {listing.genetics.length > 0 && (
                  <div>
                    <strong className="text-sm">Genetics:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {listing.genetics.map((genetic) => (
                        <Badge key={genetic} variant="outline" className="text-xs">
                          {genetic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Location */}
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <MapPin size={14} />
                  {listing.location} • {listing.distance}
                </div>

                {/* Contact Details */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-sm space-y-1">
                    <div className="flex items-center gap-2">
                      <Phone size={12} />
                      <span>{listing.breeder.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={12} />
                      <span className="text-blue-600">{listing.breeder.email}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button className="flex-1" size="sm">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageCircle size={16} />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Heart size={16} />
                  </Button>
                </div>

                {/* Availability */}
                <div className="text-center">
                  <Badge variant="secondary" className="text-xs">
                    {listing.available} available
                  </Badge>
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
