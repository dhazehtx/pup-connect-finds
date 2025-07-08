
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ExploreWithFilters from '@/components/explore/ExploreWithFilters';

const Explore = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <ExploreWithFilters />
      
      {/* Floating Action Button - Post Listing */}
      <Button
        onClick={() => navigate('/post')}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 z-50"
        size="icon"
      >
        <Plus className="h-6 w-6 text-white" />
      </Button>
    </div>
  );
};

export default Explore;
