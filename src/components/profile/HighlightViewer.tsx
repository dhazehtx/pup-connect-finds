
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface Highlight {
  id: string | number;
  title: string;
  cover: string;
  type?: 'image' | 'video';
}

interface HighlightViewerProps {
  isOpen: boolean;
  onClose: () => void;
  highlights: Highlight[];
  currentIndex: number;
  onNext: () => void;
  onPrevious: () => void;
}

const HighlightViewer = ({ 
  isOpen, 
  onClose, 
  highlights, 
  currentIndex, 
  onNext, 
  onPrevious 
}: HighlightViewerProps) => {
  const currentHighlight = highlights[currentIndex];

  if (!currentHighlight) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0">
        <div className="relative bg-black rounded-lg overflow-hidden">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
            <h3 className="text-white font-medium">{currentHighlight.title}</h3>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="aspect-square flex items-center justify-center">
            {currentHighlight.type === 'video' ? (
              <video
                src={currentHighlight.cover}
                className="w-full h-full object-cover"
                controls
                autoPlay
              />
            ) : (
              <img
                src={currentHighlight.cover}
                alt={currentHighlight.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Navigation */}
          {highlights.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={onPrevious}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onNext}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </>
          )}

          {/* Progress indicators */}
          {highlights.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {highlights.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HighlightViewer;
