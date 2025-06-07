
import React, { useState, useMemo, useEffect } from 'react';
import { Scale, Search } from 'lucide-react';
import StateCard from '@/components/legal/StateCard';
import SearchAndFilter from '@/components/legal/SearchAndFilter';
import StatsSummary from '@/components/legal/StatsSummary';
import FederalSection from '@/components/legal/FederalSection';
import ResourcesSection from '@/components/legal/ResourcesSection';
import { stateBreedingLaws } from '@/data/stateBreedingLaws';
import { useSearchParams } from 'react-router-dom';

const Legal = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchParams] = useSearchParams();

  const filteredStates = useMemo(() => {
    return stateBreedingLaws.filter(state => {
      const matchesSearch = state.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || state.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const strictCount = stateBreedingLaws.filter(state => state.category === 'strict').length;
  const moderateCount = stateBreedingLaws.filter(state => state.category === 'moderate').length;
  const lenientCount = stateBreedingLaws.filter(state => state.category === 'lenient').length;

  // Handle auto-scrolling based on category parameter
  useEffect(() => {
    const category = searchParams.get('category');
    if (category && ['strict', 'moderate', 'lenient'].includes(category)) {
      setSelectedCategory(category);
      
      // Small delay to ensure the filtered content has rendered
      setTimeout(() => {
        const element = document.getElementById('states-grid');
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 100);
    }
  }, [searchParams]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center">
          <Scale size={32} className="text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Dog Breeding Laws & Regulations
        </h1>
        <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
          Comprehensive legal requirements and regulations for dog breeding across all 50 states. 
          Stay compliant with local and federal laws while building your breeding business.
        </p>
      </div>

      <StatsSummary 
        strictCount={strictCount}
        moderateCount={moderateCount}
        lenientCount={lenientCount}
      />

      <FederalSection />

      <SearchAndFilter 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {filteredStates.length === 0 ? (
        <div className="text-center py-12">
          <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No states found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search term or filter selection.
          </p>
        </div>
      ) : (
        <div id="states-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredStates.map((state) => (
            <StateCard key={state.name} state={state} />
          ))}
        </div>
      )}

      <ResourcesSection />
    </div>
  );
};

export default Legal;
