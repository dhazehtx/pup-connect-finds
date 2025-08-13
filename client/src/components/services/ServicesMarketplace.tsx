
import * as React from "react";
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import CreateServiceDialog from './CreateServiceDialog';
import { useProviders } from '@/hooks/useProviders';
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
  const queryClient = useQueryClient();
  
  const [showCreateService, setShowCreateService] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Services');

  // Use centralized providers hook - no demo/live merging, proper auth-aware caching
  const { providers, isDemo, isLoading, isError } = useProviders();

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
        {isLoading ? (
          // Loading state
          [...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <Card className="border">
                <CardContent className="p-6">
                  <div className="h-4 rounded w-1/4 mb-2 bg-gray-200"></div>
                  <div className="h-3 rounded w-3/4 mb-4 bg-gray-200"></div>
                  <div className="h-3 rounded w-1/2 bg-gray-200"></div>
                </CardContent>
              </Card>
            </div>
          ))
        ) : isError ? (
          // Error state: show empty, not demo
          <div className="col-span-full">
            <EmptyServices />
          </div>
        ) : filteredProviders.length === 0 ? (
          // No results state
          <div className="col-span-full">
            <EmptyServices />
          </div>
        ) : (
          filteredProviders.map(provider => (
            <article key={provider.id} className="rounded-xl border p-5 shadow-sm">
              <h3 className="text-lg font-semibold">{provider.name}</h3>
              <p className="mt-1 text-slate-600">{provider.headline}</p>
              <p className="mt-2 text-xs text-slate-400">{provider.since}</p>

              <div className="mt-4 flex gap-3">
                {/* Proper button behavior based on auth and demo status */}
                {isSignedIn && !isDemo ? (
                  <>
                    <button 
                      className="rounded-full bg-[#2363FF] px-4 py-2 text-white hover:bg-[#1E55D6]"
                      data-testid={`button-book-${provider.id}`}
                    >
                      Book Service
                    </button>
                    <button 
                      className="rounded-full border-2 border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
                      data-testid={`button-profile-${provider.id}`}
                    >
                      View Profile
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      className="rounded-full bg-[#2363FF] px-4 py-2 text-white hover:bg-[#1E55D6]"
                      onClick={guestRedirect}
                      data-testid={`button-book-demo-${provider.id}`}
                    >
                      Book Service
                    </button>
                    <button 
                      className="rounded-full border-2 border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
                      onClick={guestRedirect}
                      data-testid={`button-profile-demo-${provider.id}`}
                    >
                      View Profile
                    </button>
                  </>
                )}
              </div>
            </article>
          ))
        )}
      </section>

      {/* Create Service Dialog */}
      <CreateServiceDialog
        isOpen={showCreateService}
        onOpenChange={setShowCreateService}
        onServiceCreated={() => {
          // Invalidate cache to refresh providers
          queryClient.invalidateQueries({ queryKey: ["providers"] });
        }}
      />
    </div>
  );
};

export default ServicesMarketplace;
