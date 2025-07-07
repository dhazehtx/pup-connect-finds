
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { useDogListings } from '@/hooks/useDogListings';
import { useToast } from '@/hooks/use-toast';
import { listingFormSchema, ListingFormData } from './listingSchema';
import ListingFormFields from './ListingFormFields';

interface CreateListingFormProps {
  onSuccess?: () => void;
  className?: string;
}

const CreateListingForm = ({ onSuccess, className = "" }: CreateListingFormProps) => {
  const { user } = useAuth();
  const { createListing, loading } = useDogListings();
  const { toast } = useToast();

  const form = useForm<ListingFormData>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
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
      listing_status: 'active',
      images: [],
      video_url: '',
    },
  });

  const onSubmit = async (data: ListingFormData) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a listing",
        variant: "destructive",
      });
      return;
    }

    try {
      // Ensure all required fields are present and match the expected format
      const listingData = {
        dog_name: data.dog_name,
        breed: data.breed,
        age: data.age,
        price: data.price,
        description: data.description || '',
        location: data.location || '',
        gender: data.gender,
        size: data.size,
        color: data.color || '',
        vaccinated: data.vaccinated,
        neutered_spayed: data.neutered_spayed,
        good_with_kids: data.good_with_kids,
        good_with_dogs: data.good_with_dogs,
        special_needs: data.special_needs,
        rehoming: data.rehoming,
        delivery_available: data.delivery_available,
        status: 'active', // Ensure status is set for backward compatibility
        listing_status: data.listing_status,
        images: data.images || [],
        video_url: data.video_url || '',
        // Set the first image as the main image_url for backward compatibility
        image_url: data.images && data.images.length > 0 ? data.images[0] : '',
      };
      
      await createListing(listingData);
      
      form.reset();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating listing:', error);
    }
  };

  if (!user) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center">
          <p className="text-gray-600">Please sign in to create listings.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Create Dog Listing</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ListingFormFields form={form} />
            
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-3 font-medium"
              disabled={loading}
            >
              {loading ? 'Creating Listing...' : 'Create Listing'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CreateListingForm;
