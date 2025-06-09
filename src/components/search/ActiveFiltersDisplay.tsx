
import React from 'react';

interface SearchFilters {
  query: string;
  breed: string;
  location: string;
  minPrice: number;
  maxPrice: number;
  minAge: number;
  maxAge: number;
}

interface ActiveFiltersDisplayProps {
  filters: SearchFilters;
}

const ActiveFiltersDisplay = ({ filters }: ActiveFiltersDisplayProps) => {
  const hasActiveFilters = filters.breed || filters.location || filters.minPrice > 0 || filters.maxPrice < 5000 || filters.minAge > 0 || filters.maxAge < 15;

  if (!hasActiveFilters) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <span className="text-sm text-gray-600">Active filters:</span>
      {filters.breed && (
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
          {filters.breed}
        </span>
      )}
      {filters.location && (
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
          📍 {filters.location}
        </span>
      )}
      {(filters.minPrice > 0 || filters.maxPrice < 5000) && (
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
          💰 ${filters.minPrice} - ${filters.maxPrice}
        </span>
      )}
      {(filters.minAge > 0 || filters.maxAge < 15) && (
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
          🎂 {filters.minAge} - {filters.maxAge} years
        </span>
      )}
    </div>
  );
};

export default ActiveFiltersDisplay;
