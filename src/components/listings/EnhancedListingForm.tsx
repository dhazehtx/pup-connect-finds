
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import MultiMediaUpload from './MultiMediaUpload';

interface EnhancedListingFormData {
  dog_name: string;
  breed: string;
  age: number;
  price: number;
  description: string;
  location: string;
  gender: 'Male' | 'Female' | 'Unknown';
  size: 'Small' | 'Medium' | 'Large';
  color: string;
  vaccinated: boolean;
  neutered_spayed: boolean;
  good_with_kids: boolean;
  good_with_dogs: boolean;
  special_needs: boolean;
  rehoming: boolean;
  delivery_available: boolean;
  images: string[];
  videos: string[];
}

interface EnhancedListingFormProps {
  onSubmit: (data: EnhancedListingFormData) => void;
  loading?: boolean;
  initialData?: Partial<EnhancedListingFormData>;
}

const EnhancedListingForm = ({ onSubmit, loading = false, initialData }: EnhancedListingFormProps) => {
  const [formData, setFormData] = useState<EnhancedListingFormData>({
    dog_name: '',
    breed: '',
    age: 0,
    price: 0,
    description: '',
    location: '',
    gender: 'Unknown',
    size: 'Medium',
    color: '',
    vaccinated: false,
    neutered_spayed: false,
    good_with_kids: false,
    good_with_dogs: false,
    special_needs: false,
    rehoming: false,
    delivery_available: false,
    images: [],
    videos: [],
    ...initialData
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field: keyof EnhancedListingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBooleanChange = (field: keyof EnhancedListingFormData, checked: boolean) => {
    setFormData(prev => ({ ...prev, [field]: checked }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dog_name">Dog Name *</Label>
              <Input
                id="dog_name"
                value={formData.dog_name}
                onChange={(e) => handleInputChange('dog_name', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="breed">Breed *</Label>
              <Input
                id="breed"
                value={formData.breed}
                onChange={(e) => handleInputChange('breed', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="age">Age (weeks) *</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                required
              />
            </div>
            <div>
              <Label htmlFor="price">Price ($) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                required
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="City, State"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              placeholder="Tell us about this dog..."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Physical Characteristics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Gender</Label>
              <Select value={formData.gender} onValueChange={(value: 'Male' | 'Female' | 'Unknown') => handleInputChange('gender', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Size</Label>
              <Select value={formData.size} onValueChange={(value: 'Small' | 'Medium' | 'Large') => handleInputChange('size', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Small">Small</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
                placeholder="e.g., Black, Brown, White"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Health & Behavior</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="vaccinated"
                checked={formData.vaccinated}
                onCheckedChange={(checked) => handleBooleanChange('vaccinated', checked as boolean)}
              />
              <Label htmlFor="vaccinated">Vaccinated</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="neutered_spayed"
                checked={formData.neutered_spayed}
                onCheckedChange={(checked) => handleBooleanChange('neutered_spayed', checked as boolean)}
              />
              <Label htmlFor="neutered_spayed">Neutered/Spayed</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="good_with_kids"
                checked={formData.good_with_kids}
                onCheckedChange={(checked) => handleBooleanChange('good_with_kids', checked as boolean)}
              />
              <Label htmlFor="good_with_kids">Good with Kids</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="good_with_dogs"
                checked={formData.good_with_dogs}
                onCheckedChange={(checked) => handleBooleanChange('good_with_dogs', checked as boolean)}
              />
              <Label htmlFor="good_with_dogs">Good with Dogs</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="special_needs"
                checked={formData.special_needs}
                onCheckedChange={(checked) => handleBooleanChange('special_needs', checked as boolean)}
              />
              <Label htmlFor="special_needs">Special Needs</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rehoming"
                checked={formData.rehoming}
                onCheckedChange={(checked) => handleBooleanChange('rehoming', checked as boolean)}
              />
              <Label htmlFor="rehoming">This is a rehoming listing</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="delivery_available"
                checked={formData.delivery_available}
                onCheckedChange={(checked) => handleBooleanChange('delivery_available', checked as boolean)}
              />
              <Label htmlFor="delivery_available">Delivery Available</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Photos & Videos</CardTitle>
        </CardHeader>
        <CardContent>
          <MultiMediaUpload
            onImagesChange={(images) => handleInputChange('images', images)}
            onVideoChange={(video) => handleInputChange('videos', video ? [video] : [])}
          />
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Creating Listing...' : 'Create Listing'}
      </Button>
    </form>
  );
};

export default EnhancedListingForm;
