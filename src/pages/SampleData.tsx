
import React from 'react';
import SampleDataManager from '@/components/dev/SampleDataManager';

const SampleData = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-deep-navy mb-4">
            Development Tools
          </h1>
          <p className="text-deep-navy/70 text-lg">
            Load sample data to test all the application features
          </p>
        </div>
        
        <SampleDataManager />
      </div>
    </div>
  );
};

export default SampleData;
