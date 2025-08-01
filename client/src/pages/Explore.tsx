import { useEffect } from 'react';
import ExploreRouter from './ExploreRouter';

const Explore = () => {
  // Debug logging for navigation issues
  console.log('[EXPLORE PAGE] Rendering Explore component');

  useEffect(() => {
    console.log('[EXPLORE PAGE] Component mounted');
  }, []);

  return <ExploreRouter />;
};

export default Explore;