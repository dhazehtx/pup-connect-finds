
import * as React from "react";
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import CreateServiceDialog from './CreateServiceDialog';
import { DEMO_PROVIDERS, ServiceProvider } from "@/data/demoProviders";
import { useSignedIn } from '@/hooks/useSignedIn';
import FilterPill from '@/components/common/FilterPill';
import EmptyServices from '@/components/common/EmptyServices';

// Pill styles (centralized source of truth)
export const PILL_BASE =
  "inline-flex items-center justify-center whitespace-nowrap h-10 px-6 py-2 rounded-full text-sm font-medium border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2";
export const PILL_INACTIVE =
  "bg-blue-50 text-blue-700 border-blue-600 hover:bg-[#E5EEFF]";
export const PILL_ACTIVE =
  "bg-[#2363FF] text-white border-[#2363FF] hover:bg-[#1E55D6]";

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
  const isSignedIn = useSignedIn();
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
          // HARD switch: never mix demo with live
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
    <div>
      {/* Hero - clean single design */}
      <section id="marketplace-hero" className="mx-auto mb-6 rounded-2xl bg-gradient-to-r from-[#2363FF] to-[#8A2BE2] px-6 py-10 text-white">
        <h1 className="text-3xl font-bold">Pet Services Marketplace</h1>
        <p className="mt-2 opacity-90">Find trusted professionals for grooming, training, sitting, and more</p>
        <div className="mt-4">
          <button 
            className="rounded-full bg-white/10 px-5 py-2 text-white ring-1 ring-white/30 hover:bg-white/20"
            onClick={() => setShowCreateService(true)}
          >
            Become a Service Provider
          </button>
        </div>
      </section>

      {/* Search + pills (single row) */}
      <div className="mb-3 rounded-xl border bg-white/80 p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search services, providers, or locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 py-3 text-base rounded-lg shadow-sm border-2 bg-white"
          />
        </div>
      </div>

      <div className="mb-8 flex flex-wrap justify-center gap-3">
        {["All Services","Grooming","Dog Sitting","Training","Dog Walking","Boarding"].map(label => {
          const isActive = activeFilter === label;
          return (
            <button
              key={label}
              className={`${PILL_BASE} ${isActive ? PILL_ACTIVE : PILL_INACTIVE}`}
              style={{ border: "2px solid" }}
              onClick={() => setActiveFilter(label)}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Providers grid */}
      <section className="grid gap-6 md:grid-cols-2">
        {filteredProviders.length === 0 && !loading ? (
          <EmptyServices />
        ) : null}

        {loading && (
          <div className="animate-pulse space-y-4 col-span-full">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="border">
                <CardContent className="p-6">
                  <div className="h-4 rounded w-1/4 mb-2 bg-gray-200"></div>
                  <div className="h-3 rounded w-3/4 mb-4 bg-gray-200"></div>
                  <div className="h-3 rounded w-1/2 bg-gray-200"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredProviders.map(provider => (
          <article key={provider.id} className="rounded-xl border p-5 shadow-sm">
            <h3 className="text-lg font-semibold">{provider.name}</h3>
            <p className="mt-1 text-slate-600">{provider.headline}</p>
            <p className="mt-2 text-xs text-slate-400">{provider.since}</p>

            <div className="mt-4 flex gap-3">
              {/* If guest, bounce actions to hero */}
              {isSignedIn ? (
                <>
                  <button className="rounded-full bg-[#2363FF] px-4 py-2 text-white">Book Service</button>
                  <button className="rounded-full border-2 border-slate-300 px-4 py-2 text-slate-700">View Profile</button>
                </>
              ) : (
                <>
                  <a href="#marketplace-hero" className="rounded-full bg-[#2363FF] px-4 py-2 text-white">Book Service</a>
                  <a href="#marketplace-hero" className="rounded-full border-2 border-slate-300 px-4 py-2 text-slate-700">View Profile</a>
                </>
              )}
            </div>
          </article>
        ))}
      </section>



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
