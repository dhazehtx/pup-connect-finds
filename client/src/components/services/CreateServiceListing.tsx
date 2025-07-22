
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, X, Plus } from 'lucide-react';

const CreateServiceListing = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    service_type: '',
    price_type: 'per_service',
    price: '',
    location: '',
    experience_years: '',
    certifications: [],
    service_areas: [],
    availability: {}
  });
  const [newCertification, setNewCertification] = useState('');
  const [newServiceArea, setNewServiceArea] = useState('');

  const serviceTypes = [
    { value: 'grooming', label: 'Pet Grooming' },
    { value: 'walking', label: 'Dog Walking' },
    { value: 'sitting', label: 'Pet Sitting' },
    { value: 'training', label: 'Pet Training' },
    { value: 'veterinary', label: 'Veterinary Care' },
    { value: 'boarding', label: 'Pet Boarding' }
  ];

  const priceTypes = [
    { value: 'hourly', label: 'Per Hour' },
    { value: 'flat_rate', label: 'Flat Rate' },
    { value: 'per_service', label: 'Per Service' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addCertification = () => {
    if (newCertification.trim()) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, newCertification.trim()]
      }));
      setNewCertification('');
    }
  };

  const removeCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const addServiceArea = () => {
    if (newServiceArea.trim()) {
      setFormData(prev => ({
        ...prev,
        service_areas: [...prev.service_areas, newServiceArea.trim()]
      }));
      setNewServiceArea('');
    }
  };

  const removeServiceArea = (index: number) => {
    setFormData(prev => ({
      ...prev,
      service_areas: prev.service_areas.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create a service listing.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('services')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          service_type: formData.service_type,
          price_type: formData.price_type,
          price: parseFloat(formData.price),
          location: formData.location,
          experience_years: parseInt(formData.experience_years) || 0,
          certifications: formData.certifications,
          service_areas: formData.service_areas,
          availability: formData.availability,
          status: 'active'
        });

      if (error) throw error;

      toast({
        title: "Service Created!",
        description: "Your service listing has been created successfully."
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        service_type: '',
        price_type: 'per_service',
        price: '',
        location: '',
        experience_years: '',
        certifications: [],
        service_areas: [],
        availability: {}
      });
    } catch (error: any) {
      console.error('Error creating service:', error);
      toast({
        title: "Error",
        description: "Failed to create service listing. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Create Service Listing</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Service Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Professional Dog Grooming"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="service_type">Service Type</Label>
              <Select value={formData.service_type} onValueChange={(value) => handleInputChange('service_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your service in detail..."
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price_type">Pricing Type</Label>
                <Select value={formData.price_type} onValueChange={(value) => handleInputChange('price_type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priceTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="City, State"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience_years">Years of Experience</Label>
                <Input
                  id="experience_years"
                  type="number"
                  value={formData.experience_years}
                  onChange={(e) => handleInputChange('experience_years', e.target.value)}
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Certifications</Label>
              <div className="flex gap-2">
                <Input
                  value={newCertification}
                  onChange={(e) => setNewCertification(e.target.value)}
                  placeholder="Add certification"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                />
                <Button type="button" onClick={addCertification} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.certifications.map((cert, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {cert}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeCertification(index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Service Areas</Label>
              <div className="flex gap-2">
                <Input
                  value={newServiceArea}
                  onChange={(e) => setNewServiceArea(e.target.value)}
                  placeholder="Add service area"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addServiceArea())}
                />
                <Button type="button" onClick={addServiceArea} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.service_areas.map((area, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {area}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeServiceArea(index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Creating...' : 'Create Service Listing'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateServiceListing;
