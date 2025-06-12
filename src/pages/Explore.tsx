
import React, { useState, useEffect } from 'react';
import { sampleListings } from '@/data/sampleListings';
import { useDogListings } from '@/hooks/useDogListings';
import { useMessaging } from '@/hooks/useMessaging';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import ExploreHeader from '@/components/explore/ExploreHeader';
import PopularBreeds from '@/components/explore/PopularBreeds';
import QuickFiltersBar from '@/components/explore/QuickFiltersBar';
import AdvancedFiltersPanel from '@/components/explore/AdvancedFiltersPanel';
import ResultsHeader from '@/components/explore/ResultsHeader';
import ExploreListingsGrid from '@/components/explore/ExploreListingsGrid';
import ExploreBottomNavigation from '@/components/explore/ExploreBottomNavigation';

const Explore = () => {
  const { listings, loading, fetchListings } = useDogListings();
  const { createConversation } = useMessaging();
  const { user, isGuest } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filteredListings, setFilteredListings] = useState(sampleListings);
  const [filters, setFilters] = useState({
    breed: 'All Breeds',
    source: 'All Sources', 
    ageGroup: 'All Ages',
    gender: 'All Genders',
    color: 'All Colors',
    coatLength: 'All Coat Types',
    minPrice: 0,
    maxPrice: 10000,
    priceRange: [0, 10000],
    minAge: '',
    maxAge: '',
    location: '',
    maxDistance: 'Any distance',
    verifiedOnly: false,
    availableNow: false,
    healthChecked: false,
    vaccinated: false,
    spayedNeutered: false,
    paperwork: 'Any',
    trainingLevel: 'Any',
    size: 'Any Size',
    energyLevel: 'Any',
    goodWithKids: false,
    goodWithPets: false,
    sortBy: 'newest'
  });
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  // Most popular dog breeds in the US based on AKC registration data
  const popularBreeds = [
    'Labrador Retriever', 'Golden Retriever', 'German Shepherd', 'French Bulldog', 'Bulldog', 
    'Poodle', 'Beagle', 'Rottweiler', 'German Shorthaired Pointer', 'Yorkshire Terrier',
    'Australian Shepherd', 'Siberian Husky', 'Dachshund', 'Pembroke Welsh Corgi', 'Boston Terrier',
    'Border Collie', 'Great Dane', 'Boxer', 'Bernese Mountain Dog', 'Cocker Spaniel',
    'Chihuahua', 'Shih Tzu', 'Miniature Schnauzer', 'Mastiff', 'Australian Cattle Dog',
    'Cane Corso', 'English Springer Spaniel', 'Brittany', 'Pomeranian', 'Maltese',
    'Cavalier King Charles Spaniel', 'Weimaraner', 'Belgian Malinois', 'Newfoundland', 'Rhodesian Ridgeback',
    'West Highland White Terrier', 'Havanese', 'Bichon Frise', 'Akita', 'Bloodhound',
    'Doberman Pinscher', 'Vizsla', 'Collie', 'Papillon', 'Samoyed',
    'Basset Hound', 'Jack Russell Terrier', 'Saint Bernard', 'Great Pyrenees', 'Portuguese Water Dog',
    'Dapple', 'Mixed Breed'
  ];

  const quickFilters = ['Under $1000', 'Puppies Only', 'Verified Only', 'Nearby (10mi)', 'Health Checked', 'Vaccinated'];
  const distanceOptions = ['5', '10', '25', '50', '100'];
  const sizeOptions = ['Toy (under 10 lbs)', 'Small (10-25 lbs)', 'Medium (25-60 lbs)', 'Large (60-90 lbs)', 'Giant (over 90 lbs)'];
  const energyLevels = ['Low', 'Moderate', 'High', 'Very High'];
  const trainingLevels = ['Untrained', 'Basic', 'Intermediate', 'Advanced'];
  const coatLengthOptions = ['Short Hair', 'Medium Hair', 'Long Hair'];
  const dogColors = [
    'Black', 'White', 'Brown', 'Golden', 'Cream', 'Red', 'Blue', 'Gray', 'Silver', 'Tan', 
    'Brindle', 'Sable', 'Merle', 'Tri-color', 'Bi-color', 'Spotted', 'Parti-color', 
    'Chocolate', 'Liver', 'Fawn', 'Apricot', 'Champagne', 'Platinum', 'Salt and Pepper'
  ];

  useEffect(() => {
    // Filter listings based on search term and filters
    let filtered = sampleListings;
    
    if (searchTerm) {
      filtered = filtered.filter(listing => 
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.breeder.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filters.breed !== 'All Breeds') {
      filtered = filtered.filter(listing => listing.breed === filters.breed);
    }

    if (filters.maxDistance !== 'Any distance') {
      const maxDist = parseInt(filters.maxDistance);
      filtered = filtered.filter(listing => {
        const listingDistance = parseFloat(listing.distance);
        return listingDistance <= maxDist;
      });
    }

    // Price range filter
    const minPrice = filters.priceRange[0];
    const maxPrice = filters.priceRange[1];
    filtered = filtered.filter(listing => {
      const price = parseInt(listing.price.replace(/[$,]/g, ''));
      return price >= minPrice && price <= maxPrice;
    });

    // Age filters
    if (filters.minAge) {
      filtered = filtered.filter(listing => {
        const ageWeeks = parseInt(listing.age);
        return ageWeeks >= parseInt(filters.minAge);
      });
    }

    if (filters.maxAge) {
      filtered = filtered.filter(listing => {
        const ageWeeks = parseInt(listing.age);
        return ageWeeks <= parseInt(filters.maxAge);
      });
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(listing => 
        listing.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    
    if (filters.verifiedOnly) {
      filtered = filtered.filter(listing => listing.verified);
    }
    
    setFilteredListings(filtered);
  }, [searchTerm, filters]);

  const handleContactSeller = async (listing: any) => {
    if (!user && !isGuest) {
      toast({
        title: "Sign in required",
        description: "Please sign in to contact sellers",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    toast({
      title: "Message sent!",
      description: `Contacting ${listing.breeder} about ${listing.title}`,
    });
  };

  const toggleFavorite = (listingId: number) => {
    if (!user && !isGuest) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save favorites",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(listingId)) {
        newFavorites.delete(listingId);
        toast({
          title: "Removed from favorites",
          description: "Dog removed from your favorites list",
        });
      } else {
        newFavorites.add(listingId);
        toast({
          title: "Added to favorites",
          description: "Dog added to your favorites list",
        });
      }
      return newFavorites;
    });
  };

  const updateFilter = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      breed: 'All Breeds',
      source: 'All Sources', 
      ageGroup: 'All Ages',
      gender: 'All Genders',
      color: 'All Colors',
      coatLength: 'All Coat Types',
      minPrice: 0,
      maxPrice: 10000,
      priceRange: [0, 10000],
      minAge: '',
      maxAge: '',
      location: '',
      maxDistance: 'Any distance',
      verifiedOnly: false,
      availableNow: false,
      healthChecked: false,
      vaccinated: false,
      spayedNeutered: false,
      paperwork: 'Any',
      trainingLevel: 'Any',
      size: 'Any Size',
      energyLevel: 'Any',
      goodWithKids: false,
      goodWithPets: false,
      sortBy: 'newest'
    });
    setSearchTerm('');
  };

  const handleBreedSelect = (breed: string) => {
    updateFilter('breed', breed);
  };

  const handleQuickFilterClick = (filter: string) => {
    if (filter === 'Under $1000') {
      updateFilter('priceRange', [0, 1000]);
    } else if (filter === 'Puppies Only') {
      updateFilter('ageGroup', 'Puppies (0-1 year)');
    } else if (filter === 'Verified Only') {
      updateFilter('verifiedOnly', !filters.verifiedOnly);
    } else if (filter === 'Nearby (10mi)') {
      updateFilter('maxDistance', '10');
    } else if (filter === 'Health Checked') {
      updateFilter('healthChecked', !filters.healthChecked);
    } else if (filter === 'Vaccinated') {
      updateFilter('vaccinated', !filters.vaccinated);
    }
  };

  const handleViewDetails = (listing: any) => {
    toast({
      title: "View Details",
      description: `Viewing details for ${listing.title}`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <ExploreHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        showAdvancedFilters={showAdvancedFilters}
        onToggleFilters={() => setShowAdvancedFilters(!showAdvancedFilters)}
      />

      <PopularBreeds
        popularBreeds={popularBreeds}
        selectedBreed={filters.breed}
        onBreedSelect={handleBreedSelect}
      />

      <QuickFiltersBar
        quickFilters={quickFilters}
        filters={filters}
        onQuickFilterClick={handleQuickFilterClick}
      />

      {showAdvancedFilters && (
        <AdvancedFiltersPanel
          filters={filters}
          popularBreeds={popularBreeds}
          dogColors={dogColors}
          coatLengthOptions={coatLengthOptions}
          distanceOptions={distanceOptions}
          sizeOptions={sizeOptions}
          energyLevels={energyLevels}
          trainingLevels={trainingLevels}
          onFilterUpdate={updateFilter}
          onClearAllFilters={clearAllFilters}
        />
      )}

      <ResultsHeader
        count={filteredListings.length}
        maxDistance={filters.maxDistance}
      />

      <ExploreListingsGrid
        listings={filteredListings}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        onContactSeller={handleContactSeller}
        onViewDetails={handleViewDetails}
      />

      <ExploreBottomNavigation />
    </div>
  );
};

export default Explore;
