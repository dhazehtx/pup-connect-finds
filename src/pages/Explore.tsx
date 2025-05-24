
import React, { useState } from 'react';
import { Search, Filter, Star, MapPin, Heart, MessageCircle, Phone, Mail, Camera, Video, Shield, Award } from 'lucide-react';
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
        "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=300&fit=crop"
      ],
      videos: ["video1.mp4"],
      breeder: {
        name: "Elite French Bulldogs",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
        verified: true,
        rating: 4.9,
        phone: "(555) 123-4567",
        email: "contact@elitefrenchies.com"
      },
      health: {
        vaccinated: true,
        dewormed: true,
        microchipped: true,
        vetChecked: true,
        dnaTests: ["Brachycephalic Airway", "Hip Dysplasia", "Eye Conditions"],
        healthTests: ["Heart Clearance", "Eye Clearance", "Genetic Panel"]
      },
      available: 3,
      isRescue: false
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
      genetics: [],
      rating: 4.8,
      reviews: 45,
      images: [
        "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400&h=300&fit=crop"
      ],
      videos: [],
      breeder: {
        name: "Sunset Retrievers",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b789?w=100&h=100&fit=crop",
        verified: true,
        rating: 4.8,
        phone: "(555) 234-5678",
        email: "info@sunsetretrievers.com"
      },
      health: {
        vaccinated: true,
        dewormed: true,
        microchipped: false,
        vetChecked: true,
        dnaTests: ["Hip Dysplasia", "Elbow Dysplasia", "Progressive Retinal Atrophy"],
        healthTests: ["OFA Hip", "OFA Elbow", "Eye Clearance"]
      },
      available: 2,
      isRescue: false
    },
    {
      id: 3,
      title: "Rescue Labrador Mix - Needs Loving Home",
      price: "Adoption Fee: $350",
      location: "San Jose, CA",
      distance: "8.1 miles",
      breed: "Labrador Mix",
      color: "Black & Tan",
      gender: "Male",
      age: "2 years",
      genetics: [],
      rating: 4.9,
      reviews: 31,
      images: [
        "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400&h=300&fit=crop"
      ],
      videos: [],
      breeder: {
        name: "Bay Area Dog Rescue",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
        verified: true,
        rating: 4.9,
        phone: "(555) 345-6789",
        email: "adopt@bayarearescue.org"
      },
      health: {
        vaccinated: true,
        dewormed: true,
        microchipped: true,
        vetChecked: true,
        dnaTests: ["Breed Mix Analysis"],
        healthTests: ["Full Health Exam", "Behavioral Assessment"]
      },
      available: 1,
      isRescue: true
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
                    {['French Bulldog', 'Golden Retriever', 'German Shepherd', 'Labrador', 'Poodle', 'Bulldog', 'Beagle', 'Rottweiler', 'Siberian Husky', 'Dachshund'].map((breed) => (
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
                    {['Black', 'White', 'Brown', 'Golden', 'Cream', 'Blue', 'Fawn', 'Brindle', 'Merle', 'Chocolate'].map((color) => (
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
                    {['8-12 weeks', '3-6 months', '6-12 months', '1-2 years', '2+ years'].map((age) => (
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
                  {['BB (Non-dilute)', 'Bb (Carrier dilute)', 'bb (Dilute blue)', 'DD (Non-dilute)', 'Dd (Carrier dilute)', 'dd (Dilute)', 'COCO (Cream/White)', 'COco (Cream carrier)', 'coco (Normal)', 'AtAt (Tan points)', 'Ata (Tan carrier)', 'aa (Recessive black)', 'EmEm (Dark mask)', 'Eme (Mask carrier)', 'ee (Red/Yellow)', 'NN (Normal)', 'Nn (Carrier)', 'nn (Recessive trait)'].map((genetic) => (
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

      {/* Listings Grid - 2x2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {listings.map((listing) => (
          <Card key={listing.id} className="overflow-hidden hover:shadow-xl transition-all duration-300">
            {/* Image Carousel */}
            <div className="relative">
              <Carousel className="w-full">
                <CarouselContent>
                  {listing.images.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="relative h-64">
                        <img
                          src={image}
                          alt={`${listing.title} - Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {index === 0 && listing.videos.length > 0 && (
                          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                            <Video size={12} />
                            Video Available
                          </div>
                        )}
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
              
              <button className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
                <Heart size={16} className="text-gray-600" />
              </button>
              
              {listing.isRescue && (
                <Badge className="absolute top-3 left-3 bg-green-500 text-white">
                  Rescue
                </Badge>
              )}
              
              {listing.breeder.verified && !listing.isRescue && (
                <Badge className="absolute top-3 left-3 bg-blue-500 text-white">
                  Verified Breeder
                </Badge>
              )}
            </div>
            
            <CardContent className="p-6">
              {/* Title and Price */}
              <div className="space-y-3">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-1">{listing.title}</h3>
                  <p className="text-2xl font-bold text-blue-600">{listing.price}</p>
                </div>

                {/* Pet Details Grid */}
                <div className="grid grid-cols-2 gap-3 py-3 border-y">
                  <div className="space-y-1">
                    <span className="text-sm text-gray-500">Breed</span>
                    <p className="text-sm font-medium">{listing.breed}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm text-gray-500">Age</span>
                    <p className="text-sm font-medium">{listing.age}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm text-gray-500">Gender</span>
                    <p className="text-sm font-medium">{listing.gender}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm text-gray-500">Color</span>
                    <p className="text-sm font-medium">{listing.color}</p>
                  </div>
                </div>

                {/* Health Information */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-1">
                    <Shield size={16} className="text-green-500" />
                    Health Status
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {listing.health.vaccinated && <Badge variant="secondary" className="text-xs">Vaccinated</Badge>}
                    {listing.health.dewormed && <Badge variant="secondary" className="text-xs">Dewormed</Badge>}
                    {listing.health.microchipped && <Badge variant="secondary" className="text-xs">Microchipped</Badge>}
                    {listing.health.vetChecked && <Badge variant="secondary" className="text-xs">Vet Checked</Badge>}
                  </div>
                  
                  {listing.health.dnaTests.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-600 mb-1">DNA Tests:</p>
                      <div className="flex flex-wrap gap-1">
                        {listing.health.dnaTests.map((test, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {test}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {listing.health.healthTests.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-600 mb-1">Health Tests:</p>
                      <div className="flex flex-wrap gap-1">
                        {listing.health.healthTests.map((test, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {test}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Breeder Information */}
                <div className="space-y-3 pt-3 border-t">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={listing.breeder.avatar} alt={listing.breeder.name} />
                      <AvatarFallback>{listing.breeder.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm">{listing.breeder.name}</h4>
                        {listing.breeder.verified && (
                          <Award size={14} className="text-blue-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star size={12} className="text-amber-500 fill-current" />
                        <span className="text-xs text-gray-600">{listing.breeder.rating} ({listing.reviews} reviews)</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Contact Information */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 text-xs">
                      <Phone size={14} />
                      {listing.breeder.phone}
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-xs">
                      <Mail size={14} />
                      Email
                    </Button>
                  </div>
                </div>

                {/* Location and Actions */}
                <div className="space-y-3 pt-3 border-t">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin size={14} />
                    {listing.location} • {listing.distance}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button className="flex-1" size="sm">
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageCircle size={16} />
                    </Button>
                  </div>
                  
                  <p className="text-xs text-gray-500 text-center">{listing.available} available</p>
                </div>

                {/* Genetics for French Bulldogs */}
                {listing.genetics.length > 0 && (
                  <div className="pt-3 border-t">
                    <p className="text-xs text-gray-600 mb-2">Genetics:</p>
                    <div className="flex flex-wrap gap-1">
                      {listing.genetics.map((genetic, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {genetic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Explore;
