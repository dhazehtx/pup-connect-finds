import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, DollarSign, MapPin, Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { PetServiceProvider } from '@shared/schema';
import type {
  AvailableSlot,
  CreateServiceBookingRequest,
  CreateServiceBookingResponse,
  ListAvailableSlotsResponse,
} from '@shared/bookingContract';

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

export function BookServiceModal({ provider, open, onClose }: BookServiceModalProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateServiceBookingRequest>({
    serviceTypeId: provider.service_type,
    startAt: '',
    durationMinutes: 60,
    notes: '',
  });
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createBooking = useMutation({
    mutationFn: async (data: CreateServiceBookingRequest) => {
      return apiRequest(`/api/services/book/${provider.id}`, {
        method: 'POST',
        body: data,
      }) as Promise<CreateServiceBookingResponse>;
    },
    onSuccess: () => {
      setShowConfirmation(true);
      queryClient.invalidateQueries({ queryKey: ['/api/services/bookings'] });
    },
    onError: (error: any) => {
      if (error?.code === 'slot_unavailable') {
        toast({
          title: "Slot unavailable",
          description: "That time was just booked. Please choose another slot.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getMinDate = () => {
    const now = new Date();
    return now.toISOString().slice(0, 10);
  };

  const calculateTotal = () => {
    const hourlyRate = parseFloat(provider.price || '0');
    return ((hourlyRate * formData.durationMinutes) / 60).toFixed(2);
  };

  const durationLabel = useMemo(() => {
    const mins = formData.durationMinutes;
    if (mins % 60 === 0) return `${mins / 60} hour${mins > 60 ? 's' : ''}`;
    return `${mins} minutes`;
  }, [formData.durationMinutes]);

  useEffect(() => {
    const loadSlots = async () => {
      if (!selectedDate) {
        setAvailableSlots([]);
        setFormData((prev) => ({ ...prev, startAt: '' }));
        return;
      }
      setLoadingSlots(true);
      try {
        const response = (await apiRequest(
          `/api/services/provider/${provider.id}/available-slots?date=${selectedDate}&durationMinutes=${formData.durationMinutes}`,
        )) as ListAvailableSlotsResponse;
        setAvailableSlots(response?.data?.slots || []);
        setFormData((prev) => ({ ...prev, startAt: '' }));
      } catch (error: any) {
        setAvailableSlots([]);
        toast({
          title: 'Unable to load slots',
          description: error?.message || 'Please try a different date.',
          variant: 'destructive',
        });
      } finally {
        setLoadingSlots(false);
      }
    };
    void loadSlots();
  }, [selectedDate, formData.durationMinutes, provider.id, toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate minimum booking time
    const selectedStart = new Date(formData.startAt);
    const minDate = new Date();
    minDate.setHours(minDate.getHours() + 2);
    
    if (selectedStart < minDate) {
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
    });
  };

  const serviceTypeLabels: Record<string, string> = {
    grooming: 'Dog Grooming',
    walking: 'Dog Walking', 
    sitting: 'Pet Sitting',
    training: 'Dog Training',
    boarding: 'Pet Boarding',
    whelping: 'Whelping Care',
    veterinary: 'Veterinary Care',
  };

  const serviceTypeIcons: Record<string, string> = {
    grooming: '✂️',
    walking: '🚶',
    sitting: '🏠', 
    training: '🎓',
    boarding: '🏨',
    whelping: '🍼',
    veterinary: '🏥',
  };

  const handleCloseModal = () => {
    setShowConfirmation(false);
    setAgreeToTerms(false);
    setFormData({
      serviceTypeId: provider.service_type,
      startAt: '',
      durationMinutes: 60,
      notes: '',
    });
    setSelectedDate('');
    setAvailableSlots([]);
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
                className="min-h-11 flex-1"
              >
                Close
              </Button>
              <Button 
                onClick={() => navigate('/dashboard/bookings')}
                className="min-h-11 flex-1"
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
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="service_date">Service Date *</Label>
                  <Input
                    id="service_date"
                    type="date"
                    min={getMinDate()}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duration *</Label>
                  <Select
                    value={String(formData.durationMinutes)}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, durationMinutes: parseInt(value, 10) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Available Time Slots *</Label>
                {loadingSlots ? (
                  <p className="text-sm text-muted-foreground">Loading available times...</p>
                ) : (
                  <Select
                    value={formData.startAt}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, startAt: value }))}
                    disabled={!selectedDate || availableSlots.filter((slot) => slot.available).length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={selectedDate ? 'Select a time slot' : 'Select date first'} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSlots.filter((slot) => slot.available).map((slot) => (
                        <SelectItem key={slot.startAt} value={slot.startAt}>
                          {new Date(slot.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {!loadingSlots && selectedDate && availableSlots.filter((slot) => slot.available).length === 0 && (
                  <p className="text-sm text-amber-700">
                    No available slots for this date. Try another day or shorter duration.
                  </p>
                )}
                <div className="text-sm text-muted-foreground">
                  <Clock className="mr-1 inline h-4 w-4" />
                  Duration: {durationLabel} | Total: ${calculateTotal()}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="instructions">Special Instructions (Optional)</Label>
                <Textarea
                  id="instructions"
                  placeholder="Any specific requirements or notes for the service provider..."
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>

              {/* Availability Notice */}
              {provider.availability && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-900">Provider Availability Notes:</p>
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
                  className="min-h-11 flex-1"
                >
                  Cancel
                </Button>
                
                <Button
                  type="submit"
                  disabled={createBooking.isPending || !agreeToTerms || !formData.startAt}
                  className="min-h-11 flex-1"
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