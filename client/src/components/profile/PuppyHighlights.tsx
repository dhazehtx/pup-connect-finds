
import React from 'react';

interface PuppyHighlightsProps {
  showHighlights: boolean;
}

const PuppyHighlights = ({ showHighlights }: PuppyHighlightsProps) => {
  if (!showHighlights) return null;

  return (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Puppy Highlights</h3>
        <div className="flex space-x-4 overflow-x-auto pb-2">
          <div className="flex flex-col items-center space-y-2 min-w-0">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300">
              <span className="text-2xl">+</span>
            </div>
            <span className="text-xs text-gray-600 text-center">New</span>
          </div>
          <div className="flex flex-col items-center space-y-2 min-w-0">
            <div className="w-16 h-16 rounded-full overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=100&h=100&fit=crop" 
                alt="Poodle"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xs text-gray-600 text-center">Poodle</span>
          </div>
          <div className="flex flex-col items-center space-y-2 min-w-0">
            <div className="w-16 h-16 rounded-full overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=100&h=100&fit=crop" 
                alt="Golden Retriever"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xs text-gray-600 text-center">Golden Retriever</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PuppyHighlights;
