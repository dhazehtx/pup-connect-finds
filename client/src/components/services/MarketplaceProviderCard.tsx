import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, DollarSign } from 'lucide-react';
import { getServiceCategoryLabel } from '@shared/serviceCategories';
import { ServiceBadge } from '@/components/badges/ServiceBadge';
import {
  normalizeServiceType,
  ServiceCategoryIcon,
} from '@/components/services/ServiceCategoryIcon';
import { cn } from '@/lib/utils';

export type MarketplaceProviderCardProps = {
  name: string;
  serviceType: string;
  bio?: string | null;
  location?: string | null;
  price?: number | string | null;
  isVerified?: boolean;
  since?: string;
  primaryLabel: string;
  onPrimaryAction: () => void;
  secondaryLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
};

function formatPrice(price: number | string | null | undefined): string | null {
  if (price == null || price === '') return null;
  const n = typeof price === 'number' ? price : parseFloat(String(price));
  if (!Number.isFinite(n)) return null;
  return `$${n}/hour`;
}

/**
 * Guest + signed-in marketplace service listings — fixed visual hierarchy:
 * icon → verification badge → title → category → description → meta → CTA
 */
export function MarketplaceProviderCard({
  name,
  serviceType,
  bio,
  location,
  price,
  isVerified = false,
  since,
  primaryLabel,
  onPrimaryAction,
  secondaryLabel,
  onSecondaryAction,
  className,
}: MarketplaceProviderCardProps) {
  const priceLabel = formatPrice(price);
  const canonicalType = normalizeServiceType(serviceType) || serviceType;

  return (
    <Card
      className={cn(
        'marketplace-service-card flex h-full flex-col overflow-hidden border-slate-200 shadow-sm transition-shadow duration-200 hover:shadow-md',
        className,
      )}
    >
      <CardHeader className="flex flex-col items-center px-5 pb-2 pt-6 text-center">
        <ServiceCategoryIcon type={canonicalType} size="lg" />
        {isVerified && (
          <div className="mt-3">
            <ServiceBadge serviceType={canonicalType} verified />
          </div>
        )}
        <h3 className="mt-3 text-lg font-semibold leading-tight text-slate-900">{name}</h3>
        <p className="mt-1 text-sm font-medium text-slate-500">
          {getServiceCategoryLabel(canonicalType)}
        </p>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3 px-5 pb-5 pt-0">
        {bio ? (
          <p className="text-center text-sm leading-relaxed text-slate-600 line-clamp-4">{bio}</p>
        ) : null}

        {(location || priceLabel) && (
          <div className="space-y-1.5 text-sm text-slate-600">
            {location ? (
              <div className="flex items-center justify-center gap-1.5">
                <MapPin className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                <span className="line-clamp-1">{location}</span>
              </div>
            ) : null}
            {priceLabel ? (
              <div className="flex items-center justify-center gap-1.5 font-medium text-slate-800">
                <DollarSign className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                <span>{priceLabel}</span>
              </div>
            ) : null}
          </div>
        )}

        <div className="mt-auto space-y-2 pt-1">
          <Button
            type="button"
            onClick={onPrimaryAction}
            className="min-h-11 w-full bg-blue-600 font-semibold hover:bg-blue-700"
          >
            {primaryLabel}
          </Button>
          {secondaryLabel && onSecondaryAction ? (
            <Button
              type="button"
              variant="outline"
              onClick={onSecondaryAction}
              className="min-h-11 w-full border-slate-300 font-medium text-slate-700"
            >
              {secondaryLabel}
            </Button>
          ) : null}
          {since ? (
            <p className="border-t border-slate-100 pt-2 text-center text-xs text-slate-500">{since}</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
