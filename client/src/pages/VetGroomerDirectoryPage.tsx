import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useProviders } from '@/hooks/useProviders';
import { BookServiceModal } from '@/components/BookServiceModal';
import { ServiceProviderCard } from '@/components/ServiceProviderCard';
import { SERVICE_CATEGORY_FILTER_OPTIONS } from '@shared/serviceCategories';
import {
  enrichServiceProviderForUi,
  type ServiceProviderForUi,
} from '@/data/demoProviders';

export default function VetGroomerDirectoryPage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState<string>('all');
  const { providers = [], isLoading, isGuestData } = useProviders();
  const [bookingProvider, setBookingProvider] = useState<ServiceProviderForUi | null>(null);

  const filtered =
    category === 'all'
      ? providers
      : providers.filter((p: any) => (p.service_type || '').toLowerCase() === category.toLowerCase());

  return (
    <div className="max-w-4xl mx-auto p-4 pb-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Back">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vet & Groomer Directory</h1>
          <p className="text-sm text-gray-600">Find service providers by category</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={category === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCategory('all')}
        >
          All
        </Button>
        {SERVICE_CATEGORY_FILTER_OPTIONS.map((c) => (
          <Button
            key={c.id}
            variant={category === c.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategory(c.id)}
          >
            {c.pillEmoji} {c.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading directory…</div>
      ) : filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((p) => (
            <ServiceProviderCard
              key={p.id}
              provider={enrichServiceProviderForUi(p)}
              guestMarketplace={isGuestData}
              onBook={() => setBookingProvider(enrichServiceProviderForUi(p))}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <p>No providers in this category yet. Check back later or browse all services.</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate('/marketplace?tab=services')}>
              Browse all services
            </Button>
          </CardContent>
        </Card>
      )}

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
