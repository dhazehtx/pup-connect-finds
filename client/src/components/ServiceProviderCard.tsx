import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Clock, Star, Shield, DollarSign } from 'lucide-react';
import type { PetServiceProvider } from '@shared/schema';

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
}

export function ServiceProviderCard({ provider, onBook }: ServiceProviderCardProps) {
  const serviceTypeIcons: Record<string, string> = {
    grooming: '✂️',
    walking: '🚶',
    sitting: '🏠',
    training: '🎓',
    boarding: '🏨',
    veterinary: '🏥',
  };

  const serviceTypeLabels: Record<string, string> = {
    grooming: 'Dog Grooming',
    walking: 'Dog Walking',
    sitting: 'Pet Sitting',
    training: 'Dog Training',
    boarding: 'Pet Boarding',
    veterinary: 'Veterinary Care',
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 relative overflow-hidden">
      {provider.is_verified && (
        <div className="absolute top-2 right-2 z-10">
          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300">
            <Shield className="w-3 h-3 mr-1" />
            Verified
          </Badge>
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
            
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>{serviceTypeIcons[provider.service_type] || '🐕'}</span>
              <span>{serviceTypeLabels[provider.service_type] || provider.service_type}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Bio */}
        <p className="text-sm text-muted-foreground line-clamp-3">
          {provider.bio}
        </p>

        {/* Details */}
        <div className="space-y-2">
          {provider.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{provider.location}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm font-medium">
            <DollarSign className="h-4 w-4" />
            <span>${provider.price}/hour</span>
          </div>

          {provider.availability && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="line-clamp-1">{provider.availability}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={onBook}
            className="flex-1"
            size="sm"
          >
            Book Service
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              // Navigate to provider profile
              window.open(`/profile/${provider.user?.id}`, '_blank');
            }}
          >
            View Profile
          </Button>
        </div>

        {/* Member Since */}
        <div className="text-xs text-muted-foreground border-t pt-2">
          Provider since {provider.created_at ? new Date(provider.created_at).toLocaleDateString() : 'N/A'}
        </div>
      </CardContent>
    </Card>
  );
}