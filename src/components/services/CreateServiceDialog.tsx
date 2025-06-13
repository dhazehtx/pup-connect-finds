
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface CreateServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onServiceCreated: () => void;
}

const CreateServiceDialog = ({ open, onOpenChange, onServiceCreated }: CreateServiceDialogProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    service_type: '',
    price: '',
    price_type: 'hourly',
    location: '',
    experience_years: '',
    certifications: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const serviceTypes = [
    { value: 'grooming', label: 'Dog Grooming' },
    { value: 'sitting', label: 'Dog Sitting' },
    { value: 'walking', label: 'Dog Walking' },
    { value: 'training', label: 'Dog Training' },
    { value: 'boarding', label: 'Dog Boarding' }
  ];

  const priceTypes = [
    { value: 'hourly', label: 'Per Hour' },
    { value: 'fixed', label: 'Fixed Price' },
    { value: 'per_session', label: 'Per Session' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create a service",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const certifications = formData.certifications
        ? formData.certifications.split(',').map(cert => cert.trim())
        : [];

      const { error } = await supabase.from('services').insert({
        title: formData.title,
        description: formData.description,
        service_type: formData.service_type,
        price: parseFloat(formData.price),
        price_type: formData.price_type,
        location: formData.location,
        experience_years: parseInt(formData.experience_years) || 0,
        certifications,
        user_id: user.id,
        status: 'active'
      });

      if (error) throw error;

      toast({
        title: "Service Created",
        description: "Your service has been successfully listed",
      });

      onServiceCreated();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        service_type: '',
        price: '',
        price_type: 'hourly',
        location: '',
        experience_years: '',
        certifications: ''
      });

    } catch (error: any) {
      toast({
        title: "Creation Failed",
        description: error.message || "Unable to create service",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Service</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Service Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Professional Dog Grooming"
              required
            />
          </div>

          <div>
            <Label htmlFor="service_type">Service Type</Label>
            <Select value={formData.service_type} onValueChange={(value) => handleInputChange('service_type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                {serviceTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="price_type">Price Type</Label>
              <Select value={formData.price_type} onValueChange={(value) => handleInputChange('price_type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priceTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="City, State"
              required
            />
          </div>

          <div>
            <Label htmlFor="experience_years">Years of Experience</Label>
            <Input
              id="experience_years"
              type="number"
              min="0"
              value={formData.experience_years}
              onChange={(e) => handleInputChange('experience_years', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="certifications">Certifications (comma-separated)</Label>
            <Input
              id="certifications"
              value={formData.certifications}
              onChange={(e) => handleInputChange('certifications', e.target.value)}
              placeholder="e.g., Professional Groomer Certification, Pet First Aid"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your service, experience, and what makes you special..."
              required
            />
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
              {isSubmitting ? 'Creating...' : 'Create Service'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateServiceDialog;
