
import * as React from "react";
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import CreateServiceDialog from './CreateServiceDialog';
import { DEMO_PROVIDERS, ServiceProvider } from "@/data/demoProviders";
import { useAuthState } from '@/hooks/useAuthState';

// Pill styles (keep these exactly)
const PILL_BASE =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm " +
  "h-10 rounded-full px-6 py-2 font-medium border-2 transition-colors " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2";

const PILL_INACTIVE =
  "!bg-blue-50 !text-blue-700 !border-blue-600 hover:!bg-blue-100";

const PILL_ACTIVE =
  "!bg-[#2363FF] !text-white !border-[#2363FF] hover:!bg-[#1E55D6]";

interface SupabaseServiceProvider {
  id: string;
  business_name: string;
  service_types: string[];
  description: string | null;
  location: string;
  pricing: any;
  rating: number | null;
  total_bookings: number | null;
  verified: boolean | null;
  user_id: string;
}

// Jump to the hero if guest clicks anything "gated"
function useGuestRedirect(isSignedIn: boolean) {
  return React.useCallback((e?: React.MouseEvent) => {
    if (isSignedIn) return false; // allow normal flow
    e?.preventDefault();
    // if we're already on /marketplace, just jump; otherwise navigate then jump
    try {
      const el = document.getElementById("marketplace-hero");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.hash = "marketplace-hero";
      }
    } catch {}
    return true; // handled
  }, [isSignedIn]);
}

const ServicesMarketplace = () => {
  const { user } = useAuthState();
  const isSignedIn = !!user;
  const guestRedirect = useGuestRedirect(isSignedIn);
  
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [showCreateService, setShowCreateService] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Services');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        if (isSignedIn) {
          // fetch your live providers
          const { data, error } = await supabase
            .from('service_providers')
            .select('*')
            .order('rating', { ascending: false });

          if (error) throw error;
          
          // Convert Supabase providers to ServiceProvider format
          const convertedProviders: ServiceProvider[] = (data || []).map((p: SupabaseServiceProvider) => ({
            id: p.id,
            name: p.business_name,
            headline: p.description || `Professional ${p.service_types.join(', ')} services`,
            since: `Provider since ${new Date().toLocaleDateString()}`,
            tags: p.service_types
          }));
          
          if (!cancelled) setProviders(convertedProviders);
        } else {
          if (!cancelled) setProviders(DEMO_PROVIDERS);
        }
      } catch (error) {
        console.error('Error loading providers:', error);
        if (!cancelled) setProviders(isSignedIn ? [] : DEMO_PROVIDERS);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [isSignedIn]);

  const serviceFilters = [
    'All Services',
    'Grooming', 
    'Dog Sitting',
    'Training',
    'Dog Walking',
    'Boarding'
  ];

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.headline?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'All Services' || 
                         provider.tags?.some(tag => tag.toLowerCase().includes(activeFilter.toLowerCase().replace(' ', '')));
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Gradient */}
      <section id="marketplace-hero" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Pet Services Marketplace</h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">
            Find trusted professionals for grooming, training, sitting, and more
          </p>
          <div className="mt-8">
            <Button
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold rounded-full"
              onClick={() => setShowCreateService(true)}
            >
              Become a Service Provider
            </Button>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Search Bar */}
        <div className="mb-8 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="relative max-w-4xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search services, providers, or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 py-4 text-lg rounded-lg shadow-sm border-2 bg-white"
              style={{ borderColor: '#CBD5E1' }}
            />
          </div>
        </div>

        {/* Service Filter Tags */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <Button
            className={`${PILL_BASE} ${activeFilter === "All Services" ? PILL_ACTIVE : PILL_INACTIVE}`}
            onClick={() => setActiveFilter("All Services")}
          >
            All Services
          </Button>
          <Button
            className={`${PILL_BASE} ${activeFilter === "Grooming" ? PILL_ACTIVE : PILL_INACTIVE}`}
            onClick={() => setActiveFilter("Grooming")}
          >
            Grooming
          </Button>
          <Button
            className={`${PILL_BASE} ${activeFilter === "Dog Sitting" ? PILL_ACTIVE : PILL_INACTIVE}`}
            onClick={() => setActiveFilter("Dog Sitting")}
          >
            Dog Sitting
          </Button>
          <Button
            className={`${PILL_BASE} ${activeFilter === "Training" ? PILL_ACTIVE : PILL_INACTIVE}`}
            onClick={() => setActiveFilter("Training")}
          >
            Training
          </Button>
          <Button
            className={`${PILL_BASE} ${activeFilter === "Dog Walking" ? PILL_ACTIVE : PILL_INACTIVE}`}
            onClick={() => setActiveFilter("Dog Walking")}
          >
            Dog Walking
          </Button>
          <Button
            className={`${PILL_BASE} ${activeFilter === "Boarding" ? PILL_ACTIVE : PILL_INACTIVE}`}
            onClick={() => setActiveFilter("Boarding")}
          >
            Boarding
          </Button>
        </div>

        {/* Empty State */}
        {!loading && filteredProviders.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#E5EEFF' }}>
              <Search className="w-10 h-10" style={{ color: '#2363FF' }} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No services found</h3>
            <p className="text-gray-600 mb-8">Be the first to list a service!</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="animate-pulse space-y-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="border" style={{ borderColor: '#CBD5E1' }}>
                <CardContent className="p-6">
                  <div className="h-4 rounded w-1/4 mb-2" style={{ backgroundColor: '#E5EEFF' }}></div>
                  <div className="h-3 rounded w-3/4 mb-4" style={{ backgroundColor: '#E5EEFF' }}></div>
                  <div className="h-3 rounded w-1/2" style={{ backgroundColor: '#E5EEFF' }}></div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Providers Grid */}
        {!loading && filteredProviders.length > 0 && (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {filteredProviders.map((provider) => (
              <article key={provider.id} className="rounded-2xl border p-5 shadow-sm bg-white">
                <h3 className="text-lg font-semibold text-gray-900">{provider.name}</h3>
                <p className="mt-1 text-slate-600">{provider.headline}</p>
                <p className="mt-1 text-slate-400 text-sm">{provider.since}</p>
                {provider.tags && provider.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {provider.tags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex gap-3">
                  <button
                    className="rounded-full bg-[#2363FF] px-5 py-2 text-white hover:bg-[#1E55D6] transition-colors font-medium"
                    onClick={(e) => guestRedirect(e) || console.log("book", provider.id)}
                  >
                    {isSignedIn ? "Book Service" : "Preview Service"}
                  </button>

                  <button
                    className="rounded-full border border-slate-300 px-5 py-2 text-slate-700 hover:bg-slate-50 transition-colors font-medium"
                    onClick={(e) => guestRedirect(e) || console.log("view", provider.id)}
                  >
                    View Profile
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Become a Service Provider Banner */}
        <div className="mt-16">
          <Card className="bg-gradient-to-r from-purple-500 to-pink-500 border-0 overflow-hidden">
            <CardContent className="py-12 px-8 text-center text-white relative">
              <h2 className="text-3xl font-bold mb-4">Become a Service Provider</h2>
              <Button 
                onClick={() => setShowCreateService(true)}
                className="bg-white font-semibold px-8 py-3 rounded-lg transition-all duration-200"
                style={{ color: '#2363FF', border: 'none' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F8F9FA';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                Get Started
              </Button>
              
              {/* Mobile Device Mockup */}
              <div className="absolute right-8 bottom-4 hidden lg:block">
                <div className="w-16 h-20 bg-white/20 rounded-lg border border-white/30"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Service Dialog */}
      <CreateServiceDialog
        isOpen={showCreateService}
        onOpenChange={setShowCreateService}
        onServiceCreated={() => {
          // Reload providers after creating a new service
          if (isSignedIn) {
            // Trigger a re-render by updating the dependency
            setLoading(true);
          }
        }}
      />
    </div>
  );
};

export default ServicesMarketplace;
