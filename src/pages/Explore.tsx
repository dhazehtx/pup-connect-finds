
import React, { useState, useMemo } from 'react';
import SearchFilters from '@/components/SearchFilters';
import SortingOptions from '@/components/SortingOptions';
import ListingCard from '@/components/ListingCard';
import { useToast } from '@/hooks/use-toast';

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

const Explore = () => {
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    breed: 'all',
    minPrice: '',
    maxPrice: '',
    ageGroup: 'all',
    gender: 'all',
    sourceType: 'all',
    maxDistance: 'all',
    verifiedOnly: false,
    availableOnly: false,
  });

  const listings = [
    {
      id: 1,
      title: "Beautiful French Bulldog Puppies",
      price: "$4,200",
      location: "San Francisco, CA",
      distance: "2.3 miles",
      breed: "French Bulldog",
      color: "Blue Fawn",
      gender: "Male",
      age: "8 weeks",
      rating: 4.9,
      reviews: 23,
      image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop",
      breeder: "Elite French Bulldogs",
      verified: true,
      verifiedBreeder: true,
      idVerified: true,
      vetVerified: true,
      available: 3,
      sourceType: "breeder"
    },
    {
      id: 2,
      title: "Golden Retriever Puppies Ready Now",
      price: "$2,800",
      location: "Oakland, CA",
      distance: "5.7 miles",
      breed: "Golden Retriever",
      color: "Golden",
      gender: "Female",
      age: "10 weeks",
      rating: 4.8,
      reviews: 45,
      image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop",
      breeder: "Sunset Retrievers",
      verified: true,
      verifiedBreeder: true,
      idVerified: true,
      vetVerified: false,
      available: 2,
      sourceType: "breeder"
    },
    {
      id: 3,
      title: "German Shepherd Puppy - Champion Lines",
      price: "$3,500",
      location: "San Jose, CA",
      distance: "8.1 miles",
      breed: "German Shepherd",
      color: "Black & Tan",
      gender: "Male",
      age: "12 weeks",
      rating: 4.9,
      reviews: 31,
      image: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400&h=300&fit=crop",
      breeder: "Metro German Shepherds",
      verified: true,
      available: 1,
      sourceType: "breeder"
    },
    {
      id: 4,
      title: "Labrador Retriever Puppies",
      price: "$2,400",
      location: "Berkeley, CA",
      distance: "12.4 miles",
      breed: "Labrador",
      color: "Chocolate",
      gender: "Female",
      age: "9 weeks",
      rating: 4.7,
      reviews: 18,
      image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=300&fit=crop",
      breeder: "Happy Tails Labradors",
      verified: true,
      available: 4,
      sourceType: "breeder"
    },
    {
      id: 5,
      title: "Rescue Pit Bull Mix - Needs Home",
      price: "$150",
      location: "San Francisco, CA",
      distance: "1.8 miles",
      breed: "Pit Bull Mix",
      color: "Brindle",
      gender: "Male",
      age: "2 years",
      rating: 4.6,
      reviews: 12,
      image: "https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400&h=300&fit=crop",
      breeder: "SF Animal Shelter",
      verified: true,
      available: 1,
      sourceType: "shelter",
      isKillShelter: true
    },
    {
      id: 6,
      title: "Sweet Beagle Looking for Family",
      price: "$75",
      location: "Oakland, CA",
      distance: "6.2 miles",
      breed: "Beagle",
      color: "Tri-color",
      gender: "Female",
      age: "3 years",
      rating: 4.8,
      reviews: 28,
      image: "https://images.unsplash.com/photo-1544944194-2d4245d0bc67?w=400&h=300&fit=crop",
      breeder: "Oakland No-Kill Rescue",
      verified: true,
      available: 1,
      sourceType: "shelter",
      isKillShelter: false
    }
  ];

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
        if (filters.ageGroup === 'puppy' && ageNumber > 52) return false; // > 1 year in weeks
        if (filters.ageGroup === 'young' && (ageNumber <= 52 || ageNumber > 156)) return false; // 1-3 years
        if (filters.ageGroup === 'adult' && ageNumber <= 156) return false; // 3+ years
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

  const handleClearFilters = () => {
    setFilters({
      searchTerm: '',
      breed: 'all',
      minPrice: '',
      maxPrice: '',
      ageGroup: 'all',
      gender: 'all',
      sourceType: 'all',
      maxDistance: 'all',
      verifiedOnly: false,
      availableOnly: false,
    });
  };

  const handleFavorite = (id: number) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(id) 
        ? prev.filter(fav => fav !== id)
        : [...prev, id];
      
      const listing = listings.find(l => l.id === id);
      toast({
        title: prev.includes(id) ? "Removed from favorites" : "Added to favorites",
        description: listing ? `${listing.title}` : "Listing updated",
      });
      
      return newFavorites;
    });
  };

  const handleContact = (id: number) => {
    const listing = listings.find(l => l.id === id);
    toast({
      title: "Contact initiated",
      description: `We'll connect you with ${listing?.breeder || 'the seller'}`,
    });
  };

  const handleViewDetails = (id: number) => {
    const listing = listings.find(l => l.id === id);
    toast({
      title: "Opening details",
      description: `Viewing details for ${listing?.title || 'this listing'}`,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Marketplace</h1>
        <p className="text-gray-600">Find your perfect puppy companion</p>
      </div>

      {/* Search and Filter Component */}
      <SearchFilters
        filters={filters}
        onFiltersChange={setFilters}
        resultsCount={sortedListings.length}
        onClearFilters={handleClearFilters}
      />

      {/* Sorting and View Options */}
      <SortingOptions
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        resultsCount={sortedListings.length}
      />

      {/* Results */}
      {sortedListings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No puppies found matching your criteria</p>
          <p className="text-gray-400 mt-2">Try adjusting your filters or search terms</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-6 max-w-4xl mx-auto' : 'space-y-0'}>
          {sortedListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              viewMode={viewMode}
              onFavorite={handleFavorite}
              onContact={handleContact}
              onViewDetails={handleViewDetails}
              isFavorited={favorites.includes(listing.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;
