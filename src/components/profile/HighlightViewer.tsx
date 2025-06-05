
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
      <DialogContent className="max-w-sm p-0 bg-black">
        <div className="relative h-[80vh] flex items-center justify-center">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
          >
            <X size={20} />
          </Button>

          {/* Navigation buttons */}
          {highlights.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={onPrevious}
                className="absolute left-4 z-10 text-white hover:bg-white/20"
              >
                <ChevronLeft size={20} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onNext}
                className="absolute right-4 z-10 text-white hover:bg-white/20"
              >
                <ChevronRight size={20} />
              </Button>
            </>
          )}

          {/* Content */}
          <div className="w-full h-full flex flex-col">
            {currentHighlight.type === 'video' ? (
              <video 
                src={currentHighlight.cover} 
                className="flex-1 w-full object-cover"
                controls
                autoPlay
              />
            ) : (
              <img 
                src={currentHighlight.cover} 
                alt={currentHighlight.title}
                className="flex-1 w-full object-cover"
              />
            )}
            
            {/* Title */}
            <div className="p-4 text-white">
              <h3 className="font-medium">{currentHighlight.title}</h3>
            </div>
          </div>

          {/* Dots indicator */}
          {highlights.length > 1 && (
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-1">
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
