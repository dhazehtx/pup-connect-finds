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
import Pill from '@/components/Pill';
import type { PetServiceProvider } from '@shared/schema';

// Pill styles (keep these exactly)
const PILL_BASE =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm " +
  "h-10 rounded-full px-6 py-2 font-medium border-2 transition-colors " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2";

const PILL_INACTIVE =
  "!bg-blue-50 !text-blue-700 !border-blue-600 hover:!bg-blue-100";

const PILL_ACTIVE =
  "!bg-[#2363FF] !text-white !border-[#2363FF] hover:!bg-[#1E55D6]";

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
      try {
        const { fetchWithRetry } = await import('@/lib/fetchWithRetry');
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
        
        const result = await fetchWithRetry(`/api/services/search?${params}`);
        // Accept empty array as valid state
        if (Array.isArray(result)) return result;
        if (Array.isArray(result?.data)) return result.data;
        return [];
      } catch (err: any) {
        console.error('Services load failed:', err);
        throw new Error(err?.message || 'Failed to load services');
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
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
      <div className="p-6 text-center">
        <div className="m-4 rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="text-red-800 font-medium">Unable to load services</div>
          <div className="text-red-600 text-sm mt-1">
            {error.message || 'Please try again in a moment.'}
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-3 btn btn-outline text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Pet Services Marketplace gradient hero */}
      <div className="text-center space-y-6 mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8">
          <h1 className="text-4xl font-bold mb-4">Pet Services Marketplace</h1>
          <p className="text-blue-100 text-lg max-w-3xl mx-auto">
            Connect with trusted professionals for grooming, training, sitting, and more
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={() => setShowProviderModal(true)}
            size="lg"
            variant="gradient"
            className="gap-2"
          >
            <Shield className="h-5 w-5" />
            <span className="text-white">Become a Service Provider</span>
          </Button>
        </div>
      </div>

      {/* Search Card */}
      <Card className="shadow-lg border-0 bg-white">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search services, providers, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-base border-2 border-gray-200 focus:border-blue-500 rounded-xl"
              />
            </div>

            {/* Quick Actions */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 rounded-lg border-2"
              >
                <Filter className="h-4 w-4" />
                Advanced Filters
              </Button>
              
              {Object.values(filters).some(Boolean) && (
                <Button
                  variant="ghost"
                  onClick={() => setFilters({})}
                  size="sm"
                  className="text-blue-600 hover:text-blue-700"
                >
                  Clear All
                </Button>
              )}
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-gray-50 border border-gray-200 rounded-xl mt-4">
                <Select 
                  value={filters.type || 'all'} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, type: value === 'all' ? undefined : value }))}
                >
                  <SelectTrigger className="border-2">
                    <SelectValue placeholder="Service Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
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
                  className="border-2"
                />

                <Input
                  type="number"
                  placeholder="Min Price ($)"
                  value={filters.min_price || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, min_price: e.target.value || undefined }))}
                  className="border-2"
                />

                <Input
                  type="number"
                  placeholder="Max Price ($)"
                  value={filters.max_price || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, max_price: e.target.value || undefined }))}
                  className="border-2"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Service Categories Pill Row */}
      <div className="flex flex-wrap gap-3 justify-center px-4">
        <Button
          className={`${PILL_BASE} ${!filters.type ? PILL_ACTIVE : PILL_INACTIVE}`}
          onClick={() => setFilters(prev => ({ ...prev, type: undefined }))}
        >
          All Services
        </Button>
        <Button
          className={`${PILL_BASE} ${filters.type === "grooming" ? PILL_ACTIVE : PILL_INACTIVE}`}
          onClick={() => setFilters(prev => ({ ...prev, type: "grooming" }))}
        >
          🧼 Grooming
        </Button>
        <Button
          className={`${PILL_BASE} ${filters.type === "sitting" ? PILL_ACTIVE : PILL_INACTIVE}`}
          onClick={() => setFilters(prev => ({ ...prev, type: "sitting" }))}
        >
          🏠 Dog Sitting
        </Button>
        <Button
          className={`${PILL_BASE} ${filters.type === "training" ? PILL_ACTIVE : PILL_INACTIVE}`}
          onClick={() => setFilters(prev => ({ ...prev, type: "training" }))}
        >
          🎯 Training
        </Button>
        <Button
          className={`${PILL_BASE} ${filters.type === "walking" ? PILL_ACTIVE : PILL_INACTIVE}`}
          onClick={() => setFilters(prev => ({ ...prev, type: "walking" }))}
        >
          🚶 Dog Walking
        </Button>
        <Button
          className={`${PILL_BASE} ${filters.type === "boarding" ? PILL_ACTIVE : PILL_INACTIVE}`}
          onClick={() => setFilters(prev => ({ ...prev, type: "boarding" }))}
        >
          🏨 Boarding
        </Button>
      </div>

      {/* Services Content - Blue Pill Style Tabs */}
      <Tabs defaultValue="featured" className="w-full services-tabs">
        <TabsList className="inline-flex rounded-full border-2 border-blue-600 bg-blue-50 p-1 w-auto mx-auto">
          <TabsTrigger 
            value="featured" 
            className="px-6 py-2 rounded-full font-medium transition-all duration-200 data-[state=active]:bg-[#2363FF] data-[state=active]:text-white data-[state=active]:border-[#2363FF] data-[state=inactive]:bg-transparent data-[state=inactive]:text-blue-700 data-[state=inactive]:border-transparent"
          >
            Featured Services
          </TabsTrigger>
          <TabsTrigger 
            value="all" 
            className="px-6 py-2 rounded-full font-medium transition-all duration-200 data-[state=active]:bg-[#2363FF] data-[state=active]:text-white data-[state=active]:border-[#2363FF] data-[state=inactive]:bg-transparent data-[state=inactive]:text-blue-700 data-[state=inactive]:border-transparent"
          >
            All Services
          </TabsTrigger>
        </TabsList>

        <TabsContent value="featured" className="space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Featured Service Providers</h2>
            <p className="text-slate-600">
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
              <p className="text-slate-600">
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
              <p className="text-slate-600 mb-4">
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