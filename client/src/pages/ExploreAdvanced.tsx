import { ExploreFiltersProvider } from '@/context/ExploreFiltersContext';
import AdvancedFilters from '@/components/AdvancedFilters';
import ListingsGrid from '@/components/ListingsGrid';

export default function ExploreAdvanced() {
  return (
    <ExploreFiltersProvider>
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Puppies</h1>
            <p className="text-gray-600">Find your perfect furry companion with advanced filters</p>
          </div>

          <AdvancedFilters />
          <ListingsGrid />
        </div>
      </div>
    </ExploreFiltersProvider>
  );
}