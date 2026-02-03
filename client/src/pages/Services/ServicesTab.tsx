import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, MapPin, Clock, Star, Shield, Filter, DollarSign } from 'lucide-react';
import { ServiceProviderCard } from '@/components/ServiceProviderCard';
import { BookServiceModal } from '@/components/BookServiceModal';
import Pill from '@/components/Pill';
import type { PetServiceProvider } from '@shared/schema';
import { useProviders } from '@/hooks/useProviders';
import { useSignedIn } from '@/hooks/useSignedIn';

const serviceTypeIcons: Record<string, string> = {
  grooming: '✂️',
  walking: '🚶',
  sitting: '🏠',
  training: '🎓',
  boarding: '🏨',
  veterinary: '🏥',
  mobile_grooming: '🚐',
};

const serviceTypeLabels: Record<string, string> = {
  grooming: 'Dog Grooming',
  walking: 'Dog Walking',
  sitting: 'Pet Sitting',
  training: 'Dog Training',
  boarding: 'Pet Boarding',
  veterinary: 'Veterinary Care',
  mobile_grooming: 'Mobile Grooming',
};

// Icon avatar colors for different service types
const serviceIconColors: Record<string, string> = {
  grooming: 'bg-blue-500',
  walking: 'bg-green-500',
  sitting: 'bg-purple-500',
  training: 'bg-orange-500',
  boarding: 'bg-indigo-500',
  veterinary: 'bg-red-500',
  mobile_grooming: 'bg-teal-500',
};

// SVG icons for service types (non-human imagery)
const ServiceIcon = ({ type }: { type: string }) => {
  const colorClass = serviceIconColors[type] || 'bg-blue-500';
  
  return (
    <div className={`h-16 w-16 rounded-full ${colorClass} flex items-center justify-center`}>
      {type === 'grooming' && (
        <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          <text x="8" y="14" fontSize="8" fill="white">✂</text>
        </svg>
      )}
      {type === 'walking' && (
        <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7"/>
        </svg>
      )}
      {type === 'sitting' && (
        <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
      )}
      {type === 'training' && (
        <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
        </svg>
      )}
      {type === 'boarding' && (
        <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/>
        </svg>
      )}
      {type === 'mobile_grooming' && (
        <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
        </svg>
      )}
      {!['grooming', 'walking', 'sitting', 'training', 'boarding', 'mobile_grooming'].includes(type) && (
        <span className="text-2xl">🐕</span>
      )}
    </div>
  );
};

function DemoProviderCard({ provider }: { provider: any }) {
  const navigate = useNavigate();
  
  const handleSignIn = () => {
    navigate('/auth/sign-up');
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 relative overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex flex-col items-center text-center space-y-3">
          {/* Icon-based avatar - no human faces */}
          <div className="relative">
            <ServiceIcon type={provider.service_type} />
            {provider.is_verified && (
              <div className="absolute -bottom-1 -right-1">
                <div className="bg-green-500 rounded-full p-1">
                  <Shield className="w-3 h-3 text-white" />
                </div>
              </div>
            )}
          </div>
          
          {provider.is_verified && (
            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300">
              <Shield className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
          
          <div>
            <h3 className="font-semibold text-lg">
              {provider.name || 'Service Provider'}
            </h3>
            <div className="flex items-center justify-center gap-1 text-sm text-slate-600">
              <span>{serviceTypeIcons[provider.service_type] || '🐕'}</span>
              <span>{serviceTypeLabels[provider.service_type] || provider.service_type}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600 text-center">
          {provider.bio || provider.headline}
        </p>

        <div className="space-y-2">
          {provider.location && (
            <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
              <MapPin className="h-4 w-4" />
              <span>{provider.location}</span>
            </div>
          )}
          
          <div className="flex items-center justify-center gap-2 text-sm font-medium">
            <DollarSign className="h-4 w-4" />
            <span>${provider.price}/hour</span>
          </div>
        </div>

        <Button onClick={handleSignIn} className="w-full">
          Sign in to book
        </Button>

        <div className="text-xs text-slate-500 text-center border-t pt-2">
          {provider.since || 'Provider since 2024'}
        </div>
      </CardContent>
    </Card>
  );
}

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
          <h1 
            className="text-4xl md:text-5xl font-bold mb-4 tracking-tight"
            style={{ color: '#FFFFFF' }}
          >
            Pet Services
          </h1>
          <h2 
            className="text-4xl md:text-5xl font-bold mb-6 tracking-tight"
            style={{ color: '#FFFFFF' }}
          >
            Marketplace
          </h2>
          <p 
            className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto leading-relaxed"
            style={{ color: '#FFFFFF' }}
          >
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
          
          <Button onClick={handleBecomeProvider} className="w-full max-w-xs">
            <Shield className="h-4 w-4 mr-2" />
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
          className="flex items-center gap-2 rounded-xl border-2 px-6 py-3 bg-white hover:bg-blue-50 border-blue-200 text-blue-700"
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
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary p-1 shadow-sm">
            <TabsList className="tab-list border-0 bg-transparent p-0">
              <TabsTrigger value="featured" className="tab-pill">
                Featured Services
              </TabsTrigger>
              <TabsTrigger value="all" className="tab-pill">
                All Services
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="featured" className="bg-white rounded-lg border border-border shadow-sm p-0 focus-visible:outline-none space-y-4">
          <div className="text-center py-4 md:py-6 bg-white rounded-lg">
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
                service.isDemo ? (
                  <DemoProviderCard key={service.id} provider={service} />
                ) : (
                  <ServiceProviderCard
                    key={service.id}
                    provider={service}
                    onBook={() => setSelectedProvider(service)}
                  />
                )
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No Services Found</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to offer featured services in your area!
              </p>
              <button onClick={handleBecomeProvider} className="btn-primary">
                Become a Service Provider
              </button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="bg-white rounded-lg border border-border shadow-sm p-0 focus-visible:outline-none space-y-4">
          <div className="text-center py-4 md:py-6 bg-white rounded-lg">
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
                service.isDemo ? (
                  <DemoProviderCard key={service.id} provider={service} />
                ) : (
                  <ServiceProviderCard
                    key={service.id}
                    provider={service}
                    onBook={() => setSelectedProvider(service)}
                  />
                )
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No Services Found</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to offer featured services in your area!
              </p>
              <button onClick={handleBecomeProvider} className="btn-primary">
                Become a Service Provider
              </button>
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