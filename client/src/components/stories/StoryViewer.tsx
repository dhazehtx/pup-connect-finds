
import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StoryContent {
  id: string;
  type: 'image' | 'text';
  content: string;
  timestamp: string;
}

interface Story {
  id: string;
  username: string;
  avatar?: string;
  stories: StoryContent[];
}

interface StoryViewerProps {
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
}

const StoryViewer = ({ stories, initialIndex, onClose }: StoryViewerProps) => {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialIndex);
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const currentStory = stories[currentStoryIndex];
  const currentContent = currentStory?.stories[currentContentIndex];

  useEffect(() => {
    if (!currentContent) return;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [currentStoryIndex, currentContentIndex]);

  const handleNext = () => {
    if (currentContentIndex < currentStory.stories.length - 1) {
      setCurrentContentIndex(prev => prev + 1);
      setProgress(0);
    } else if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
      setCurrentContentIndex(0);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentContentIndex > 0) {
      setCurrentContentIndex(prev => prev - 1);
      setProgress(0);
    } else if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
      setCurrentContentIndex(stories[currentStoryIndex - 1].stories.length - 1);
      setProgress(0);
    }
  };

  if (!currentStory || !currentContent) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Progress bars */}
      <div className="absolute top-4 left-4 right-4 flex space-x-1 z-10">
        {currentStory.stories.map((_, index) => (
          <div key={index} className="flex-1 h-0.5 bg-white/30 rounded">
            <div
              className="h-full bg-white rounded transition-all duration-100"
              style={{
                width: index < currentContentIndex ? '100%' : 
                       index === currentContentIndex ? `${progress}%` : '0%'
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <img
            src={currentStory.avatar || '/placeholder.svg'}
            alt={currentStory.username}
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="text-white font-medium">{currentStory.username}</span>
          <span className="text-white/70 text-sm">{currentContent.timestamp}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-white">
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="w-full h-full flex items-center justify-center">
        {currentContent.type === 'image' ? (
          <img
            src={currentContent.content}
            alt="Story content"
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <div className="text-white text-2xl font-bold text-center p-8">
            {currentContent.content}
          </div>
        )}
      </div>

      {/* Navigation */}
      <button
        onClick={handlePrevious}
        className="absolute left-0 top-0 w-1/3 h-full bg-transparent"
        disabled={currentStoryIndex === 0 && currentContentIndex === 0}
      />
      <button
        onClick={handleNext}
        className="absolute right-0 top-0 w-1/3 h-full bg-transparent"
      />

      {/* Navigation arrows */}
      {currentStoryIndex > 0 || currentContentIndex > 0 ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevious}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
      ) : null}

      {currentStoryIndex < stories.length - 1 || currentContentIndex < currentStory.stories.length - 1 ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNext}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white"
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      ) : null}
    </div>
  );
};

export default StoryViewer;
