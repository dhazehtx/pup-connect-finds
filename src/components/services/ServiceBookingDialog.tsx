
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Service {
  id: string;
  user_id: string;
  business_name: string;
  service_types: string[];
  description: string;
  location: string;
  pricing: { hourly?: number; session?: number };
  rating: number;
  total_bookings: number;
  verified: boolean;
}

interface ServiceBookingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service | null;
  onBookingSuccess: () => void;
}

const ServiceBookingDialog = ({ isOpen, onOpenChange, service, onBookingSuccess }: ServiceBookingDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [formData, setFormData] = useState({
    time: '',
    duration: '1',
    notes: ''
  });

  if (!service) return null;

  const calculateTotal = () => {
    const duration = parseFloat(formData.duration);
    const hourlyRate = service.pricing?.hourly || 0;
    return hourlyRate * duration;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedDate) return;

    setLoading(true);
    try {
      const totalAmount = calculateTotal();
      const commissionAmount = totalAmount * 0.15;

      const { error } = await supabase
        .from('service_bookings')
        .insert({
          customer_id: user.id,
          provider_id: service.user_id,
          service_id: service.id,
          booking_date: selectedDate.toISOString().split('T')[0],
          booking_time: formData.time,
          duration_hours: parseFloat(formData.duration),
          total_amount: totalAmount,
          commission_amount: commissionAmount,
          customer_notes: formData.notes
        });

      if (error) throw error;

      toast({
        title: "Booking requested!",
        description: "Your booking request has been sent to the provider.",
      });

      onBookingSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Error",
        description: "Failed to create booking",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Book {service.business_name}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Select Date</Label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date()}
              className="rounded-md border"
            />
          </div>

          <div>
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({...formData, time: e.target.value})}
              required
            />
          </div>

          <div>
            <Label htmlFor="duration">Duration (hours)</Label>
            <Input
              id="duration"
              type="number"
              step="0.5"
              min="0.5"
              value={formData.duration}
              onChange={(e) => setFormData({...formData, duration: e.target.value})}
              required
            />
          </div>

          <div>
            <Label htmlFor="notes">Special Requests</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Any special instructions..."
              rows={2}
            />
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total:</span>
              <span className="text-lg font-bold">${calculateTotal().toFixed(2)}</span>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !selectedDate}
              className="flex-1"
            >
              {loading ? "Booking..." : "Book Service"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceBookingDialog;
