import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Clock, DollarSign } from 'lucide-react';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import type { PetServiceProvider } from '@shared/schema';
import { getServiceCategoryEmoji, getServiceCategoryLabel } from '@shared/serviceCategories';
import { ServiceBadge } from '@/components/badges/ServiceBadge';

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
  /** Passed when listing uses guest/demo marketplace data (analytics / UI hooks). */
  guestMarketplace?: boolean;
}

export function ServiceProviderCard({ provider, onBook }: ServiceProviderCardProps) {
  const navigate = useNavigate();
  const { requireAuth } = useRequireAuth();
  
  const isWhelping = provider.service_type === 'whelping';

  const handleBookClick = () => {
    if (isWhelping) {
      navigate(`/services/provider/${provider.id}`);
      return;
    }
    requireAuth(() => onBook());
  };

  const handleViewDetails = () => {
    navigate(`/services/provider/${provider.id}`);
  };

  return (
    <Card className="relative overflow-hidden border-slate-200 shadow-sm transition-shadow duration-200 hover:shadow-lg">
      {provider.is_verified && (
        <div className="absolute top-2 right-2 z-10">
          <ServiceBadge
            serviceType={provider.service_type}
            verified={Boolean(provider.is_verified)}
            className="text-xs"
          />
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={provider.user?.avatar_url} alt={provider.user?.full_name} />
            <AvatarFallback>
              {provider.user?.full_name?.charAt(0) || 'P'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg truncate">
                {provider.user?.full_name || 'Service Provider'}
              </h3>
              {provider.user?.verified && (
                <Badge variant="outline" className="text-xs">
                  ✓ User Verified
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-1 text-sm text-slate-600">
              <span>{getServiceCategoryEmoji(provider.service_type)}</span>
              <span>{getServiceCategoryLabel(provider.service_type)}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Bio */}
        <p className="text-sm text-slate-600 line-clamp-3">
          {provider.bio}
        </p>

        {/* Details */}
        <div className="space-y-2">
          {provider.location && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="h-4 w-4" />
              <span>{provider.location}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm font-medium">
            <DollarSign className="h-4 w-4" />
            <span>{provider.price ? `$${provider.price}/hour` : 'Price on request'}</span>
          </div>

          {provider.availability && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock className="h-4 w-4" />
              <span className="line-clamp-1">{provider.availability}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-2 sm:flex-row">
          <button type="button" onClick={handleBookClick} className="btn-primary min-h-11 flex-1 text-sm font-semibold">
            {isWhelping ? 'Apply waitlist' : 'Book service'}
          </button>
          
          <Button 
            variant="outline" 
            size="sm"
            className="min-h-11 min-w-[7rem] border-slate-300 font-medium text-slate-700 hover:bg-slate-50"
            onClick={handleViewDetails}
          >
            View details
          </Button>
        </div>

        {/* Member Since */}
        <div className="text-xs text-slate-500 border-t pt-2">
          Provider since {provider.created_at ? new Date(provider.created_at).toLocaleDateString() : 'N/A'}
        </div>
      </CardContent>
    </Card>
  );
}