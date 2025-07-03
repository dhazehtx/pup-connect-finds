
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useDogListings } from '@/hooks/useDogListings';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';
import MultiMediaUpload from '@/components/listings/MultiMediaUpload';

const CreateListing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createListing, loading } = useDogListings();
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [formData, setFormData] = useState({
    dog_name: '',
    breed: '',
    age: '',
    price: '',
    location: '',
    description: '',
  });

  React.useEffect(() => {
    document.title = 'Create Listing - My Pup';
  }, []);

  const popularBreeds = [
    'Golden Retriever', 'Labrador Retriever', 'German Shepherd', 
    'French Bulldog', 'Bulldog', 'Poodle', 'Beagle', 'Rottweiler',
    'Yorkshire Terrier', 'Dachshund', 'Siberian Husky', 'Boston Terrier'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

    // Validation
    if (!formData.dog_name || !formData.breed || !formData.age || !formData.price) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const listingData = {
        dog_name: formData.dog_name,
        breed: formData.breed,
        age: parseInt(formData.age),
        price: parseFloat(formData.price),
        location: formData.location || undefined,
        description: formData.description || undefined,
        image_url: imageUrls.length > 0 ? imageUrls[0] : undefined, // Use first image as primary
        video_url: videoUrl || undefined,
        status: 'active' as const,
      };

      const newListing = await createListing(listingData);
      
      if (newListing) {
        toast({
          title: "Listing created successfully!",
          description: "Your puppy listing is now live",
        });
        navigate(`/listing/${newListing.id}`);
      }
    } catch (error: any) {
      console.error('Error creating listing:', error);
      toast({
        title: "Failed to create listing",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="border-blue-200 shadow-sm max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h1>
            <p className="text-gray-600 mb-6">Please sign in to create a listing</p>
            <Button onClick={() => navigate('/auth')} className="bg-blue-600 hover:bg-blue-700">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/profile')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Listing</h1>
          <p className="text-gray-600">Share your puppy with loving families</p>
        </div>

        {/* Form */}
        <Card className="border-blue-200 shadow-sm">
          <CardHeader>
            <CardTitle>Puppy Details</CardTitle>
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

              {/* Puppy Name */}
              <div className="space-y-2">
                <Label htmlFor="dog_name">Puppy Name *</Label>
                <Input
                  id="dog_name"
                  name="dog_name"
                  value={formData.dog_name}
                  onChange={handleInputChange}
                  placeholder="Enter puppy's name"
                  required
                />
              </div>

              {/* Breed */}
              <div className="space-y-2">
                <Label htmlFor="breed">Breed *</Label>
                <select
                  id="breed"
                  name="breed"
                  value={formData.breed}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                  required
                >
                  <option value="">Select a breed</option>
                  {popularBreeds.map(breed => (
                    <option key={breed} value={breed}>{breed}</option>
                  ))}
                  <option value="Mixed Breed">Mixed Breed</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Age and Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age (months) *</Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    min="1"
                    max="24"
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="8"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($) *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="1500"
                    required
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="City, State"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Tell potential families about your puppy's personality, health, and any special care instructions..."
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Listing...
                  </>
                ) : (
                  'Create Listing'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateListing;
