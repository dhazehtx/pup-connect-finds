import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Dog, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ServiceProviderCard } from '@/components/ServiceProviderCard';
import { BookServiceModal } from '@/components/BookServiceModal';
import { useProviders } from '@/hooks/useProviders';
import {
  enrichServiceProviderForUi,
  type ServiceProviderForUi,
} from '@/data/demoProviders';

/**
 * Home: stud listings + other pet services in two clear rows (same cards as marketplace).
 */
export function HomeStudsServicesSections() {
  const { providers, isLoading, isGuestData } = useProviders();
  const [bookingProvider, setBookingProvider] = useState<ServiceProviderForUi | null>(null);

  const studs = providers.filter((p) => p.service_type === 'stud_services').slice(0, 3);
  const otherServices = providers
    .filter((p) => p.service_type && p.service_type !== 'stud_services')
    .slice(0, 3);

  if (isLoading) {
    return (
      <section className="space-y-6" aria-label="Pet services">
        <div className="h-36 animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-36 animate-pulse rounded-2xl bg-slate-100" />
      </section>
    );
  }

  if (studs.length === 0 && otherServices.length === 0) {
    return null;
  }

  const marketplaceHref = '/marketplace?tab=services';

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-blue-100/90 bg-gradient-to-br from-blue-50/90 to-white px-4 py-5 shadow-sm sm:px-6 sm:py-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Dog className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
                Stud services
              </h2>
              <p className="text-xs text-slate-600 sm:text-sm">
                Health-tested lines — connect with owners on the marketplace
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 rounded-full border-blue-200 bg-white text-blue-800 hover:bg-blue-50"
            asChild
          >
            <Link to={marketplaceHref}>
              Browse studs
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        {studs.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {studs.map((p) => (
              <ServiceProviderCard
                key={p.id}
                provider={enrichServiceProviderForUi(p)}
                guestMarketplace={isGuestData}
                onBook={() => setBookingProvider(enrichServiceProviderForUi(p))}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-600">
            No stud listings yet —{' '}
            <Link to={marketplaceHref} className="font-medium text-blue-700 underline-offset-2 hover:underline">
              open the marketplace
            </Link>
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200/90 bg-white px-4 py-5 shadow-sm sm:px-6 sm:py-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Briefcase className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
                Pet services
              </h2>
              <p className="text-xs text-slate-600 sm:text-sm">
                Grooming, sitting, training, transport & more
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="shrink-0 rounded-full border-blue-200 bg-white text-blue-800 hover:bg-blue-50" asChild>
            <Link to={marketplaceHref}>
              All services
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        {otherServices.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {otherServices.map((p) => (
              <ServiceProviderCard
                key={p.id}
                provider={enrichServiceProviderForUi(p)}
                guestMarketplace={isGuestData}
                onBook={() => setBookingProvider(enrichServiceProviderForUi(p))}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-600">
            No service listings yet —{' '}
            <Link to={marketplaceHref} className="font-medium text-blue-700 underline-offset-2 hover:underline">
              browse the marketplace
            </Link>
          </p>
        )}
      </section>

      {bookingProvider && (
        <BookServiceModal
          provider={bookingProvider}
          open={!!bookingProvider}
          onClose={() => setBookingProvider(null)}
        />
      )}
    </div>
  );
}
