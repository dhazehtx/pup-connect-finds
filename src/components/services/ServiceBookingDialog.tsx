
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { CalendarIcon, Clock, DollarSign } from 'lucide-react';

interface Service {
  id: string;
  title: string;
  price: number;
  price_type: string;
  provider_name: string;
  user_id: string;
}

interface ServiceBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service | null;
  onBookingSuccess: () => void;
}

const ServiceBookingDialog = ({ open, onOpenChange, service, onBookingSuccess }: ServiceBookingDialogProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState('1');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', 
    '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  const calculateTotal = () => {
    if (!service) return 0;
    
    if (service.price_type === 'hourly') {
      return service.price * parseFloat(duration);
    }
    return service.price;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !service || !selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const totalAmount = calculateTotal();
      const commissionAmount = totalAmount * 0.12; // 12% commission
      
      const { error } = await supabase.from('service_bookings').insert({
        service_id: service.id,
        customer_id: user.id,
        provider_id: service.user_id,
        booking_date: selectedDate.toISOString().split('T')[0],
        booking_time: selectedTime,
        duration_hours: service.price_type === 'hourly' ? parseFloat(duration) : null,
        total_amount: totalAmount,
        commission_amount: commissionAmount,
        customer_notes: notes,
        status: 'pending'
      });

      if (error) throw error;

      toast({
        title: "Booking Requested",
        description: "Your booking request has been sent to the service provider",
      });

      onBookingSuccess();
      onOpenChange(false);
      
      // Reset form
      setSelectedDate(undefined);
      setSelectedTime('');
      setDuration('1');
      setNotes('');

    } catch (error: any) {
      toast({
        title: "Booking Failed",
        description: error.message || "Unable to create booking",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!service) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Book {service.title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Service Provider</Label>
            <p className="text-sm text-gray-600">{service.provider_name}</p>
          </div>

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
            <Label>Select Time</Label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {timeSlots.map((time) => (
                <Button
                  key={time}
                  type="button"
                  variant={selectedTime === time ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTime(time)}
                  className="text-xs"
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>

          {service.price_type === 'hourly' && (
            <div>
              <Label htmlFor="duration">Duration (hours)</Label>
              <Input
                id="duration"
                type="number"
                min="0.5"
                step="0.5"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any special requests or information..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium">Total Cost:</span>
              <span className="text-xl font-bold">${calculateTotal()}</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Includes 12% platform fee
            </p>
          </div>

          <div className="flex gap-2">
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
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Booking...' : 'Request Booking'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceBookingDialog;
