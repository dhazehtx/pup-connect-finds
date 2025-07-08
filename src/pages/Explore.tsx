
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ExploreWithFilters from '@/components/explore/ExploreWithFilters';
import { useAuth } from '@/contexts/AuthContext';

const Explore = () => {
  const navigate = useNavigate();
  const { user, isGuest } = useAuth();

  // Show button for logged-in users or guests
  const showPostButton = user || isGuest;

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <ExploreWithFilters />
      
      {/* Floating Action Button - Post Listing */}
      {showPostButton && (
        <Button
          onClick={() => navigate('/post')}
          className="fixed bottom-20 right-5 h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 z-50 border-0"
          size="icon"
          title="Create Post"
        >
          <Plus className="h-6 w-6 text-white" />
        </Button>
      )}
    </div>
  );
};

export default Explore;
