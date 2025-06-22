
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, DollarSign, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ServiceProvider {
  id: string;
  business_name: string;
  service_types: string[];
  description: string;
  location: string;
  pricing: any;
  rating: number;
  user_id: string;
}

interface ServiceBookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  provider: ServiceProvider;
  onBookingComplete: () => void;
}

const ServiceBookingDialog = ({ isOpen, onClose, provider, onBookingComplete }: ServiceBookingDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    service_type: '',
    booking_date: '',
    booking_time: '',
    duration_hours: 1,
    customer_notes: ''
  });

  const calculateTotal = () => {
    const serviceRate = provider.pricing?.[formData.service_type] || provider.pricing?.hourly || 50;
    const subtotal = serviceRate * formData.duration_hours;
    const commission = subtotal * 0.15;
    return {
      subtotal: subtotal.toFixed(2),
      commission: commission.toFixed(2),
      total: subtotal.toFixed(2)
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to book a service",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const costs = calculateTotal();
      
      const { error } = await supabase.from('service_bookings').insert({
        customer_id: user.id,
        provider_id: provider.user_id,
        service_id: provider.id,
        service_type: formData.service_type,
        booking_date: formData.booking_date,
        booking_time: formData.booking_time,
        duration_hours: formData.duration_hours,
        total_amount: parseFloat(costs.total),
        commission_amount: parseFloat(costs.commission),
        customer_notes: formData.customer_notes,
        status: 'pending'
      });

      if (error) throw error;

      toast({
        title: "Booking request sent!",
        description: "The service provider will confirm your booking soon."
      });

      onBookingComplete();
      onClose();
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: "Booking failed",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const costs = calculateTotal();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>Book Service with {provider.business_name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">{provider.business_name}</h4>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 text-gray-500 mr-1" />
                <span className="text-sm text-gray-600">{provider.location}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {provider.service_types.map((service) => (
                <Badge key={service} variant="secondary" className="text-xs">
                  {service}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Service Type</label>
            <Select 
              value={formData.service_type} 
              onValueChange={(value) => setFormData({...formData, service_type: value})}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select service" />
              </SelectTrigger>
              <SelectContent>
                {provider.service_types.map((service) => (
                  <SelectItem key={service} value={service}>
                    {service.charAt(0).toUpperCase() + service.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <Input
                type="date"
                value={formData.booking_date}
                onChange={(e) => setFormData({...formData, booking_date: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Time</label>
              <Input
                type="time"
                value={formData.booking_time}
                onChange={(e) => setFormData({...formData, booking_time: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Duration (hours)</label>
            <Select 
              value={formData.duration_hours.toString()} 
              onValueChange={(value) => setFormData({...formData, duration_hours: parseFloat(value)})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[0.5, 1, 1.5, 2, 3, 4, 6, 8].map((hours) => (
                  <SelectItem key={hours} value={hours.toString()}>
                    {hours} {hours === 1 ? 'hour' : 'hours'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Special Requests</label>
            <Textarea
              value={formData.customer_notes}
              onChange={(e) => setFormData({...formData, customer_notes: e.target.value})}
              placeholder="Any special instructions or requirements..."
              rows={3}
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium mb-2 flex items-center">
              <DollarSign className="w-4 h-4 mr-1" />
              Booking Summary
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Service Fee:</span>
                <span>${costs.subtotal}</span>
              </div>
              <div className="flex justify-between font-medium border-t pt-1">
                <span>Total:</span>
                <span>${costs.total}</span>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Payment will be processed after service confirmation
              </p>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700">
              {loading ? 'Booking...' : 'Book Service'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceBookingDialog;
