
import React from 'react';

interface ResultsHeaderProps {
  count: number;
  maxDistance?: string;
}

const ResultsHeader = ({ count, maxDistance }: ResultsHeaderProps) => {
  return (
    <div className="px-4 py-3 bg-white border-b">
      <p className="text-sm text-gray-600">
        {count} puppies found
        {maxDistance !== 'Any distance' && ` within ${maxDistance} miles`}
      </p>
    </div>
  );
};

export default ResultsHeader;
