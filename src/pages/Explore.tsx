
import React, { useState } from 'react';
import ExploreFilters from '@/components/ExploreFilters';
import ListingsGrid from '@/components/ListingsGrid';

const Explore = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBreed, setSelectedBreed] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedAge, setSelectedAge] = useState('');
  const [selectedGenetics, setSelectedGenetics] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [showFilters, setShowFilters] = useState(false);

  const listings = [
    {
      id: 1,
      title: "Beautiful French Bulldog Puppies",
      price: "$4,200",
      adoptionFee: false,
      location: "San Francisco, CA",
      distance: "2.3 miles",
      breed: "French Bulldog",
      color: "Blue Fawn",
      gender: "Male",
      age: "8 weeks",
      genetics: ["bb", "DD", "COCO", "AtAt"],
      rating: 4.9,
      reviews: 23,
      images: [
        "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&h=400&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=600&h=400&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=400&fit=crop&crop=center"
      ],
      videos: ["video1.mp4"],
      breeder: {
        name: "Elite French Bulldogs",
        profilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
        phone: "(555) 123-4567",
        email: "contact@elitefrenchies.com"
      },
      verified: true,
      available: 3,
      vaccinations: {
        status: "Up to date",
        details: ["DHPP", "Rabies", "Bordetella"]
      },
      healthHistory: "Clean bill of health from vet",
      dnaTests: ["Genetic panel clear", "No hereditary diseases"],
      healthTests: ["Heart clear", "Eyes clear", "Hips good"]
    },
    {
      id: 2,
      title: "Golden Retriever Puppies Ready Now",
      price: "$2,800",
      adoptionFee: false,
      location: "Oakland, CA",
      distance: "5.7 miles",
      breed: "Golden Retriever",
      color: "Golden",
      gender: "Female",
      age: "10 weeks",
      genetics: [],
      rating: 4.8,
      reviews: 45,
      images: [
        "https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&h=400&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1551717743-49959800b1f6?w=600&h=400&fit=crop&crop=center"
      ],
      videos: [],
      breeder: {
        name: "Sunset Retrievers",
        profilePicture: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
        phone: "(555) 987-6543",
        email: "info@sunsetretrievers.com"
      },
      verified: true,
      available: 2,
      vaccinations: {
        status: "First shots done",
        details: ["DHPP (1st)", "Dewormed"]
      },
      healthHistory: "Regular vet checkups, healthy lineage",
      dnaTests: ["Embark DNA test completed"],
      healthTests: ["OFA hips pending", "Eyes clear"]
    },
    {
      id: 3,
      title: "German Shepherd Puppy - Champion Lines",
      price: "$3,500",
      adoptionFee: false,
      location: "San Jose, CA",
      distance: "8.1 miles",
      breed: "German Shepherd",
      color: "Black & Tan",
      gender: "Male",
      age: "12 weeks",
      genetics: [],
      rating: 4.9,
      reviews: 31,
      images: [
        "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=600&h=400&fit=crop&crop=center",
        "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=600&h=400&fit=crop&crop=center"
      ],
      videos: ["video2.mp4"],
      breeder: {
        name: "Metro German Shepherds",
        profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
        phone: "(555) 456-7890",
        email: "metro@germanshepherds.com"
      },
      verified: true,
      available: 1,
      vaccinations: {
        status: "Fully vaccinated",
        details: ["DHPP (2 shots)", "Rabies", "Bordetella", "Lyme"]
      },
      healthHistory: "Champion bloodline, excellent health records",
      dnaTests: ["Full genetic panel clear"],
      healthTests: ["Hips excellent", "Elbows normal", "DM clear"]
    },
    {
      id: 4,
      title: "Rescue Labrador - Needs Loving Home",
      price: "Adoption Fee: $150",
      adoptionFee: true,
      location: "Berkeley, CA",
      distance: "12.4 miles",
      breed: "Labrador",
      color: "Chocolate",
      gender: "Female",
      age: "2 years",
      genetics: [],
      rating: 4.7,
      reviews: 18,
      images: [
        "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=600&h=400&fit=crop&crop=center"
      ],
      videos: [],
      breeder: {
        name: "Happy Tails Rescue",
        profilePicture: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
        phone: "(555) 321-0987",
        email: "rescue@happytails.org"
      },
      verified: true,
      available: 1,
      vaccinations: {
        status: "Up to date",
        details: ["All core vaccines current", "Spayed"]
      },
      healthHistory: "Rescued at 6 months, fully rehabilitated",
      dnaTests: ["Mixed breed DNA test completed"],
      healthTests: ["General health check clear"]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Marketplace</h1>
        <p className="text-gray-600">Find your perfect puppy companion</p>
      </div>

      {/* Search and Filter Component */}
      <ExploreFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedBreed={selectedBreed}
        setSelectedBreed={setSelectedBreed}
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        selectedGender={selectedGender}
        setSelectedGender={setSelectedGender}
        selectedAge={selectedAge}
        setSelectedAge={setSelectedAge}
        selectedGenetics={selectedGenetics}
        setSelectedGenetics={setSelectedGenetics}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
      />

      {/* Listings Grid Component */}
      <ListingsGrid listings={listings} />
    </div>
  );
};

export default Explore;
