
import React from 'react';
import { TrendingUp, Bookmark } from 'lucide-react';

interface EducationHeaderProps {
  readCount: number;
  totalResourcesCount: number;
  bookmarkedCount: number;
}

export const EducationHeader: React.FC<EducationHeaderProps> = ({
  readCount,
  totalResourcesCount,
  bookmarkedCount
}) => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Educational Resources</h1>
      <p className="text-gray-600 mb-4">Learn everything you need to know about dog ownership and care</p>
      
      {/* Progress Summary */}
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-green-600" />
          <span>{readCount} of {totalResourcesCount} articles completed</span>
        </div>
        <div className="flex items-center gap-2">
          <Bookmark size={16} className="text-blue-600" />
          <span>{bookmarkedCount} bookmarked</span>
        </div>
      </div>
    </div>
  );
};
