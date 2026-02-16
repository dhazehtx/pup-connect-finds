import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, DollarSign, MapPin, Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { PetServiceProvider } from '@shared/schema';

interface BookServiceModalProps {
  provider: PetServiceProvider & {
    user?: {
      id: string;
      full_name: string;
      username: string;
      avatar_url?: string;
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
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
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
      setShowConfirmation(true);
      queryClient.invalidateQueries({ queryKey: ['/api/services/bookings'] });
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 2); // Minimum 2 hours from now
    return now.toISOString().slice(0, 16);
  };

  const calculateTotal = () => {
    const hourlyRate = parseFloat(provider.price || '0');
    return (hourlyRate * formData.duration_hours).toFixed(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate minimum booking time (2 hours from now)
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

    if (!agreeToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the service terms before booking.",
        variant: "destructive",
      });
      return;
    }

    createBooking.mutate({
      ...formData,
      service_date: new Date(formData.service_date).toISOString(),
    });
  };

  const serviceTypeLabels: Record<string, string> = {
    grooming: 'Dog Grooming',
    walking: 'Dog Walking', 
    sitting: 'Pet Sitting',
    training: 'Dog Training',
    boarding: 'Pet Boarding',
    veterinary: 'Veterinary Care',
  };

  const serviceTypeIcons: Record<string, string> = {
    grooming: '✂️',
    walking: '🚶',
    sitting: '🏠', 
    training: '🎓',
    boarding: '🏨',
    veterinary: '🏥',
  };

  const handleCloseModal = () => {
    setShowConfirmation(false);
    setAgreeToTerms(false);
    setFormData({
      service_date: '',
      duration_hours: 1,
      special_instructions: '',
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleCloseModal}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {showConfirmation ? 'Booking Confirmed!' : 'Book Service'}
          </DialogTitle>
        </DialogHeader>

        {/* Confirmation Screen */}
        {showConfirmation && (
          <div className="text-center space-y-6 py-6">
            <div className="text-6xl mb-4">✅</div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Booking Request Sent!</h3>
              <p className="text-muted-foreground">
                Your booking request has been sent to {provider.user?.full_name || 'the service provider'}. 
                They will contact you soon to confirm the details.
              </p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="text-left">
                  <p className="font-medium text-green-900">What happens next?</p>
                  <ul className="text-sm text-green-700 mt-1 space-y-1">
                    <li>• The provider will review your request</li>
                    <li>• You'll get a notification when they respond</li>
                    <li>• Check your bookings in the dashboard</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={handleCloseModal}
                className="flex-1"
              >
                Close
              </Button>
              <Button 
                onClick={() => window.open('/dashboard/bookings', '_blank')}
                className="flex-1"
              >
                View My Bookings
              </Button>
            </div>
          </div>
        )}

        {/* Booking Form */}
        {!showConfirmation && (
          <div className="space-y-6">
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
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (hours) *</Label>
                <div className="flex items-center space-x-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="duration"
                    type="number"
                    min="0.5"
                    max="24"
                    step="0.5"
                    value={formData.duration_hours}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration_hours: parseFloat(e.target.value) || 1 }))}
                    className="flex-1"
                    required
                  />
                  <div className="text-sm text-muted-foreground">
                    Total: ${calculateTotal()}
                  </div>
                </div>
              </div>

              {/* Special Instructions */}
              <div className="space-y-2">
                <Label htmlFor="instructions">Special Instructions (Optional)</Label>
                <Textarea
                  id="instructions"
                  placeholder="Any specific requirements or notes for the service provider..."
                  value={formData.special_instructions}
                  onChange={(e) => setFormData(prev => ({ ...prev, special_instructions: e.target.value }))}
                  rows={3}
                />
              </div>

              {/* Availability Notice */}
              {provider.availability && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-900">Provider Availability:</p>
                  <p className="text-sm text-blue-700">{provider.availability}</p>
                </div>
              )}

              {/* Terms Agreement */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-blue-900">Service Terms</p>
                      <p className="text-sm text-blue-700 mt-1">
                        By booking this service, you agree to use only verified providers on our platform 
                        and understand that payment arrangements are made directly with the provider.
                      </p>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="terms"
                        checked={agreeToTerms}
                        onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                      />
                      <label 
                        htmlFor="terms" 
                        className="text-sm text-blue-700 leading-relaxed cursor-pointer"
                      >
                        I agree to the service terms and understand that all providers are verified for safety.
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                  className="flex-1"
                >
                  Cancel
                </Button>
                
                <Button
                  type="submit"
                  disabled={createBooking.isPending || !agreeToTerms}
                  className="flex-1"
                >
                  {createBooking.isPending ? 'Sending Request...' : 'Send Booking Request'}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                This sends a booking request to the provider. Payment will be handled directly with the provider.
              </p>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}