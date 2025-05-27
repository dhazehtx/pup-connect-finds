
import React from 'react';
import { Plus } from 'lucide-react';

interface Highlight {
  id: string | number;
  title: string;
  cover: string;
  isNew?: boolean;
}

interface ProfileHighlightsProps {
  highlights: Highlight[];
}

const ProfileHighlights = ({ highlights }: ProfileHighlightsProps) => {
  return (
    <div className="mb-6">
      <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
        {highlights.map((highlight) => (
          <div key={highlight.id} className="flex flex-col items-center space-y-1 min-w-0">
            <div className="relative w-16 h-16">
              {highlight.isNew ? (
                <div className="w-16 h-16 rounded-full border-2 border-gray-300 border-dashed flex items-center justify-center bg-gray-50">
                  <Plus size={24} className="text-gray-400" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full border-2 border-gray-300 overflow-hidden">
                  <img
                    src={highlight.cover}
                    alt={highlight.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            <span className="text-xs text-gray-600 text-center w-16 truncate">
              {highlight.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileHighlights;
