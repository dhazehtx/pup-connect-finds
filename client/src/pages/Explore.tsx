
import React from 'react';
import ExploreWithFilters from '@/components/explore/ExploreWithFilters';

const Explore = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* No separate header needed - unified with StickyHeader */}
      <ExploreWithFilters />
    </div>
  );
};

export default Explore;
