
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMobileOptimized } from '@/hooks/useMobileOptimized';
import SimpleProfileContent from './SimpleProfileContent';
import OptimizedLoading from '@/components/ui/optimized-loading';

const SimpleProfileContainer = () => {
  const { loading } = useAuth();
  const { isMobile } = useMobileOptimized();

  if (loading) {
    return (
      <div className="max-w-md mx-auto bg-background min-h-screen">
        <div className="p-4 flex items-center justify-center min-h-[400px]">
          <OptimizedLoading 
            size="lg" 
            text="Loading profile..." 
            variant="spinner"
            color="primary"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-background min-h-screen">
      <SimpleProfileContent />
    </div>
  );
};

export default SimpleProfileContainer;
