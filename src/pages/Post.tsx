
import React, { useState } from 'react';
import { ArrowLeft, Camera, Image, MapPin, X, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import { useImageUpload, UploadedImage } from '@/hooks/useImageUpload';
import { useDogListings } from '@/hooks/useDogListings';
import { useAuth } from '@/contexts/AuthContext';

const Post = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [caption, setCaption] = useState('');
  const [dogName, setDogName] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedImage[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { uploadMultipleImages, uploading, uploadProgress } = useImageUpload();
  const { createListing } = useDogListings();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: "Please select images smaller than 5MB.",
            variant: "destructive",
          });
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const newPhoto: UploadedImage = {
            id: Math.random().toString(36).substr(2, 9),
            url: e.target?.result as string,
            file: file
          };
          setUploadedPhotos(prev => [...prev, newPhoto]);
        };
        reader.readAsDataURL(file);
      }
    });
    
    event.target.value = '';
  };

  const removePhoto = (photoId: string) => {
    setUploadedPhotos(prev => prev.filter(photo => photo.id !== photoId));
  };

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags(prev => [...prev, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleShare = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a listing.",
        variant: "destructive",
      });
      return;
    }

    if (uploadedPhotos.length === 0) {
      toast({
        title: "No photos selected",
        description: "Please add at least one photo to your listing.",
        variant: "destructive",
      });
      return;
    }

    if (!dogName.trim()) {
      toast({
        title: "Dog name required",
        description: "Please provide the dog's name.",
        variant: "destructive",
      });
      return;
    }

    if (!breed.trim()) {
      toast({
        title: "Breed required",
        description: "Please specify the dog's breed.",
        variant: "destructive",
      });
      return;
    }

    if (!age.trim() || isNaN(Number(age))) {
      toast({
        title: "Age required",
        description: "Please provide a valid age in months.",
        variant: "destructive",
      });
      return;
    }

    if (!price.trim() || isNaN(Number(price))) {
      toast({
        title: "Price required",
        description: "Please provide a valid price.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Upload images first
      const uploadedImages = await uploadMultipleImages(uploadedPhotos);
      
      // Check if any uploads failed
      const failedUploads = uploadedImages.filter(img => !img.uploadedUrl);
      if (failedUploads.length > 0) {
        toast({
          title: "Upload incomplete",
          description: "Some images failed to upload. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Create the listing
      await createListing({
        dog_name: dogName.trim(),
        breed: breed.trim(),
        age: parseInt(age),
        price: parseFloat(price),
        image_url: uploadedImages[0]?.uploadedUrl || null,
        status: 'active',
        description: caption.trim() || undefined,
        location: location.trim() || undefined,
      });

      toast({
        title: "Listing created!",
        description: "Your dog listing has been published successfully.",
      });
      
      navigate('/explore');
    } catch (error) {
      console.error('Error creating listing:', error);
      toast({
        title: "Error",
        description: "Failed to create listing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <div className="p-4 flex items-center justify-between bg-white">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold">New Listing</h1>
        <Button 
          onClick={handleShare}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2"
          disabled={uploading || isSubmitting}
        >
          {isSubmitting ? 'Publishing...' : 'Publish'}
        </Button>
      </div>

      <div className="p-4 space-y-6">
        {/* Dog Details */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Dog Name *</label>
            <Input
              value={dogName}
              onChange={(e) => setDogName(e.target.value)}
              placeholder="Enter dog's name"
              className="border-gray-200 focus:border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Breed *</label>
            <Input
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              placeholder="Enter breed (e.g., Golden Retriever)"
              className="border-gray-200 focus:border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Age (months) *</label>
              <Input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Age in months"
                min="0"
                className="border-gray-200 focus:border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Price ($) *</label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Price in USD"
                min="0"
                step="0.01"
                className="border-gray-200 focus:border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Photo Upload Section */}
        <div className="space-y-4">
          <label className="block text-sm font-medium">Photos *</label>
          {uploadedPhotos.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {uploadedPhotos.map((photo) => (
                <div key={photo.id} className="relative aspect-square">
                  <img
                    src={photo.url}
                    alt="Upload preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  {uploadProgress[photo.id] !== undefined && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                      <div className="w-3/4">
                        <Progress value={uploadProgress[photo.id]} className="h-2" />
                        <p className="text-white text-xs mt-1 text-center">
                          {uploadProgress[photo.id]}%
                        </p>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => removePhoto(photo.id)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    disabled={uploading}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              {uploadedPhotos.length < 10 && (
                <label className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <Plus size={24} className="text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Add Photo</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              )}
            </div>
          ) : (
            <label className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
              <div className="text-center">
                <Camera size={48} className="text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 mb-2">Add Photos</p>
                <p className="text-xs text-gray-400">Upload up to 10 photos (max 5MB each)</p>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <Textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Describe your dog, temperament, health info, etc..."
            className="min-h-[100px] resize-none border-gray-200 focus:border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0 focus:outline-none"
            maxLength={500}
          />
          <div className="text-right text-xs text-gray-500 mt-1">
            {caption.length}/500
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium mb-2">Location</label>
          <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
            <MapPin size={20} className="text-gray-400" />
            <Input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, State"
              className="border-0 p-0 focus-visible:ring-0 focus:ring-0 focus:outline-none"
            />
          </div>
        </div>

        {/* Camera and Gallery Options */}
        <div className="grid grid-cols-2 gap-3">
          <label className="p-3 border border-gray-200 rounded-lg flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors">
            <Camera size={20} />
            <span>Camera</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
          <label className="p-3 border border-gray-200 rounded-lg flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors">
            <Image size={20} />
            <span>Gallery</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default Post;
