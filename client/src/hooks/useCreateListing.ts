
import { useState } from 'react';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface CreateListingData {
  dog_name: string;
  breed: string;
  age: number;
  price: number;
  description?: string;
  location?: string;
  image_url?: string;
}

interface ListingPhoto {
  file: File;
  caption?: string;
  display_order: number;
}

export const useCreateListing = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const createListing = async (listingData: CreateListingData, photos: ListingPhoto[] = []) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a listing",
        variant: "destructive",
      });
      return null;
    }

    try {
      setLoading(true);

      // Authoritative write path: server → Neon/Drizzle with server-side ownership.
      const listing = await apiRequest('/api/listings', {
        method: 'POST',
        body: { ...listingData },
      });

      // For now, we'll skip the additional photos since the table doesn't exist yet
      // In the future, when the listing_photos table is added, we can uncomment this:
      /*
      if (photos.length > 0) {
        const photoPromises = photos.map(async (photo) => {
          // In a real app, you'd upload to Supabase Storage first
          // For now, we'll use a placeholder URL
          const photoUrl = URL.createObjectURL(photo.file);
          
          return supabase
            .from('listing_photos')
            .insert([{
              listing_id: listing.id,
              photo_url: photoUrl,
              caption: photo.caption,
              display_order: photo.display_order
            }]);
        });

        await Promise.all(photoPromises);
      }
      */

      toast({
        title: "Success",
        description: "Your listing has been created successfully!",
      });

      return listing;
    } catch (error: any) {
      console.error('Error creating listing:', error);
      toast({
        title: "Error",
        description: "Failed to create listing. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateListing = async (listingId: string, updates: Partial<CreateListingData>) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update a listing",
        variant: "destructive",
      });
      return null;
    }

    try {
      setLoading(true);

      const data = await apiRequest(`/api/listings/${listingId}`, {
        method: 'PUT',
        body: updates,
      });

      toast({
        title: "Success",
        description: "Your listing has been updated successfully!",
      });

      return data;
    } catch (error: any) {
      console.error('Error updating listing:', error);
      toast({
        title: "Error",
        description: "Failed to update listing. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteListing = async (listingId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to delete a listing",
        variant: "destructive",
      });
      return false;
    }

    try {
      setLoading(true);

      await apiRequest(`/api/listings/${listingId}`, { method: 'DELETE' });

      toast({
        title: "Success",
        description: "Your listing has been deleted.",
      });

      return true;
    } catch (error: any) {
      console.error('Error deleting listing:', error);
      toast({
        title: "Error",
        description: "Failed to delete listing. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    createListing,
    updateListing,
    deleteListing,
    loading
  };
};
