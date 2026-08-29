
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { useDogListings } from '@/hooks/useDogListings';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import { useToast } from '@/hooks/use-toast';
import { listingFormSchema, ListingFormData } from './listingSchema';
import ListingFormFields from './ListingFormFields';

interface CreateListingFormProps {
  onSuccess?: () => void;
  className?: string;
}

/** Pull the JSON body out of apiRequest's "API request failed 400: {…}" message. */
function parseErrorBody(error: any): { error?: string; code?: string; fields?: Record<string, string> } | null {
  try {
    const m = String(error?.message || '').match(/\{[\s\S]*\}$/);
    return m ? JSON.parse(m[0]) : null;
  } catch {
    return null;
  }
}

const CreateListingForm = ({ onSuccess, className = "" }: CreateListingFormProps) => {
  const { user } = useAuth();
  const { createListing, loading } = useDogListings();
  const { deleteAsset } = useMediaUpload();
  const { toast } = useToast();

  const [submitError, setSubmitError] = useState<{ message: string; fields?: Record<string, string> } | null>(null);
  const uploadedAssetIdsRef = useRef<string[]>([]);
  const createdRef = useRef(false);
  const errorRef = useRef<HTMLDivElement>(null);

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

  // Media uploads happen on selection, before the listing exists. If the seller
  // uploaded photos but never successfully created the listing (abandon /
  // navigate away), clean up ONLY those specific orphaned objects on unmount.
  // DELETE /api/media/:id is owner-checked server-side, so this can never touch
  // another user's or listing's media.
  useEffect(() => {
    return () => {
      if (!createdRef.current) {
        for (const id of uploadedAssetIdsRef.current) {
          deleteAsset(id).catch(() => { /* best-effort orphan cleanup */ });
        }
      }
    };
  }, [deleteAsset]);

  // Check if form has required fields filled
  const isFormValid = () => {
    const values = form.getValues();
    return (
      values.dog_name &&
      values.breed &&
      values.age > 0 &&
      values.price > 0 &&
      values.images &&
      values.images.length > 0
    );
  };

  const onSubmit = async (data: ListingFormData) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a listing",
        variant: "destructive",
      });
      return;
    }

    setSubmitError(null);
    try {
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
        status: 'active',
        listing_status: data.listing_status,
        images: data.images || [],
        image_url: data.images?.[0] ?? null,
        video_url: data.video_url || '',
      };

      await createListing(listingData);

      createdRef.current = true; // media is now attached to a real listing — do not clean it up
      form.reset();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      // Keep the seller's entered data; surface a clear, accessible error. (The
      // hook also toasts a friendly message; this inline surface is persistent
      // and adds field-level detail.)
      const status = error?.status;
      let message: string;
      let fields: Record<string, string> | undefined;

      if (status === 429) {
        message = 'Too many attempts. Please wait a moment and try again.';
      } else {
        const body = parseErrorBody(error);
        fields = body?.fields && typeof body.fields === 'object' ? body.fields : undefined;
        if (fields && Object.keys(fields).length > 0) {
          for (const [key, msg] of Object.entries(fields)) {
            try { form.setError(key as keyof ListingFormData, { type: 'server', message: String(msg) }); } catch { /* unknown field */ }
          }
          message = 'Please fix the highlighted fields and try again.';
        } else {
          message = body?.error || 'We couldn’t create your listing. Please check your details and try again.';
        }
      }

      setSubmitError({ message, fields });
      setTimeout(() => errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
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
            <ListingFormFields
              form={form}
              onMediaAssetsChange={(ids) => { uploadedAssetIdsRef.current = ids; }}
            />

            {submitError && (
              <div
                ref={errorRef}
                role="alert"
                aria-live="assertive"
                className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800"
              >
                <p className="font-medium">{submitError.message}</p>
                {submitError.fields && Object.keys(submitError.fields).length > 0 && (
                  <ul className="mt-1 list-disc pl-5">
                    {Object.entries(submitError.fields).map(([field, msg]) => (
                      <li key={field}>
                        <span className="font-medium capitalize">{field.replace(/_/g, ' ')}</span>: {msg}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition-colors duration-200"
              disabled={loading || !isFormValid()}
            >
              {loading ? 'Creating Listing...' : 'Post Listing'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CreateListingForm;
