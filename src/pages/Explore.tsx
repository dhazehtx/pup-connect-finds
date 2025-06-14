
import React from 'react';
import ExploreContainer from '@/components/explore/ExploreContainer';
import ExploreLoading from '@/components/ExploreLoading';
import { useDogListings } from '@/hooks/useDogListings';
import ErrorBoundary from '@/components/ErrorBoundary';

const Explore = () => {
  const { listings = [], loading } = useDogListings();
  
  console.log('Explore - listings:', listings, 'loading:', loading);

  if (loading) {
    return <ExploreLoading />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white">
        <ExploreContainer listings={listings} />
      </div>
    </ErrorBoundary>
  );
};

export default Explore;
