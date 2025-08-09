import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, MapPin, Clock, Star, Shield, Filter } from 'lucide-react';
import { ServiceProviderCard } from '@/components/ServiceProviderCard';
import { BecomeProviderModal } from '@/components/BecomeProviderModal';
import { BookServiceModal } from '@/components/BookServiceModal';
import type { PetServiceProvider } from '@shared/schema';

interface ServicesFilters {
  type?: string;
  location?: string;
  min_price?: string;
  max_price?: string;
}

export function ServicesTab() {
  const [filters, setFilters] = useState<ServicesFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<PetServiceProvider | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { data: services = [], isLoading, error } = useQuery({
    queryKey: ['/api/services/search', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await fetch(`/api/services/search?${params}`);
      if (!response.ok) throw new Error('Failed to fetch services');
      
      const result = await response.json();
      return result.data || [];
    },
  });

  const serviceTypes = [
    { value: 'grooming', label: 'Dog Grooming', icon: '✂️' },
    { value: 'walking', label: 'Dog Walking', icon: '🚶' },
    { value: 'sitting', label: 'Pet Sitting', icon: '🏠' },
    { value: 'training', label: 'Dog Training', icon: '🎓' },
    { value: 'boarding', label: 'Pet Boarding', icon: '🏨' },
    { value: 'veterinary', label: 'Veterinary Care', icon: '🏥' },
  ];

  const filteredServices = services.filter((service: any) =>
    !searchTerm || 
    service.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.service_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const featuredServices = filteredServices.slice(0, 6);
  const allServices = filteredServices;

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Failed to load services. Please try again.</p>
        <Button 
          onClick={() => window.location.reload()} 
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Pet Services Marketplace</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Find trusted pet service providers in your area. From grooming to training, 
          our verified professionals are here to help care for your furry friends.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={() => setShowProviderModal(true)}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Shield className="mr-2 h-5 w-5" />
            Become a Service Provider
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by provider name, service type, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>
              
              {Object.values(filters).some(Boolean) && (
                <Button
                  variant="ghost"
                  onClick={() => setFilters({})}
                  size="sm"
                >
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white border border-gray-200 rounded-lg">
                <Select 
                  value={filters.type || ''} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, type: value || undefined }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Service Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Services</SelectItem>
                    {serviceTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Location"
                  value={filters.location || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value || undefined }))}
                />

                <Input
                  type="number"
                  placeholder="Min Price ($)"
                  value={filters.min_price || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, min_price: e.target.value || undefined }))}
                />

                <Input
                  type="number"
                  placeholder="Max Price ($)"
                  value={filters.max_price || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, max_price: e.target.value || undefined }))}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Service Types Quick Filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Button
          variant={!filters.type ? "default" : "outline"}
          onClick={() => setFilters(prev => ({ ...prev, type: undefined }))}
          className="flex items-center gap-2"
        >
          All Services
        </Button>
        {serviceTypes.map(type => (
          <Button
            key={type.value}
            variant={filters.type === type.value ? "default" : "outline"}
            onClick={() => setFilters(prev => ({ ...prev, type: type.value }))}
            className="flex items-center gap-2"
          >
            <span>{type.icon}</span>
            {type.label}
          </Button>
        ))}
      </div>

      {/* Services Content */}
      <Tabs defaultValue="featured" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="featured">Featured Services</TabsTrigger>
          <TabsTrigger value="all">All Services</TabsTrigger>
        </TabsList>

        <TabsContent value="featured" className="space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Featured Service Providers</h2>
            <p className="text-muted-foreground">
              Top-rated and verified professionals in your area
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-16 bg-muted rounded mb-4"></div>
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : featuredServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredServices.map((service: any) => (
                <ServiceProviderCard
                  key={service.id}
                  provider={service}
                  onBook={() => setSelectedProvider(service)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No Services Found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or check back later for new providers.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">
              All Services {allServices.length > 0 && `(${allServices.length})`}
            </h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-16 bg-muted rounded mb-4"></div>
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : allServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allServices.map((service: any) => (
                <ServiceProviderCard
                  key={service.id}
                  provider={service}
                  onBook={() => setSelectedProvider(service)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🐕</div>
              <h3 className="text-xl font-semibold mb-2">No Service Providers Yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to offer pet services in your area!
              </p>
              <Button onClick={() => setShowProviderModal(true)}>
                Become a Provider
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <BecomeProviderModal 
        open={showProviderModal} 
        onClose={() => setShowProviderModal(false)} 
      />
      
      {selectedProvider && (
        <BookServiceModal 
          provider={selectedProvider}
          open={!!selectedProvider} 
          onClose={() => setSelectedProvider(null)} 
        />
      )}
    </div>
  );
}