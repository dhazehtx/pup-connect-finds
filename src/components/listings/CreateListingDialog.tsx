
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useCreateListing } from '@/hooks/useCreateListing';
import { useImageUpload } from '@/hooks/useImageUpload';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { listingSchema, ListingFormData } from './listingSchema';
import ListingFormFields from './ListingFormFields';
import ListingImageUpload from './ListingImageUpload';

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
            <ListingFormFields form={form} />
            <ListingImageUpload 
              selectedImages={selectedImages}
              onImagesChange={setSelectedImages}
            />

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
