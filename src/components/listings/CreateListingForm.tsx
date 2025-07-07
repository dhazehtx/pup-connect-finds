
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
      await createListing({
        ...data,
        status: 'active', // Ensure status is set for backward compatibility
      });
      
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
              className="w-full"
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
