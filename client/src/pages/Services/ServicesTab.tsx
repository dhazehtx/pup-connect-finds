import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Filter, MapPin, Shield } from 'lucide-react';
import { ExploreUniversalSearchBar } from '@/components/explore/ExploreUniversalSearchBar';
import { ServiceProviderCard } from '@/components/ServiceProviderCard';
import { MarketplaceProviderCard } from '@/components/services/MarketplaceProviderCard';
import { BookServiceModal } from '@/components/BookServiceModal';
import type { PetServiceProvider } from '@shared/schema';
import { useProviders } from '@/hooks/useProviders';
import { useSignedIn } from '@/hooks/useSignedIn';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { SERVICE_CATEGORY_FILTER_OPTIONS } from '@shared/serviceCategories';

function DemoProviderCard({ provider }: { provider: any }) {
  const { requireAuth } = useRequireAuth();

  return (
    <MarketplaceProviderCard
      name={provider.name || 'Service Provider'}
      serviceType={provider.service_type ?? 'grooming'}
      bio={provider.bio || provider.headline}
      location={provider.location}
      price={provider.price}
      isVerified={Boolean(provider.is_verified)}
      since={provider.since || 'Provider since 2024'}
      primaryLabel="Sign in to book"
      onPrimaryAction={() => requireAuth(() => {})}
    />
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

function parseListingPrice(service: { price?: unknown }): number | null {
  const p = service?.price;
  if (p == null || p === '') return null;
  const n = typeof p === 'number' ? p : parseFloat(String(p));
  return Number.isFinite(n) ? n : null;
}

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

  const { requireAuth } = useRequireAuth();

  const handleBecomeProvider = () => {
    requireAuth(() => navigate('/services/onboarding'));
  };

  // Fetch real data only - no demo fallback for signed-in users
  const { providers: services = [], isLoading, isError: error, isDemo } = useProviders();

  const serviceTypes = SERVICE_CATEGORY_FILTER_OPTIONS.map((c) => ({
    value: c.id,
    label: c.label,
  }));

  // Filter real services only (never demo data for signed-in users)
  const realServices = isSignedIn ? services.filter(service => !service.isDemo) : services;
  
  const filteredServices = realServices.filter((service: any) => {
    const matchesSearch = !searchTerm || 
      service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.service_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !filters.type || service.service_type === filters.type;

    const loc = filters.location?.trim().toLowerCase();
    const matchesLocation =
      !loc ||
      (typeof service.location === 'string' &&
        service.location.toLowerCase().includes(loc));

    const priceVal = parseListingPrice(service);
    const minP = filters.min_price ? parseFloat(filters.min_price) : NaN;
    const maxP = filters.max_price ? parseFloat(filters.max_price) : NaN;
    const matchesMin =
      !Number.isFinite(minP) ||
      priceVal == null ||
      priceVal >= minP;
    const matchesMax =
      !Number.isFinite(maxP) ||
      priceVal == null ||
      priceVal <= maxP;

    return matchesSearch && matchesType && matchesLocation && matchesMin && matchesMax;
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
            Find trusted professionals for grooming, transport, stud services, scooping, and more
          </p>
          
          {/* Search Bar in Hero — same pill + blue action as Explore */}
          <div className="mx-auto mb-6 max-w-lg">
            <ExploreUniversalSearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search services, providers, or locations..."
              inputSize="lg"
              id="services-hero-search"
              className="[&_input]:!bg-white [&_input]:!text-slate-900 [&_.paws-search-submit]:!bg-blue-600"
              data-testid="input-search-services"
            />
          </div>
          
          <Button 
            onClick={handleBecomeProvider} 
            className="w-full max-w-xs mt-3"
            style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)' }}
          >
            Become a Service Provider
          </Button>
        </div>
      </div>

      {/* Advanced Filters Panel - Premium filter tray */}
      {showFilters && (
        <Card className="border border-gray-200 bg-gray-50 rounded-xl shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 font-medium mb-3">Refine your search</p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Select 
                value={filters.type || 'all'} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, type: value === 'all' ? undefined : value }))}
              >
                <SelectTrigger className="h-9 border border-gray-200 bg-white rounded-lg" style={{ color: '#000000' }}>
                  <SelectValue placeholder="Service Type" className="text-black" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all" className="text-gray-900">All Services</SelectItem>
                  {serviceTypes.map(type => (
                    <SelectItem key={type.value} value={type.value} className="text-gray-900">
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Location"
                  value={filters.location || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value || undefined }))}
                  className="h-9 pl-9 border border-gray-200 bg-white rounded-lg"
                />
              </div>

              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="number"
                  placeholder="Min Price"
                  value={filters.min_price || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, min_price: e.target.value || undefined }))}
                  className="h-9 pl-9 border border-gray-200 bg-white rounded-lg"
                />
              </div>

              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="number"
                  placeholder="Max Price"
                  value={filters.max_price || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, max_price: e.target.value || undefined }))}
                  className="h-9 pl-9 border border-gray-200 bg-white rounded-lg"
                />
              </div>
            </div>
            
            {Object.values(filters).some(Boolean) && (
              <div className="flex justify-end mt-3">
                <Button
                  variant="ghost"
                  onClick={() => setFilters({})}
                  size="sm"
                  className="text-blue-600 hover:text-blue-700 h-8 text-xs"
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Subtle divider when filters are open */}
      {showFilters && <div className="border-t border-gray-100 mx-4" />}

      {/* Filters Section - grouped together */}
      <div className="flex flex-col items-center gap-2 px-4">
        {/* Show Advanced Filters - matches Sign in to book button styling */}
        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant="outline"
          size="sm"
          className="text-sm font-medium shadow-sm"
        >
          {showFilters ? 'Hide Filters' : 'Show Advanced Filters'}
        </Button>

        {/* Service Categories Pill Row — same ids as pet_service_providers.service_type */}
        <div className="flex flex-wrap gap-3 justify-center max-w-5xl mx-auto">
        <Button
          className={`${PILL_BASE} ${!filters.type ? PILL_ACTIVE : PILL_INACTIVE}`}
          onClick={() => setFilters(prev => ({ ...prev, type: undefined }))}
        >
          All Services
        </Button>
        {SERVICE_CATEGORY_FILTER_OPTIONS.map((cat) => (
          <Button
            key={cat.id}
            className={`${PILL_BASE} ${filters.type === cat.id ? PILL_ACTIVE : PILL_INACTIVE}`}
            onClick={() => setFilters(prev => ({ ...prev, type: cat.id }))}
          >
            {cat.label}
          </Button>
        ))}
        </div>
      </div>

      {/* Services Content - Tabs for All Services and Featured (Promoted) */}
      <Tabs defaultValue="all" className="w-full services-tabs">
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary p-1 shadow-sm">
            <TabsList className="tab-list border-0 bg-transparent p-0">
              <TabsTrigger value="all" className="tab-pill" data-service-filter="true">
                All Services
              </TabsTrigger>
              <TabsTrigger value="featured" className="tab-pill" data-service-filter="true">
                Featured Services
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

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
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
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
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
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
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Filter className="h-7 w-7" aria-hidden />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Services Found</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to offer services in your area!
              </p>
              <button onClick={handleBecomeProvider} className="btn-primary">
                Become a Service Provider
              </button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="featured" className="bg-white rounded-lg border border-border shadow-sm p-0 focus-visible:outline-none space-y-4">
          <div className="text-center py-4 md:py-6 bg-white rounded-lg">
            <div className="max-w-6xl mx-auto px-4 md:px-6">
              <h2 className="text-2xl font-semibold mb-2">Featured Services</h2>
              <p className="text-muted-foreground">
                Promoted listings from verified service providers
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
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
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
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
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                <Shield className="h-7 w-7" aria-hidden />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Featured Services Yet</h3>
              <p className="text-muted-foreground mb-4">
                Promote your service to appear here and reach more customers!
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