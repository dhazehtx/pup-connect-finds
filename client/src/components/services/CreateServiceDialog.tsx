
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CreateServiceDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onServiceCreated: () => void;
}

type ServiceType = 'grooming' | 'walking' | 'training' | 'veterinary' | 'boarding' | 'sitting';

const CreateServiceDialog = ({ isOpen, onOpenChange, onServiceCreated }: CreateServiceDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    business_name: '',
    description: '',
    location: '',
    service_types: [] as ServiceType[],
    hourly_rate: '',
    session_rate: ''
  });

  const serviceOptions: { value: ServiceType; label: string }[] = [
    { value: 'grooming', label: 'Pet Grooming' },
    { value: 'walking', label: 'Dog Walking' },
    { value: 'training', label: 'Training' },
    { value: 'veterinary', label: 'Veterinary Care' },
    { value: 'boarding', label: 'Pet Boarding' },
    { value: 'sitting', label: 'Pet Sitting' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const pricing = {
        hourly: parseFloat(formData.hourly_rate) || 0,
        session: parseFloat(formData.session_rate) || 0
      };

      const { error } = await supabase
        .from('service_providers')
        .insert({
          user_id: user.id,
          business_name: formData.business_name,
          description: formData.description,
          location: formData.location,
          service_types: formData.service_types,
          pricing: pricing
        });

      if (error) throw error;

      toast({
        title: "Service created!",
        description: "Your service listing has been created successfully.",
      });

      onServiceCreated();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        business_name: '',
        description: '',
        location: '',
        service_types: [],
        hourly_rate: '',
        session_rate: ''
      });
    } catch (error) {
      console.error('Error creating service:', error);
      toast({
        title: "Error",
        description: "Failed to create service listing",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleServiceTypeChange = (serviceType: ServiceType, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      service_types: checked 
        ? [...prev.service_types, serviceType]
        : prev.service_types.filter(type => type !== serviceType)
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Service Listing</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="business_name">Business Name</Label>
            <Input
              id="business_name"
              value={formData.business_name}
              onChange={(e) => setFormData({...formData, business_name: e.target.value})}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              placeholder="City, State"
              required
            />
          </div>

          <div>
            <Label>Service Types</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {serviceOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.value}
                    checked={formData.service_types.includes(option.value)}
                    onCheckedChange={(checked) => 
                      handleServiceTypeChange(option.value, checked as boolean)
                    }
                  />
                  <Label htmlFor={option.value} className="text-sm">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
              <Input
                id="hourly_rate"
                type="number"
                value={formData.hourly_rate}
                onChange={(e) => setFormData({...formData, hourly_rate: e.target.value})}
                placeholder="50"
              />
            </div>
            <div>
              <Label htmlFor="session_rate">Session Rate ($)</Label>
              <Input
                id="session_rate"
                type="number"
                value={formData.session_rate}
                onChange={(e) => setFormData({...formData, session_rate: e.target.value})}
                placeholder="75"
              />
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
              disabled={loading || formData.service_types.length === 0}
              className="flex-1"
            >
              {loading ? "Creating..." : "Create Service"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateServiceDialog;
