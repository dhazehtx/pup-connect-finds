
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Star, Clock, DollarSign, Search, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ServiceBookingDialog from './ServiceBookingDialog';
import CreateServiceDialog from './CreateServiceDialog';

interface ServiceProvider {
  id: string;
  business_name: string;
  service_types: string[];
  description: string;
  location: string;
  pricing: any;
  rating: number;
  total_bookings: number;
  verified: boolean;
  user_id: string;
}

const ServicesMarketplace = () => {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [showCreateService, setShowCreateService] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .order('rating', { ascending: false });

      if (error) throw error;
      setProviders(data || []);
    } catch (error) {
      console.error('Error loading providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesService = serviceFilter === 'all' || provider.service_types.includes(serviceFilter);
    const matchesLocation = !locationFilter || provider.location.toLowerCase().includes(locationFilter.toLowerCase());
    
    return matchesSearch && matchesService && matchesLocation;
  });

  const handleBookService = (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    setShowBooking(true);
  };

  const serviceTypes = [
    { value: 'grooming', label: '🧼 Grooming' },
    { value: 'walking', label: '🚶 Walking' },
    { value: 'training', label: '🎓 Training' },
    { value: 'veterinary', label: '🏥 Veterinary' },
    { value: 'boarding', label: '🏠 Boarding' },
    { value: 'sitting', label: '👥 Pet Sitting' }
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pet Services</h1>
          <p className="text-gray-600 mt-2">Find trusted professionals for your furry friends</p>
        </div>
        <Button onClick={() => setShowCreateService(true)} className="bg-blue-600 hover:bg-blue-700">
          List Your Service
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Service type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                {serviceTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Providers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProviders.map((provider) => (
          <Card key={provider.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{provider.business_name}</CardTitle>
                  {provider.verified && (
                    <Badge className="bg-green-100 text-green-800 border-green-200 mt-1">
                      ✓ Verified
                    </Badge>
                  )}
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="ml-1 text-sm font-medium">{provider.rating.toFixed(1)}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 text-sm line-clamp-2">{provider.description}</p>
              
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="w-4 h-4 mr-1" />
                {provider.location}
              </div>

              <div className="flex flex-wrap gap-1">
                {provider.service_types.map((service) => {
                  const serviceType = serviceTypes.find(t => t.value === service);
                  return (
                    <Badge key={service} variant="secondary" className="text-xs">
                      {serviceType?.label || service}
                    </Badge>
                  );
                })}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-1" />
                  {provider.total_bookings} bookings
                </div>
                <div className="flex items-center text-sm font-medium">
                  <DollarSign className="w-4 h-4" />
                  {provider.pricing?.hourly ? `$${provider.pricing.hourly}/hr` : 'Custom pricing'}
                </div>
              </div>

              <Button 
                onClick={() => handleBookService(provider)}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Book Service
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProviders.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
          <p className="text-gray-500">Try adjusting your search criteria or check back later.</p>
        </div>
      )}

      {/* Dialogs */}
      {selectedProvider && (
        <ServiceBookingDialog
          isOpen={showBooking}
          onClose={() => setShowBooking(false)}
          provider={selectedProvider}
          onBookingComplete={loadProviders}
        />
      )}

      <CreateServiceDialog
        isOpen={showCreateService}
        onClose={() => setShowCreateService(false)}
        onServiceCreated={loadProviders}
      />
    </div>
  );
};

export default ServicesMarketplace;
