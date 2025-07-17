import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, ChevronDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import ListingsSkeleton from '@/components/explore/ListingsSkeleton';
import ExploreListingsGrid from '@/components/explore/ExploreListingsGrid';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from 'date-fns';
import { CalendarIcon } from '@radix-ui/react-icons';
import { DateRange } from "react-day-picker";
import { useDogListings } from '@/hooks/useDogListings';
import LoadingSkeleton from '@/components/LoadingSkeleton';

interface TransformedListing {
  id: number;
  title: string;
  breed: string;
  age: string;
  location: string;
  distance: string;
  price: string;
  image: string;
  verified: boolean;
  sourceType?: string;
  rating: number;
  reviews: number;
  breeder: string;
  color?: string;
  gender?: string;
  verifiedBreeder?: boolean;
  idVerified?: boolean;
  vetVerified?: boolean;
  available?: number;
  isKillShelter?: boolean;
}

const ExploreContainer = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [breedFilter, setBreedFilter] = useState('All Breeds');
  const [genderFilter, setGenderFilter] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [colorFilter, setColorFilter] = useState('');
  const [minPrice, setMinPrice] = useState<number[] | undefined>([0]);
  const [maxPrice, setMaxPrice] = useState<number[] | undefined>([1000]);
  const [vaccinated, setVaccinated] = useState(false);
  const [neuteredSpayed, setNeuteredSpayed] = useState(false);
  const [goodWithKids, setGoodWithKids] = useState(false);
  const [goodWithDogs, setGoodWithDogs] = useState(false);
  const [deliveryAvailable, setDeliveryAvailable] = useState(false);
  const [rehoming, setRehoming] = useState(false);
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(2023, 1, 1),
    to: new Date(),
  })
  const [listings, setListings] = useState<TransformedListing[]>([]);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const { searchListings } = useDogListings();

  const transformedListings: TransformedListing[] = [
    {
      id: 1,
      title: "Buddy",
      breed: "Golden Retriever",
      age: "6 months",
      location: "Los Angeles, CA",
      distance: "5",
      price: "$600",
      image: "/examples/dog-1.jpeg",
      verified: true,
      rating: 4.5,
      reviews: 120,
      breeder: "Happy Tails Kennel",
      color: "Golden",
      gender: "Male",
      verifiedBreeder: true,
      idVerified: true,
      vetVerified: true,
      available: 3,
      isKillShelter: false,
    },
    {
      id: 2,
      title: "Bella",
      breed: "Labrador",
      age: "8 months",
      location: "New York, NY",
      distance: "12",
      price: "$550",
      image: "/examples/dog-2.jpeg",
      verified: false,
      rating: 4.2,
      reviews: 95,
      breeder: "City Pups",
      color: "Black",
      gender: "Female",
      verifiedBreeder: false,
      idVerified: false,
      vetVerified: false,
      available: 5,
      isKillShelter: false,
    },
    {
      id: 3,
      title: "Charlie",
      breed: "German Shepherd",
      age: "10 months",
      location: "Chicago, IL",
      distance: "8",
      price: "$700",
      image: "/examples/dog-3.jpeg",
      verified: true,
      rating: 4.8,
      reviews: 150,
      breeder: "Shepherd's Home",
      color: "Black and Tan",
      gender: "Male",
      verifiedBreeder: true,
      idVerified: true,
      vetVerified: true,
      available: 2,
      isKillShelter: false,
    },
    {
      id: 4,
      title: "Lucy",
      breed: "Poodle",
      age: "7 months",
      location: "Houston, TX",
      distance: "15",
      price: "$650",
      image: "/examples/dog-4.jpeg",
      verified: false,
      rating: 4.0,
      reviews: 80,
      breeder: "Poodle Paradise",
      color: "White",
      gender: "Female",
      verifiedBreeder: false,
      idVerified: false,
      vetVerified: false,
      available: 4,
      isKillShelter: false,
    },
    {
      id: 5,
      title: "Max",
      breed: "Bulldog",
      age: "9 months",
      location: "Miami, FL",
      distance: "10",
      price: "$750",
      image: "/examples/dog-5.jpeg",
      verified: true,
      rating: 4.6,
      reviews: 130,
      breeder: "Bulldog Haven",
      color: "Brindle",
      gender: "Male",
      verifiedBreeder: true,
      idVerified: true,
      vetVerified: true,
      available: 1,
      isKillShelter: false,
    },
    {
      id: 6,
      title: "Daisy",
      breed: "Beagle",
      age: "6 months",
      location: "San Francisco, CA",
      distance: "7",
      price: "$500",
      image: "/examples/dog-6.jpeg",
      verified: false,
      rating: 4.3,
      reviews: 100,
      breeder: "Beagle Buddies",
      color: "Tricolor",
      gender: "Female",
      verifiedBreeder: false,
      idVerified: false,
      vetVerified: false,
      available: 6,
      isKillShelter: false,
    },
  ];

  useEffect(() => {
    setListings(transformedListings);
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const filters = {
        breed: breedFilter,
        gender: genderFilter,
        size: sizeFilter,
        color: colorFilter,
        minPrice: minPrice ? minPrice[0] : undefined,
        maxPrice: maxPrice ? maxPrice[0] : undefined,
        location: locationQuery,
        vaccinated: vaccinated,
        neutered_spayed: neuteredSpayed,
        good_with_kids: goodWithKids,
        good_with_dogs: goodWithDogs,
        delivery_available: deliveryAvailable,
        rehoming: rehoming,
      };

      await searchListings(searchQuery, filters);
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Error",
        description: "Failed to fetch listings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = (listingId: number) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(listingId)) {
      newFavorites.delete(listingId);
    } else {
      newFavorites.add(listingId);
    }
    setFavorites(newFavorites);
  };

  const handleContactSeller = (listing: TransformedListing) => {
    toast({
      title: "Contact Seller",
      description: `Contacting seller for ${listing.title} (ID: ${listing.id})`,
    });
  };

  const handleClearFilters = () => {
    setBreedFilter('All Breeds');
    setGenderFilter('');
    setSizeFilter('');
    setColorFilter('');
    setMinPrice([0]);
    setMaxPrice([1000]);
    setVaccinated(false);
    setNeuteredSpayed(false);
    setGoodWithKids(false);
    setGoodWithDogs(false);
    setDeliveryAvailable(false);
    setRehoming(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-100 to-blue-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-4">
            Find Your Perfect Puppy
          </h1>
          <p className="text-lg text-gray-700 text-center mb-8">
            Browse our listings of adorable puppies for sale from verified breeders and shelters.
          </p>

          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4 max-w-3xl mx-auto">
            <Input
              type="text"
              placeholder="Search by breed, name, or keyword..."
              className="flex-grow"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Input
              type="text"
              placeholder="Enter location..."
              className="flex-grow"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
            />
            <Button onClick={handleSearch}>
              <Search className="w-5 h-5 mr-2" />
              Search
            </Button>
          </div>
        </div>
      </div>

      {/* Filter and Listings Section */}
      <div className="container mx-auto px-4 pb-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Filter Your Results
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Breed Filter */}
            <div>
              <Label htmlFor="breed">Breed</Label>
              <Select value={breedFilter} onValueChange={setBreedFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select breed" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Breeds">All Breeds</SelectItem>
                  <SelectItem value="Golden Retriever">Golden Retriever</SelectItem>
                  <SelectItem value="Labrador">Labrador</SelectItem>
                  <SelectItem value="German Shepherd">German Shepherd</SelectItem>
                  {/* Add more breeds as needed */}
                </SelectContent>
              </Select>
            </div>

            {/* Gender Filter */}
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Size Filter */}
            <div>
              <Label htmlFor="size">Size</Label>
              <Select value={sizeFilter} onValueChange={setSizeFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any</SelectItem>
                  <SelectItem value="Small">Small</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Color Filter */}
            <div>
              <Label htmlFor="color">Color</Label>
              <Input
                type="text"
                id="color"
                placeholder="Enter color"
                value={colorFilter}
                onChange={(e) => setColorFilter(e.target.value)}
              />
            </div>

            {/* Price Range Filter */}
            <div className="col-span-full">
              <Label>Price Range ($)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={minPrice ? minPrice[0] : ''}
                  onChange={(e) => setMinPrice([Number(e.target.value)])}
                />
                -
                <Input
                  type="number"
                  placeholder="Max"
                  value={maxPrice ? maxPrice[0] : ''}
                  onChange={(e) => setMaxPrice([Number(e.target.value)])}
                />
              </div>
              <Slider
                defaultValue={[0, 1000]}
                max={1000}
                step={10}
                aria-label="price"
                value={minPrice && maxPrice ? [minPrice[0], maxPrice[0]] : [0, 1000]}
                onValueChange={(value) => {
                  setMinPrice([value[0]]);
                  setMaxPrice([value[1]]);
                }}
              />
            </div>

            {/* Date Range Filter */}
            <div>
              <Label>Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                      date.to ? (
                        `${format(date.from, "LLL dd, y")} - ${format(
                          date.to,
                          "LLL dd, y"
                        )}`
                      ) : (
                        format(date.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center" side="bottom">
                  <Calendar
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                    pagedNavigation
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Boolean Filters */}
            <div className="lg:col-span-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Additional Filters
              </h4>
              <div className="flex flex-wrap gap-4">
                <div>
                  <Checkbox id="vaccinated" checked={vaccinated} onCheckedChange={setVaccinated} />
                  <Label htmlFor="vaccinated" className="ml-2">Vaccinated</Label>
                </div>
                <div>
                  <Checkbox id="neutered" checked={neuteredSpayed} onCheckedChange={setNeuteredSpayed} />
                  <Label htmlFor="neutered" className="ml-2">Neutered/Spayed</Label>
                </div>
                <div>
                  <Checkbox id="kids" checked={goodWithKids} onCheckedChange={setGoodWithKids} />
                  <Label htmlFor="kids" className="ml-2">Good with Kids</Label>
                </div>
                <div>
                  <Checkbox id="dogs" checked={goodWithDogs} onCheckedChange={setGoodWithDogs} />
                  <Label htmlFor="dogs" className="ml-2">Good with Dogs</Label>
                </div>
                <div>
                  <Checkbox id="delivery" checked={deliveryAvailable} onCheckedChange={setDeliveryAvailable} />
                  <Label htmlFor="delivery" className="ml-2">Delivery Available</Label>
                </div>
                <div>
                  <Checkbox id="rehoming" checked={rehoming} onCheckedChange={setRehoming} />
                  <Label htmlFor="rehoming" className="ml-2">Rehoming</Label>
                </div>
              </div>
            </div>
          </div>

          {/* Clear Filters Button */}
          <Button variant="outline" className="mt-4" onClick={handleClearFilters}>
            Clear Filters
          </Button>
        </div>
        
        {loading ? (
          <LoadingSkeleton viewMode="grid" count={8} />
        ) : (
          <ExploreListingsGrid
            listings={listings}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onContactSeller={handleContactSeller}
            onViewDetails={(listing) =>
              navigate(`/listing/${listing.id}`)
            }
          />
        )}
      </div>
    </div>
  );
};

export default ExploreContainer;
