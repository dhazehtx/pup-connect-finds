
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDogListings } from '@/hooks/useDogListings';

interface CreateListingFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CreateListingForm = ({ onSuccess, onCancel }: CreateListingFormProps) => {
  const { createListing } = useDogListings();
  const [formData, setFormData] = useState({
    dog_name: '',
    breed: '',
    age: '',
    price: '',
    image_url: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.dog_name || !formData.breed || !formData.age || !formData.price) {
      return;
    }

    try {
      setLoading(true);
      await createListing({
        dog_name: formData.dog_name,
        breed: formData.breed,
        age: parseInt(formData.age),
        price: parseFloat(formData.price),
        image_url: formData.image_url || undefined,
      });
      
      setFormData({
        dog_name: '',
        breed: '',
        age: '',
        price: '',
        image_url: '',
      });
      
      onSuccess?.();
    } catch (error) {
      console.error('Error creating listing:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Dog Listing</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dog_name">Dog Name *</Label>
            <Input
              id="dog_name"
              name="dog_name"
              value={formData.dog_name}
              onChange={handleChange}
              placeholder="Enter dog's name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="breed">Breed *</Label>
            <Input
              id="breed"
              name="breed"
              value={formData.breed}
              onChange={handleChange}
              placeholder="Enter breed"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Age (months) *</Label>
            <Input
              id="age"
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              placeholder="Enter age in months"
              min="1"
              required
            />
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
              placeholder="Enter price"
              min="0"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">Image URL (optional)</Label>
            <Input
              id="image_url"
              name="image_url"
              type="url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="Enter image URL"
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Creating...' : 'Create Listing'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
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
