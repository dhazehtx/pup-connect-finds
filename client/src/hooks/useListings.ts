import { useInfiniteQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
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
  images?: string[];
  gender: string;
  color: string;
  size?: string;
  status: string;
  created_at: string;
  vaccinated?: boolean;
  good_with_kids?: boolean;
  good_with_dogs?: boolean;
  neutered_spayed?: boolean;
  user_id?: string;
}

export const useListings = () => {
  const { filters } = useExploreFilters();
  
  return useInfiniteQuery({
    queryKey: ['listings', filters],
    queryFn: async ({ pageParam = 0 }) => {
      try {
        console.log('[LISTINGS] Fetching from Neon API with filters:', filters);
        
        const params = new URLSearchParams();
        params.append('offset', String(pageParam));
        params.append('limit', '20');
        params.append('status', 'active');

        if (filters.breedId) {
          const { getBreedNameById } = await import('@/hooks/useBreedColorOptions');
          const breedName = getBreedNameById(filters.breedId);
          if (breedName) {
            params.append('breed', breedName);
          }
        }

        if (filters.color) {
          params.append('color', filters.color);
        }

        if (filters.gender !== 'any') {
          params.append('gender', filters.gender);
        }

        if (filters.price[0] > 0) {
          params.append('min_price', String(filters.price[0]));
        }
        if (filters.price[1] < 10000) {
          params.append('max_price', String(filters.price[1]));
        }

        if (filters.age.minWeeks > 0) {
          params.append('min_age', String(Math.floor(filters.age.minWeeks / 4)));
        }
        if (filters.age.maxWeeks < 104) {
          params.append('max_age', String(Math.ceil(filters.age.maxWeeks / 4)));
        }

        if (filters.location.city) {
          params.append('location', filters.location.city);
        }

        if (filters.toggles.vaccinated) {
          params.append('vaccinated', 'true');
        }
        if (filters.toggles.goodWithKids) {
          params.append('good_with_kids', 'true');
        }
        if (filters.toggles.spayedNeutered) {
          params.append('neutered_spayed', 'true');
        }

        params.append('sort', filters.sort);

        const data = await apiRequest(`/api/listings?${params.toString()}`);
        console.log('[LISTINGS] Fetched from Neon:', data?.length || 0, 'listings');
        return Array.isArray(data) ? data : [];
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
