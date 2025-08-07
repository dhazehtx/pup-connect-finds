import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, DollarSign, MapPin, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { PetServiceProvider } from '@shared/schema';

interface BookServiceModalProps {
  provider: PetServiceProvider & {
    user?: {
      id: string;
      username: string;
      full_name: string;
      avatar_url?: string;
      verified?: boolean;
    };
  };
  open: boolean;
  onClose: () => void;
}

interface BookingRequest {
  service_date: string;
  duration_hours: number;
  special_instructions?: string;
}

export function BookServiceModal({ provider, open, onClose }: BookServiceModalProps) {
  const [formData, setFormData] = useState<BookingRequest>({
    service_date: '',
    duration_hours: 1,
    special_instructions: '',
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createBooking = useMutation({
    mutationFn: async (data: BookingRequest) => {
      return apiRequest(`/api/services/book/${provider.id}`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Booking Request Sent!",
        description: "Your booking request has been sent to the service provider. They will contact you soon.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/services/bookings'] });
      onClose();
      setFormData({
        service_date: '',
        duration_hours: 1,
        special_instructions: '',
      });
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const calculateTotal = () => {
    const hourlyRate = parseFloat(provider.price);
    const total = hourlyRate * formData.duration_hours;
    return total.toFixed(2);
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 2); // Minimum 2 hours from now
    return now.toISOString().slice(0, 16);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.service_date || formData.duration_hours <= 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Check if date is in the future
    const selectedDate = new Date(formData.service_date);
    const minDate = new Date();
    minDate.setHours(minDate.getHours() + 2);
    
    if (selectedDate < minDate) {
      toast({
        title: "Invalid Date",
        description: "Please select a date at least 2 hours from now.",
        variant: "destructive",
      });
      return;
    }

    createBooking.mutate({
      ...formData,
      service_date: new Date(formData.service_date).toISOString(),
    });
  };

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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Book Service</DialogTitle>
        </DialogHeader>

        {/* Provider Info */}
        <div className="bg-muted p-4 rounded-lg space-y-3">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={provider.user?.avatar_url} alt={provider.user?.full_name} />
              <AvatarFallback>
                {provider.user?.full_name?.charAt(0) || 'P'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">
                  {provider.user?.full_name || 'Service Provider'}
                </h3>
                {provider.is_verified && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span>{serviceTypeIcons[provider.service_type] || '🐕'}</span>
                <span>{serviceTypeLabels[provider.service_type] || provider.service_type}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span>${provider.price}/hour</span>
            </div>
            
            {provider.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="truncate">{provider.location}</span>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Service Date & Time */}
          <div className="space-y-2">
            <Label htmlFor="service_date">Service Date & Time *</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="service_date"
                type="datetime-local"
                min={getMinDateTime()}
                value={formData.service_date}
                onChange={(e) => setFormData(prev => ({ ...prev, service_date: e.target.value }))}
                className="pl-10"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Minimum 2 hours from now
            </p>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (hours) *</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="duration"
                type="number"
                step="0.5"
                min="0.5"
                max="24"
                value={formData.duration_hours}
                onChange={(e) => setFormData(prev => ({ ...prev, duration_hours: parseFloat(e.target.value) }))}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Special Instructions */}
          <div className="space-y-2">
            <Label htmlFor="instructions">Special Instructions</Label>
            <Textarea
              id="instructions"
              placeholder="Any special requests or information about your pet..."
              value={formData.special_instructions}
              onChange={(e) => setFormData(prev => ({ ...prev, special_instructions: e.target.value }))}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Price Calculation */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex justify-between items-center text-sm mb-2">
              <span>Rate:</span>
              <span>${provider.price}/hour</span>
            </div>
            <div className="flex justify-between items-center text-sm mb-2">
              <span>Duration:</span>
              <span>{formData.duration_hours} hours</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between items-center font-semibold">
              <span>Total:</span>
              <span>${calculateTotal()}</span>
            </div>
          </div>

          {/* Availability Notice */}
          {provider.availability && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900 font-medium">Provider Availability:</p>
              <p className="text-sm text-blue-700">{provider.availability}</p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              disabled={createBooking.isPending}
              className="flex-1"
            >
              {createBooking.isPending ? 'Booking...' : 'Send Booking Request'}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            This sends a booking request to the provider. Payment will be handled directly with the provider.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}