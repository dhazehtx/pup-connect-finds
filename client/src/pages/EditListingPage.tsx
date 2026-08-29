import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useAuth } from '@/contexts/AuthContext';
import { useDogListings } from '@/hooks/useDogListings';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/api';
import { listingFormSchema, ListingFormData } from '@/components/listings/listingSchema';
import ListingFormFields from '@/components/listings/ListingFormFields';
import { listingDisplayName } from '@/lib/listingDisplay';

/** Pull the JSON body out of apiRequest's "API request failed 400: {…}" message. */
function parseErrorBody(error: any): { error?: string; code?: string; fields?: Record<string, string> } | null {
  try {
    const m = String(error?.message || '').match(/\{[\s\S]*\}$/);
    return m ? JSON.parse(m[0]) : null;
  } catch {
    return null;
  }
}

/** The actual edit form — mounted only once the listing is loaded so RHF can
 *  seed defaultValues from it. Reuses ListingFormFields (edit v1 keeps existing
 *  photos untouched; in-editor photo management is deferred). */
const EditListingForm = ({ listing }: { listing: any }) => {
  const navigate = useNavigate();
  const { updateListing } = useDogListings();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<{ message: string; fields?: Record<string, string> } | null>(null);

  const form = useForm<ListingFormData>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      dog_name: listing.dog_name ?? '',
      breed: listing.breed ?? '',
      age: Number(listing.age) || 0,
      price: Number(listing.price) || 0, // decimal comes back as a string
      description: listing.description ?? '',
      location: listing.location ?? '',
      gender: listing.gender ?? 'Unknown',
      size: listing.size ?? 'Medium',
      color: listing.color ?? '',
      vaccinated: !!listing.vaccinated,
      neutered_spayed: !!listing.neutered_spayed,
      good_with_kids: !!listing.good_with_kids,
      good_with_dogs: !!listing.good_with_dogs,
      special_needs: !!listing.special_needs,
      rehoming: !!listing.rehoming,
      delivery_available: !!listing.delivery_available,
      listing_status: listing.listing_status ?? 'active',
      // Carry existing photos through untouched — satisfies the min(1) rule and
      // preserves them on save.
      images: Array.isArray(listing.images) && listing.images.length > 0
        ? listing.images
        : (listing.image_url ? [listing.image_url] : []),
      video_url: listing.video_url ?? '',
    },
  });

  const onSubmit = async (data: ListingFormData) => {
    setSubmitError(null);
    setSaving(true);
    try {
      await updateListing(listing.id, {
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
        listing_status: data.listing_status,
        images: data.images || [],
        image_url: data.images?.[0] ?? null,
        video_url: data.video_url || '',
      } as any);
      toast({ title: 'Listing updated', description: 'Your changes have been saved.' });
      navigate(`/listing/${listing.id}`);
    } catch (error: any) {
      const status = error?.status;
      let message: string;
      let fields: Record<string, string> | undefined;
      if (status === 429) {
        message = 'Too many attempts. Please wait a moment and try again.';
      } else if (status === 403) {
        message = "You don't have permission to edit this listing.";
      } else {
        const body = parseErrorBody(error);
        fields = body?.fields && typeof body.fields === 'object' ? body.fields : undefined;
        if (fields && Object.keys(fields).length > 0) {
          for (const [key, msg] of Object.entries(fields)) {
            try { form.setError(key as keyof ListingFormData, { type: 'server', message: String(msg) }); } catch { /* unknown field */ }
          }
          message = 'Please fix the highlighted fields and try again.';
        } else {
          message = body?.error || 'We couldn’t save your changes. Please try again.';
        }
      }
      setSubmitError({ message, fields });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit listing — {listingDisplayName(listing)}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ListingFormFields form={form} hideMedia />
            <p className="text-xs text-slate-500">Photos stay as they are — photo editing is coming soon.</p>

            {submitError && (
              <div role="alert" aria-live="assertive" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">
                <p className="font-medium">{submitError.message}</p>
                {submitError.fields && Object.keys(submitError.fields).length > 0 && (
                  <ul className="mt-1 list-disc pl-5">
                    {Object.entries(submitError.fields).map(([field, msg]) => (
                      <li key={field}><span className="font-medium capitalize">{field.replace(/_/g, ' ')}</span>: {msg}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <Button type="submit" className="min-h-[44px] flex-1" disabled={saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(`/listing/${listing.id}`)}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

const EditListingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: listing, isLoading, error } = useQuery({
    queryKey: ['listing', id],
    queryFn: async () => apiRequest(`/api/listings/${id}`),
    enabled: !!id,
  });

  const wrap = (node: React.ReactNode) => (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">{node}</div>
    </div>
  );

  if (isLoading) return wrap(<div className="flex justify-center py-16"><LoadingSpinner /></div>);
  if (error || !listing) {
    return wrap(
      <Card><CardContent className="py-10 text-center text-slate-600">Listing not found.</CardContent></Card>,
    );
  }
  // Owner-only (the server also enforces this on PUT via requireOwner).
  if (!user || listing.user_id !== user.id) {
    return wrap(
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-slate-700">You can only edit your own listings.</p>
          <Button className="mt-4" onClick={() => navigate(`/listing/${listing.id}`)}>View listing</Button>
        </CardContent>
      </Card>,
    );
  }

  return wrap(<EditListingForm listing={listing} />);
};

export default EditListingPage;
