
import React from 'react';
import Layout from '@/components/Layout';
import ExploreHeader from '@/components/explore/ExploreHeader';
import ExploreContainer from '@/components/explore/ExploreContainer';
import ExploreLoading from '@/components/ExploreLoading';
import { useDogListings } from '@/hooks/useDogListings';
import ErrorBoundary from '@/components/ErrorBoundary';

const Explore = () => {
  const { listings = [], loading } = useDogListings();
  
  console.log('Explore - listings:', listings, 'loading:', loading);

  if (loading) {
    return (
      <Layout>
        <ExploreLoading />
      </Layout>
    );
  }

  return (
    <ErrorBoundary>
      <Layout>
        <div className="min-h-screen bg-background">
          <ExploreHeader 
            searchTerm=""
            onSearchChange={() => {}}
            showAdvancedFilters={false}
            onToggleFilters={() => {}}
          />
          
          <ExploreContainer listings={listings} />
        </div>
      </Layout>
    </ErrorBoundary>
  );
};

export default Explore;
