
import React from 'react';
import { Plus } from 'lucide-react';

interface Highlight {
  id: string | number;
  title: string;
  cover?: string;
  isNew?: boolean;
}

interface ProfileHighlightsProps {
  highlights: Highlight[];
  isOwnProfile: boolean;
}

const ProfileHighlights = ({ highlights, isOwnProfile }: ProfileHighlightsProps) => {
  return (
    <div className="px-6 mb-6">
      <div className="flex space-x-4 overflow-x-auto pb-2">
        {highlights.map((highlight) => (
          <div key={highlight.id} className="flex-shrink-0 text-center">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 mb-2 cursor-pointer hover:border-gray-300 transition-colors">
              {highlight.isNew ? (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <Plus className="w-8 h-8 text-gray-400" />
                </div>
              ) : (
                <img 
                  src={highlight.cover} 
                  alt={highlight.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <span className="text-xs text-gray-600 font-medium">{highlight.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileHighlights;
