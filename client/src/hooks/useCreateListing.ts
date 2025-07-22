
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
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

      // Create the listing
      const { data: listing, error: listingError } = await supabase
        .from('dog_listings')
        .insert([{
          ...listingData,
          user_id: user.id
        }])
        .select()
        .single();

      if (listingError) throw listingError;

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

      const { data, error } = await supabase
        .from('dog_listings')
        .update(updates)
        .eq('id', listingId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

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

      const { error } = await supabase
        .from('dog_listings')
        .delete()
        .eq('id', listingId)
        .eq('user_id', user.id);

      if (error) throw error;

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
