
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDogListings } from '@/hooks/useDogListings';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import MultiMediaUpload from './MultiMediaUpload';

interface CreateListingFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

const popularBreeds = [
  'Labrador Retriever', 'Golden Retriever', 'German Shepherd', 'French Bulldog',
  'Bulldog', 'Poodle', 'Beagle', 'Rottweiler', 'Yorkshire Terrier', 'Dachshund',
  'Siberian Husky', 'Boston Terrier', 'Boxer', 'Border Collie', 'Chihuahua',
  'Shih Tzu', 'Australian Shepherd', 'Pomeranian', 'Cocker Spaniel', 'Mixed Breed'
];

const CreateListingForm = ({ onSuccess, onCancel, className }: CreateListingFormProps) => {
  const { createListing, loading } = useDogListings();
  const { user } = useAuth();
  const { toast } = useToast();
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string>('');
  
  const [formData, setFormData] = useState({
    dog_name: '',
    breed: '',
    age: '',
    price: '',
    description: '',
    location: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.dog_name.trim()) {
      newErrors.dog_name = 'Dog name is required';
    }

    if (!formData.breed) {
      newErrors.breed = 'Breed is required';
    }

    if (!formData.age || parseInt(formData.age) < 1 || parseInt(formData.age) > 240) {
      newErrors.age = 'Please enter a valid age (1-240 months)';
    }

    if (!formData.price || parseFloat(formData.price) < 0) {
      newErrors.price = 'Please enter a valid price';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a listing",
        variant: "destructive",
      });
      return;
    }

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      await createListing({
        dog_name: formData.dog_name.trim(),
        breed: formData.breed,
        age: parseInt(formData.age),
        price: parseFloat(formData.price),
        description: formData.description.trim() || undefined,
        location: formData.location.trim() || undefined,
        image_url: imageUrls.length > 0 ? imageUrls[0] : undefined,
        video_url: videoUrl || undefined,
        status: 'active',
      });
      
      // Reset form
      setFormData({
        dog_name: '',
        breed: '',
        age: '',
        price: '',
        description: '',
        location: '',
      });
      setImageUrls([]);
      setVideoUrl('');
      setErrors({});
      
      onSuccess?.();
    } catch (error) {
      console.error('Error creating listing:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const isFormValid = formData.dog_name && formData.breed && formData.age && formData.price;

  return (
    <Card className={`w-full max-w-2xl mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Create New Dog Listing
          <Badge variant="secondary">Fill out all required fields *</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Media Upload */}
          <div className="space-y-2">
            <Label>Photos & Video</Label>
            <MultiMediaUpload
              onImagesChange={setImageUrls}
              onVideoChange={setVideoUrl}
              className="w-full"
            />
          </div>

          {/* Dog Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dog_name">Dog Name *</Label>
              <Input
                id="dog_name"
                name="dog_name"
                value={formData.dog_name}
                onChange={handleChange}
                placeholder="Enter dog's name"
                className={errors.dog_name ? 'border-red-500' : ''}
                required
              />
              {errors.dog_name && <p className="text-sm text-red-600">{errors.dog_name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="breed">Breed *</Label>
              <select
                id="breed"
                name="breed"
                value={formData.breed}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md bg-background text-sm ${errors.breed ? 'border-red-500' : 'border-input'}`}
                required
              >
                <option value="">Select a breed</option>
                {popularBreeds.map(breed => (
                  <option key={breed} value={breed}>{breed}</option>
                ))}
              </select>
              {errors.breed && <p className="text-sm text-red-600">{errors.breed}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age (months) *</Label>
              <Input
                id="age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                placeholder="Age in months"
                min="1"
                max="240"
                className={errors.age ? 'border-red-500' : ''}
                required
              />
              {errors.age && <p className="text-sm text-red-600">{errors.age}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price ($) *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                placeholder="Price in USD"
                min="0"
                className={errors.price ? 'border-red-500' : ''}
                required
              />
              {errors.price && <p className="text-sm text-red-600">{errors.price}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="City, State"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your dog's temperament, health, training, etc..."
              rows={4}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting || !isFormValid}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Listing...
                </>
              ) : (
                'Create Listing'
              )}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="px-8">
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateListingForm;
