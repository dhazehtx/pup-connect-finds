
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateListing } from '@/hooks/useCreateListing';
import { useImageUpload } from '@/hooks/useImageUpload';
import { Plus, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const listingSchema = z.object({
  dog_name: z.string().min(2, 'Dog name must be at least 2 characters'),
  breed: z.string().min(2, 'Breed is required'),
  age: z.number().min(0, 'Age must be a positive number').max(25, 'Age must be realistic'),
  price: z.number().min(1, 'Price must be greater than 0'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location: z.string().min(2, 'Location is required'),
});

type ListingFormData = z.infer<typeof listingSchema>;

interface CreateListingDialogProps {
  onSuccess?: () => void;
}

const CreateListingDialog = ({ onSuccess }: CreateListingDialogProps) => {
  const [open, setOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const { createListing, loading } = useCreateListing();
  const { uploadImage, uploading } = useImageUpload();
  const { toast } = useToast();

  const form = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      dog_name: '',
      breed: '',
      age: 0,
      price: 0,
      description: '',
      location: '',
    },
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedImages.length > 5) {
      toast({
        title: "Too many images",
        description: "You can upload up to 5 images per listing.",
        variant: "destructive",
      });
      return;
    }
    setSelectedImages(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ListingFormData) => {
    try {
      let imageUrl = '';
      
      // Upload first image as main image
      if (selectedImages.length > 0) {
        const uploadedUrl = await uploadImage(selectedImages[0], `listing-${Date.now()}`);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      // Ensure all required fields are present and properly typed
      const listingData = {
        dog_name: data.dog_name,
        breed: data.breed,
        age: data.age,
        price: data.price,
        description: data.description,
        location: data.location,
        image_url: imageUrl,
      };

      const result = await createListing(listingData);
      if (result) {
        toast({
          title: "Success",
          description: "Your listing has been created successfully!",
        });
        setOpen(false);
        form.reset();
        setSelectedImages([]);
        onSuccess?.();
      }
    } catch (error) {
      console.error('Error creating listing:', error);
    }
  };

  const popularBreeds = [
    'Labrador Retriever', 'Golden Retriever', 'German Shepherd', 'Bulldog',
    'Poodle', 'Beagle', 'Rottweiler', 'Yorkshire Terrier', 'Dachshund',
    'Siberian Husky', 'Great Dane', 'Chihuahua', 'Border Collie', 'Boxer'
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Create Listing
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Listing</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dog_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dog Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Buddy" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="breed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Breed</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a breed" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {popularBreeds.map((breed) => (
                          <SelectItem key={breed} value={breed}>
                            {breed}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age (years)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g., 2" 
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g., 1200" 
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., San Francisco, CA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us about your dog..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image Upload Section */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Photos (up to 5)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-gray-600">Click to upload photos</span>
                </label>
              </div>

              {selectedImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {selectedImages.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || uploading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading || uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    {uploading ? 'Uploading...' : 'Creating...'}
                  </>
                ) : (
                  'Create Listing'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateListingDialog;
