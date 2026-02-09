import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useExploreFilters } from '@/context/ExploreFiltersContext';

export interface Listing {
  id: string;
  dog_name: string;
  breed: string;
  age: number;
  price: number;
  location: string;
  description?: string;
  image_url?: string;
  gender: string;
  color: string;
  status: string;
  created_at: string;
  is_featured?: boolean;
  verified?: boolean;
  available_now?: boolean;
  health_checked?: boolean;
  vaccinated?: boolean;
  good_with_kids?: boolean;
  good_with_pets?: boolean;
  spayed_neutered?: boolean;
}

export const useListings = () => {
  const { filters } = useExploreFilters();
  
  return useInfiniteQuery({
    queryKey: ['listings', filters],
    queryFn: async ({ pageParam = 0 }) => {
      try {
        console.log('[LISTINGS] Fetching with filters:', filters);
        
        let query = supabase
          .from('dog_listings')
          .select('*')
          .eq('status', 'active')
          .range(pageParam, pageParam + 19); // 20 items per page

        // Apply breed filter using local lookup (breeds table not in Supabase)
        if (filters.breedId) {
          const { getBreedNameById } = await import('@/hooks/useBreedColorOptions');
          const breedName = getBreedNameById(filters.breedId);
          if (breedName) {
            query = query.eq('breed', breedName);
          }
        }

        // Apply color filter
        if (filters.color) {
          query = query.eq('color', filters.color);
        }

        // Apply gender filter
        if (filters.gender !== 'any') {
          query = query.eq('gender', filters.gender);
        }

        // Apply price range
        query = query.gte('price', filters.price[0]).lte('price', filters.price[1]);

        // Apply age range (convert weeks to approximate months for compatibility)
        if (filters.age.minWeeks > 0) {
          query = query.gte('age', Math.floor(filters.age.minWeeks / 4));
        }
        if (filters.age.maxWeeks < 104) {
          query = query.lte('age', Math.ceil(filters.age.maxWeeks / 4));
        }

        // Apply location filter
        if (filters.location.city) {
          query = query.ilike('location', `%${filters.location.city}%`);
        }

        // Apply toggle filters
        if (filters.toggles.verified) {
          query = query.eq('verified', true);
        }
        if (filters.toggles.availableNow) {
          query = query.eq('available_now', true);
        }
        if (filters.toggles.healthChecked) {
          query = query.eq('health_checked', true);
        }
        if (filters.toggles.vaccinated) {
          query = query.eq('vaccinated', true);
        }
        if (filters.toggles.goodWithKids) {
          query = query.eq('good_with_kids', true);
        }
        if (filters.toggles.goodWithPets) {
          query = query.eq('good_with_pets', true);
        }
        if (filters.toggles.spayedNeutered) {
          query = query.eq('spayed_neutered', true);
        }

        // Apply sorting
        switch (filters.sort) {
          case 'newest':
            query = query.order('created_at', { ascending: false });
            break;
          case 'price_low':
            query = query.order('price', { ascending: true });
            break;
          case 'price_high':
            query = query.order('price', { ascending: false });
            break;
          case 'featured':
            query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
            break;
          default:
            query = query.order('created_at', { ascending: false });
        }

        const { data, error } = await query;

        if (error) {
          console.error('[LISTINGS] Supabase error:', error);
          return [];
        }

        console.log('[LISTINGS] Fetched:', data?.length || 0, 'listings');
        return data || [];
      } catch (error) {
        console.error('[LISTINGS] Error fetching listings:', error);
        return [];
      }
    },
    getNextPageParam: (lastPage, pages) => {
      if (!lastPage || lastPage.length < 20) return undefined;
      return pages.length * 20;
    },
    initialPageParam: 0
  });
};