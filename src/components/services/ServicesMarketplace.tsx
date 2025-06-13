
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Star, 
  Clock, 
  DollarSign, 
  Search,
  Filter,
  Heart,
  Calendar
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Service {
  id: string;
  title: string;
  description: string;
  service_type: string;
  price: number;
  price_type: string;
  location: string;
  experience_years: number;
  rating: number;
  total_reviews: number;
  images: string[];
  provider: {
    name: string;
    avatar_url?: string;
    professional_status: string;
  };
}

const ServicesMarketplace = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceType, setServiceType] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [location, setLocation] = useState('');

  // Mock data - will be replaced with real API calls
  const services: Service[] = [
    {
      id: '1',
      title: 'Professional Dog Grooming',
      description: 'Full service grooming including bath, cut, nail trim, and ear cleaning.',
      service_type: 'grooming',
      price: 75,
      price_type: 'per_service',
      location: 'San Francisco, CA',
      experience_years: 8,
      rating: 4.9,
      total_reviews: 156,
      images: ['https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=300'],
      provider: {
        name: 'Sarah Johnson',
        avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b39d0e2f?w=100',
        professional_status: 'verified_professional'
      }
    },
    {
      id: '2',
      title: 'Dog Walking & Exercise',
      description: 'Daily walks and exercise sessions for your furry friend.',
      service_type: 'walking',
      price: 25,
      price_type: 'hourly',
      location: 'Los Angeles, CA',
      experience_years: 3,
      rating: 4.7,
      total_reviews: 89,
      images: ['https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300'],
      provider: {
        name: 'Mike Rodriguez',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        professional_status: 'professional'
      }
    }
  ];

  const serviceTypeOptions = [
    { value: 'all', label: 'All Services' },
    { value: 'grooming', label: 'Grooming' },
    { value: 'walking', label: 'Dog Walking' },
    { value: 'sitting', label: 'Pet Sitting' },
    { value: 'training', label: 'Training' },
    { value: 'veterinary', label: 'Veterinary' },
    { value: 'boarding', label: 'Boarding' }
  ];

  const priceRangeOptions = [
    { value: 'all', label: 'Any Price' },
    { value: '0-25', label: '$0 - $25' },
    { value: '25-50', label: '$25 - $50' },
    { value: '50-100', label: '$50 - $100' },
    { value: '100+', label: '$100+' }
  ];

  const getServiceTypeIcon = (type: string) => {
    const icons = {
      grooming: '✂️',
      walking: '🚶',
      sitting: '🏠',
      training: '🎓',
      veterinary: '🏥',
      boarding: '🏨'
    };
    return icons[type as keyof typeof icons] || '🐕';
  };

  const getProfessionalBadge = (status: string) => {
    if (status === 'verified_professional') {
      return <Badge className="bg-green-100 text-green-800">✓ Verified Pro</Badge>;
    }
    if (status === 'professional') {
      return <Badge className="bg-blue-100 text-blue-800">Professional</Badge>;
    }
    return null;
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Pet Services Marketplace</h1>
        <p className="text-gray-600">Find trusted pet care professionals in your area</p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={serviceType} onValueChange={setServiceType}>
              <SelectTrigger>
                <SelectValue placeholder="Service Type" />
              </SelectTrigger>
              <SelectContent>
                {serviceTypeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger>
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                {priceRangeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card key={service.id} className="hover:shadow-lg transition-shadow">
            <div className="relative">
              <img
                src={service.images[0]}
                alt={service.title}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 bg-white/80 hover:bg-white"
              >
                <Heart className="h-4 w-4" />
              </Button>
              <div className="absolute top-2 left-2">
                <span className="text-2xl bg-white/80 rounded-full px-2 py-1">
                  {getServiceTypeIcon(service.service_type)}
                </span>
              </div>
            </div>

            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg">{service.title}</h3>
                {getProfessionalBadge(service.provider.professional_status)}
              </div>

              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {service.description}
              </p>

              <div className="flex items-center gap-2 mb-2">
                <img
                  src={service.provider.avatar_url}
                  alt={service.provider.name}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-sm font-medium">{service.provider.name}</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500">{service.experience_years}y exp</span>
                </div>
              </div>

              <div className="flex items-center gap-1 mb-3">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{service.rating}</span>
                <span className="text-xs text-gray-500">({service.total_reviews} reviews)</span>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500">{service.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-green-600">
                    ${service.price}
                    {service.price_type === 'hourly' && '/hr'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1" size="sm">
                  <Calendar className="h-4 w-4 mr-1" />
                  Book Now
                </Button>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center mt-8">
        <Button variant="outline" size="lg">
          Load More Services
        </Button>
      </div>
    </div>
  );
};

export default ServicesMarketplace;
