
import { useMemo } from 'react';

interface FilterState {
  searchTerm: string;
  breed: string;
  minPrice: string;
  maxPrice: string;
  ageGroup: string;
  gender: string;
  sourceType: string;
  maxDistance: string;
  verifiedOnly: boolean;
  availableOnly: boolean;
}

interface Listing {
  id: number;
  title: string;
  price: string;
  location: string;
  distance: string;
  breed: string;
  color: string;
  gender: string;
  age: string;
  rating: number;
  reviews: number;
  image: string;
  breeder: string;
  verified: boolean;
  verifiedBreeder?: boolean;
  idVerified?: boolean;
  vetVerified?: boolean;
  available: number;
  sourceType: string;
  isKillShelter?: boolean;
}

export const useListingFilters = (listings: Listing[], filters: FilterState, sortBy: string) => {
  // Filter listings based on current filters
  const filteredListings = useMemo(() => {
    // Add safety check for listings array
    if (!Array.isArray(listings) || listings.length === 0) {
      return [];
    }

    return listings.filter((listing) => {
      // Add safety check for each listing
      if (!listing) return false;

      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch = 
          (listing.title || '').toLowerCase().includes(searchLower) ||
          (listing.breed || '').toLowerCase().includes(searchLower) ||
          (listing.location || '').toLowerCase().includes(searchLower) ||
          (listing.breeder || '').toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Breed filter
      if (filters.breed !== 'all' && filters.breed !== 'all breeds') {
        if (!(listing.breed || '').toLowerCase().includes(filters.breed.toLowerCase())) return false;
      }

      // Source type filter
      if (filters.sourceType !== 'all') {
        if (listing.sourceType !== filters.sourceType) return false;
      }

      // Gender filter
      if (filters.gender !== 'all') {
        if ((listing.gender || '').toLowerCase() !== filters.gender.toLowerCase()) return false;
      }

      // Age group filter
      if (filters.ageGroup !== 'all') {
        const ageStr = listing.age || '0';
        const ageNumber = parseInt(ageStr);
        if (isNaN(ageNumber)) return false;
        
        if (filters.ageGroup === 'puppy' && ageNumber > 52) return false;
        if (filters.ageGroup === 'young' && (ageNumber <= 52 || ageNumber > 156)) return false;
        if (filters.ageGroup === 'adult' && ageNumber <= 156) return false;
      }

      // Price filters
      if (filters.minPrice) {
        const minPrice = parseInt(filters.minPrice.replace(/[$,]/g, ''));
        const priceStr = (listing.price || '$0').replace(/[$,]/g, '');
        const listingPrice = parseInt(priceStr);
        if (isNaN(listingPrice) || listingPrice < minPrice) return false;
      }

      if (filters.maxPrice) {
        const maxPrice = parseInt(filters.maxPrice.replace(/[$,]/g, ''));
        const priceStr = (listing.price || '$0').replace(/[$,]/g, '');
        const listingPrice = parseInt(priceStr);
        if (isNaN(listingPrice) || listingPrice > maxPrice) return false;
      }

      // Distance filter
      if (filters.maxDistance !== 'all') {
        const maxDist = parseInt(filters.maxDistance);
        const distanceStr = listing.distance || '0';
        const listingDist = parseFloat(distanceStr);
        if (isNaN(listingDist) || listingDist > maxDist) return false;
      }

      // Verified only filter
      if (filters.verifiedOnly && !listing.verified) return false;

      // Available only filter
      if (filters.availableOnly && (listing.available === 0 || listing.available == null)) return false;

      return true;
    });
  }, [listings, filters]);

  // Sort filtered listings
  const sortedListings = useMemo(() => {
    // Add safety check for filtered listings
    if (!Array.isArray(filteredListings) || filteredListings.length === 0) {
      return [];
    }
    
    const sorted = [...filteredListings];
    
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => {
          const priceA = parseInt((a.price || '$0').replace(/[$,]/g, ''));
          const priceB = parseInt((b.price || '$0').replace(/[$,]/g, ''));
          return (isNaN(priceA) ? 0 : priceA) - (isNaN(priceB) ? 0 : priceB);
        });
      case 'price-high':
        return sorted.sort((a, b) => {
          const priceA = parseInt((a.price || '$0').replace(/[$,]/g, ''));
          const priceB = parseInt((b.price || '$0').replace(/[$,]/g, ''));
          return (isNaN(priceB) ? 0 : priceB) - (isNaN(priceA) ? 0 : priceA);
        });
      case 'distance':
        return sorted.sort((a, b) => {
          const distA = parseFloat(a.distance || '0');
          const distB = parseFloat(b.distance || '0');
          return (isNaN(distA) ? 0 : distA) - (isNaN(distB) ? 0 : distB);
        });
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'age-young':
        return sorted.sort((a, b) => {
          const ageA = parseInt(a.age || '0');
          const ageB = parseInt(b.age || '0');
          return (isNaN(ageA) ? 0 : ageA) - (isNaN(ageB) ? 0 : ageB);
        });
      case 'age-old':
        return sorted.sort((a, b) => {
          const ageA = parseInt(a.age || '0');
          const ageB = parseInt(b.age || '0');
          return (isNaN(ageB) ? 0 : ageB) - (isNaN(ageA) ? 0 : ageA);
        });
      default: // newest
        return sorted.sort((a, b) => (b.id || 0) - (a.id || 0));
    }
  }, [filteredListings, sortBy]);

  return { filteredListings, sortedListings };
};
