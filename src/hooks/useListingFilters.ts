
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
    return listings.filter((listing) => {
      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch = 
          listing.title.toLowerCase().includes(searchLower) ||
          listing.breed.toLowerCase().includes(searchLower) ||
          listing.location.toLowerCase().includes(searchLower) ||
          listing.breeder.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Breed filter
      if (filters.breed !== 'all' && filters.breed !== 'all breeds') {
        if (!listing.breed.toLowerCase().includes(filters.breed.toLowerCase())) return false;
      }

      // Source type filter
      if (filters.sourceType !== 'all') {
        if (listing.sourceType !== filters.sourceType) return false;
      }

      // Gender filter
      if (filters.gender !== 'all') {
        if (listing.gender.toLowerCase() !== filters.gender.toLowerCase()) return false;
      }

      // Age group filter
      if (filters.ageGroup !== 'all') {
        const ageNumber = parseInt(listing.age);
        if (filters.ageGroup === 'puppy' && ageNumber > 52) return false;
        if (filters.ageGroup === 'young' && (ageNumber <= 52 || ageNumber > 156)) return false;
        if (filters.ageGroup === 'adult' && ageNumber <= 156) return false;
      }

      // Price filters
      if (filters.minPrice) {
        const minPrice = parseInt(filters.minPrice.replace(/[$,]/g, ''));
        const listingPrice = parseInt(listing.price.replace(/[$,]/g, ''));
        if (listingPrice < minPrice) return false;
      }

      if (filters.maxPrice) {
        const maxPrice = parseInt(filters.maxPrice.replace(/[$,]/g, ''));
        const listingPrice = parseInt(listing.price.replace(/[$,]/g, ''));
        if (listingPrice > maxPrice) return false;
      }

      // Distance filter
      if (filters.maxDistance !== 'all') {
        const maxDist = parseInt(filters.maxDistance);
        const listingDist = parseFloat(listing.distance);
        if (listingDist > maxDist) return false;
      }

      // Verified only filter
      if (filters.verifiedOnly && !listing.verified) return false;

      // Available only filter
      if (filters.availableOnly && listing.available === 0) return false;

      return true;
    });
  }, [listings, filters]);

  // Sort filtered listings
  const sortedListings = useMemo(() => {
    const sorted = [...filteredListings];
    
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => {
          const priceA = parseInt(a.price.replace(/[$,]/g, ''));
          const priceB = parseInt(b.price.replace(/[$,]/g, ''));
          return priceA - priceB;
        });
      case 'price-high':
        return sorted.sort((a, b) => {
          const priceA = parseInt(a.price.replace(/[$,]/g, ''));
          const priceB = parseInt(b.price.replace(/[$,]/g, ''));
          return priceB - priceA;
        });
      case 'distance':
        return sorted.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'age-young':
        return sorted.sort((a, b) => {
          const ageA = parseInt(a.age);
          const ageB = parseInt(b.age);
          return ageA - ageB;
        });
      case 'age-old':
        return sorted.sort((a, b) => {
          const ageA = parseInt(a.age);
          const ageB = parseInt(b.age);
          return ageB - ageA;
        });
      default: // newest
        return sorted.sort((a, b) => b.id - a.id);
    }
  }, [filteredListings, sortBy]);

  return { filteredListings, sortedListings };
};
