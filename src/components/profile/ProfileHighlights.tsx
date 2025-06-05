
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import HighlightUploadDialog from './HighlightUploadDialog';
import HighlightViewer from './HighlightViewer';

interface Highlight {
  id: string | number;
  title: string;
  cover: string;
  isNew?: boolean;
  type?: 'image' | 'video';
}

interface ProfileHighlightsProps {
  highlights: Highlight[];
  isOwnProfile?: boolean;
}

const ProfileHighlights = ({ highlights: initialHighlights, isOwnProfile }: ProfileHighlightsProps) => {
  const [highlights, setHighlights] = useState(initialHighlights);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [currentViewerIndex, setCurrentViewerIndex] = useState(0);

  const handleHighlightClick = (index: number) => {
    const highlight = highlights[index];
    if (highlight.isNew && isOwnProfile) {
      setShowUploadDialog(true);
    } else {
      setCurrentViewerIndex(index);
      setShowViewer(true);
    }
  };

  const handleUpload = (newHighlight: { title: string; cover: string; type: 'image' | 'video' }) => {
    const highlight = {
      id: Date.now(),
      ...newHighlight
    };
    
    // Remove the "new" highlight and add the uploaded one
    const updatedHighlights = highlights.filter(h => !h.isNew);
    setHighlights([...updatedHighlights, highlight, { id: 'new', title: 'New', cover: '', isNew: true }]);
  };

  const handleNext = () => {
    const viewableHighlights = highlights.filter(h => !h.isNew);
    setCurrentViewerIndex((prev) => 
      prev < viewableHighlights.length - 1 ? prev + 1 : 0
    );
  };

  const handlePrevious = () => {
    const viewableHighlights = highlights.filter(h => !h.isNew);
    setCurrentViewerIndex((prev) => 
      prev > 0 ? prev - 1 : viewableHighlights.length - 1
    );
  };

  const viewableHighlights = highlights.filter(h => !h.isNew);

  return (
    <>
      <div className="mb-6">
        <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
          {highlights.map((highlight, index) => (
            <div 
              key={highlight.id} 
              className="flex flex-col items-center space-y-1 min-w-0 cursor-pointer"
              onClick={() => handleHighlightClick(index)}
            >
              <div className="relative w-16 h-16">
                {highlight.isNew ? (
                  <div className="w-16 h-16 rounded-full border-2 border-gray-300 border-dashed flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                    <Plus size={24} className="text-gray-400" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full border-2 border-gray-300 overflow-hidden hover:scale-105 transition-transform">
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

      {isOwnProfile && (
        <HighlightUploadDialog
          isOpen={showUploadDialog}
          onClose={() => setShowUploadDialog(false)}
          onUpload={handleUpload}
        />
      )}

      <HighlightViewer
        isOpen={showViewer}
        onClose={() => setShowViewer(false)}
        highlights={viewableHighlights}
        currentIndex={currentViewerIndex}
        onNext={handleNext}
        onPrevious={handlePrevious}
      />
    </>
  );
};

export default ProfileHighlights;
