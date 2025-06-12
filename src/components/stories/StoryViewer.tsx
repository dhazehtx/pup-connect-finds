
import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Story } from '@/data/sampleStories';

interface StoryViewerProps {
  story: Story;
  onClose: () => void;
}

const StoryViewer: React.FC<StoryViewerProps> = ({ story, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          if (currentIndex < story.stories.length - 1) {
            setCurrentIndex(prev => prev + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [currentIndex, story.stories.length, onClose]);

  const currentStory = story.stories[currentIndex];

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
    }
  };

  const handleNext = () => {
    if (currentIndex < story.stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Progress bars */}
      <div className="absolute top-4 left-4 right-4 flex space-x-1 z-10">
        {story.stories.map((_, index) => (
          <div key={index} className="flex-1 h-1 bg-gray-600 rounded overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-100"
              style={{
                width: index < currentIndex ? '100%' : index === currentIndex ? `${progress}%` : '0%'
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <img
            src={story.avatar || '/placeholder.svg'}
            alt={story.username}
            className="w-8 h-8 rounded-full object-cover border-2 border-white"
          />
          <div>
            <p className="text-white font-semibold text-sm">{story.username}</p>
            <p className="text-white/70 text-xs">{currentStory?.timestamp || '1h ago'}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-300 transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* Story content */}
      <div className="relative w-full h-full flex items-center justify-center">
        {currentStory?.type === 'image' ? (
          <img
            src={currentStory.content}
            alt="Story"
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-purple-600 to-blue-600">
            <p className="text-white text-xl font-medium text-center px-8">
              {currentStory?.content}
            </p>
          </div>
        )}

        {/* Navigation areas */}
        <button
          onClick={handlePrevious}
          className="absolute left-0 top-0 w-1/3 h-full z-10 flex items-center justify-start pl-4 opacity-0 hover:opacity-100 transition-opacity"
          disabled={currentIndex === 0}
        >
          {currentIndex > 0 && (
            <ChevronLeft size={32} className="text-white" />
          )}
        </button>

        <button
          onClick={handleNext}
          className="absolute right-0 top-0 w-1/3 h-full z-10 flex items-center justify-end pr-4 opacity-0 hover:opacity-100 transition-opacity"
        >
          <ChevronRight size={32} className="text-white" />
        </button>
      </div>
    </div>
  );
};

export default StoryViewer;
