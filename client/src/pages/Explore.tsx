
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DemoExplore from '@/components/explore/DemoExplore';
import PillFilterBar from '@/components/explore/PillFilterBar';
import PuppyGrid from '@/components/explore/PuppyGrid';

interface Filters {
  breed?: string;
  gender?: string;
  price?: number;
  age?: number;
  location?: string;
}

const Explore = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Filters>({});
  const [puppies, setPuppies] = useState([]);

  // Fetch puppies when filters change (for authenticated users)
  useEffect(() => {
    if (!user) return; // Skip if not authenticated
    
    const fetchPuppies = async () => {
      try {
        const queryParams = new URLSearchParams();
        
        if (filters.breed) queryParams.append('breed', filters.breed);
        if (filters.gender) queryParams.append('gender', filters.gender.toLowerCase());
        if (filters.price) queryParams.append('maxPrice', filters.price.toString());
        if (filters.age) queryParams.append('maxAge', filters.age.toString());
        if (filters.location) queryParams.append('location', filters.location);

        const response = await fetch(`/api/listings?${queryParams}`);
        if (response.ok) {
          const data = await response.json();
          setPuppies(data);
        }
      } catch (error) {
        console.error('Failed to fetch puppies:', error);
        setPuppies([]);
      }
    };

    fetchPuppies();
  }, [filters, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  // GUEST PATH - show demo explore
  if (!user) {
    return <DemoExplore />;
  }

  // SIGNED-IN PATH - show pill bar & live Supabase grid
  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Explore Puppies</h1>
      <p className="mb-6">Find your perfect puppy companion from verified breeders</p>
      
      {/* Pill filter bar for authenticated users */}
      <PillFilterBar filters={filters} setFilters={setFilters} />
      
      {/* Live puppy grid with real Supabase data */}
      <PuppyGrid data={puppies} filters={filters} />
    </div>
  );
};

export default Explore;
