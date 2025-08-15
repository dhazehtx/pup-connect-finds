import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, MapPin, Clock, Star, Shield, Filter } from 'lucide-react';
import { ServiceProviderCard } from '@/components/ServiceProviderCard';
import { BookServiceModal } from '@/components/BookServiceModal';
import Pill from '@/components/Pill';
import type { PetServiceProvider } from '@shared/schema';
import { useProviders } from '@/hooks/useProviders';
import { useSignedIn } from '@/hooks/useSignedIn';

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
  const [selectedProvider, setSelectedProvider] = useState<PetServiceProvider | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const isSignedIn = useSignedIn();
  const navigate = useNavigate();

  const handleBecomeProvider = () => {
    if (isSignedIn) {
      navigate('/services/onboarding');
    } else {
      navigate('/auth?next=/services/onboarding');
    }
  };

  // Fetch real data only - no demo fallback for signed-in users
  const { providers: services = [], isLoading, isError: error, isDemo } = useProviders();

  const serviceTypes = [
    { value: 'grooming', label: 'Dog Grooming', icon: '✂️' },
    { value: 'walking', label: 'Dog Walking', icon: '🚶' },
    { value: 'sitting', label: 'Pet Sitting', icon: '🏠' },
    { value: 'training', label: 'Dog Training', icon: '🎓' },
    { value: 'boarding', label: 'Pet Boarding', icon: '🏨' },
    { value: 'veterinary', label: 'Veterinary Care', icon: '🏥' },
  ];

  // Filter real services only (never demo data for signed-in users)
  const realServices = isSignedIn ? services.filter(service => !service.isDemo) : services;
  
  const filteredServices = realServices.filter((service: any) => {
    const matchesSearch = !searchTerm || 
      service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.service_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !filters.type || service.service_type === filters.type;
    
    return matchesSearch && matchesType;
  });

  const featuredServices = filteredServices.slice(0, 6);
  const allServices = filteredServices;

  if (error && isSignedIn) {
    return (
      <div className="p-6 text-center">
        <div className="m-4 rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="text-red-800 font-medium">Unable to load services</div>
          <div className="text-red-600 text-sm mt-1">
            Please try again in a moment.
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
    <div className="space-y-6 p-4 bg-gray-50 min-h-screen">
      {/* Pet Services Marketplace Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-purple-700/90"></div>
        <div className="relative px-6 py-12 md:px-12 md:py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Pet Services
          </h1>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            Marketplace
          </h2>
          <p className="text-xl md:text-2xl opacity-90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Find trusted professionals for grooming, training, sitting, and more
          </p>
          
          {/* Search Bar in Hero */}
          <div className="max-w-lg mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search services, providers, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-4 text-black bg-white/95 backdrop-blur border-0 shadow-lg rounded-xl text-lg"
                data-testid="input-search-services"
              />
            </div>
          </div>
          
          <Button 
            onClick={handleBecomeProvider}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <Shield className="h-5 w-5 mr-2" />
            Become a Service Provider
          </Button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <Card className="shadow-lg border-0 bg-white">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            
            {Object.values(filters).some(Boolean) && (
              <div className="flex justify-end mt-4">
                <Button
                  variant="ghost"
                  onClick={() => setFilters({})}
                  size="sm"
                  className="text-blue-600 hover:text-blue-700"
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Filter Toggle */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 rounded-xl border-2 px-6 py-3"
        >
          <Filter className="h-4 w-4" />
          {showFilters ? 'Hide Filters' : 'Show Advanced Filters'}
        </Button>
      </div>

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

        <TabsContent value="featured" className="bg-white rounded-2xl border border-border shadow-sm p-0 focus-visible:outline-none ring-0 ring-offset-0 overflow-visible space-y-4">
          <div className="text-center py-4 md:py-6 bg-white rounded-xl">
            <div className="max-w-6xl mx-auto px-4 md:px-6">
              <h2 className="text-2xl font-semibold mb-2">Featured Service Providers</h2>
              <p className="text-muted-foreground">
                Top-rated and verified professionals in your area
              </p>
            </div>
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
            <div className="text-center py-12 bg-white rounded-xl">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No Services Found</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to offer featured services in your area!
              </p>
              <Button 
                onClick={handleBecomeProvider}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 !text-white border-0 outline-none focus:ring-0"
                style={{ color: 'white !important' }}
              >
                Become a Provider
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="bg-white rounded-2xl border border-border shadow-sm p-0 focus-visible:outline-none ring-0 ring-offset-0 overflow-visible space-y-4">
          <div className="text-center py-4 md:py-6 bg-white rounded-xl">
            <div className="max-w-6xl mx-auto px-4 md:px-6">
              <h2 className="text-2xl font-semibold mb-2">
                All Services {allServices.length > 0 && `(${allServices.length})`}
              </h2>
              <p className="text-muted-foreground">
                Top-rated and verified professionals in your area
              </p>
            </div>
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
            <div className="text-center py-12 bg-white rounded-xl">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No Services Found</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to offer featured services in your area!
              </p>
              <Button 
                onClick={handleBecomeProvider}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 !text-white border-0 outline-none focus:ring-0"
                style={{ color: 'white !important' }}
              >
                Become a Provider
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modals - Provider modal removed, using direct navigation */}
      
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