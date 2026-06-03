import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import type { PetServiceProvider } from '@shared/schema';
import { MarketplaceProviderCard } from '@/components/services/MarketplaceProviderCard';

interface ServiceProviderCardProps {
  provider: PetServiceProvider & {
    user?: {
      id: string;
      username: string;
      full_name: string;
      avatar_url?: string;
      verified?: boolean;
    };
  };
  onBook: () => void;
  guestMarketplace?: boolean;
}

export function ServiceProviderCard({ provider, onBook }: ServiceProviderCardProps) {
  const navigate = useNavigate();
  const { requireAuth } = useRequireAuth();
  const isWhelping = provider.service_type === 'whelping';

  const handlePrimary = () => {
    if (isWhelping) {
      navigate(`/services/provider/${provider.id}`);
      return;
    }
    requireAuth(() => onBook());
  };

  const sinceLabel = provider.created_at
    ? `Provider since ${new Date(provider.created_at).toLocaleDateString()}`
    : undefined;

  return (
    <MarketplaceProviderCard
      name={provider.user?.full_name || 'Service Provider'}
      serviceType={provider.service_type}
      bio={provider.bio}
      location={provider.location}
      price={provider.price}
      isVerified={Boolean(provider.is_verified)}
      since={sinceLabel}
      primaryLabel={isWhelping ? 'Apply waitlist' : 'Book service'}
      onPrimaryAction={handlePrimary}
      secondaryLabel="View details"
      onSecondaryAction={() => navigate(`/services/provider/${provider.id}`)}
    />
  );
}
