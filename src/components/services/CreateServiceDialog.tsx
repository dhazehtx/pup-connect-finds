
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CreateServiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onServiceCreated: () => void;
}

const CreateServiceDialog = ({ isOpen, onClose, onServiceCreated }: CreateServiceDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    business_name: '',
    description: '',
    location: '',
    service_types: [] as string[],
    hourly_rate: '',
    session_rate: ''
  });

  const serviceTypes = [
    { id: 'grooming', label: 'Pet Grooming' },
    { id: 'walking', label: 'Dog Walking' },
    { id: 'training', label: 'Pet Training' },
    { id: 'veterinary', label: 'Veterinary Services' },
    { id: 'boarding', label: 'Pet Boarding' },
    { id: 'sitting', label: 'Pet Sitting' }
  ];

  const handleServiceTypeChange = (serviceId: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        service_types: [...prev.service_types, serviceId]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        service_types: prev.service_types.filter(id => id !== serviceId)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a service listing",
        variant: "destructive"
      });
      return;
    }

    if (formData.service_types.length === 0) {
      toast({
        title: "Service type required",
        description: "Please select at least one service type",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const pricing = {};
      if (formData.hourly_rate) pricing.hourly = parseFloat(formData.hourly_rate);
      if (formData.session_rate) pricing.session = parseFloat(formData.session_rate);

      const { error } = await supabase.from('service_providers').insert({
        user_id: user.id,
        business_name: formData.business_name,
        description: formData.description,
        location: formData.location,
        service_types: formData.service_types,
        pricing
      });

      if (error) throw error;

      toast({
        title: "Service created!",
        description: "Your service listing is now live"
      });

      onServiceCreated();
      onClose();
      setFormData({
        business_name: '',
        description: '',
        location: '',
        service_types: [],
        hourly_rate: '',
        session_rate: ''
      });
    } catch (error) {
      console.error('Service creation error:', error);
      toast({
        title: "Creation failed",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Service Listing</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Business Name</label>
            <Input
              value={formData.business_name}
              onChange={(e) => setFormData({...formData, business_name: e.target.value})}
              placeholder="Your business or service name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              placeholder="City, State or ZIP code"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Service Types</label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {serviceTypes.map((service) => (
                <div key={service.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={service.id}
                    checked={formData.service_types.includes(service.id)}
                    onCheckedChange={(checked) => handleServiceTypeChange(service.id, checked as boolean)}
                  />
                  <label htmlFor={service.id} className="text-sm">
                    {service.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Hourly Rate ($)</label>
              <Input
                type="number"
                value={formData.hourly_rate}
                onChange={(e) => setFormData({...formData, hourly_rate: e.target.value})}
                placeholder="50"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Session Rate ($)</label>
              <Input
                type="number"
                value={formData.session_rate}
                onChange={(e) => setFormData({...formData, session_rate: e.target.value})}
                placeholder="75"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe your services, experience, and what makes you special..."
              rows={4}
              required
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Commission:</strong> My Pup charges a 15% service fee on completed bookings.
            </p>
          </div>

          <div className="flex space-x-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700">
              {loading ? 'Creating...' : 'Create Service'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateServiceDialog;
