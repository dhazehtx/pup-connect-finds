import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useSwipeGestures } from '@/hooks/useSwipeGestures';

interface InteractiveImageEditorProps {
  imageUrl: string;
  onSave: (canvas: HTMLCanvasElement) => void;
  onCancel: () => void;
}

const InteractiveImageEditor = ({ imageUrl, onSave, onCancel }: InteractiveImageEditorProps) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastTouch, setLastTouch] = useState<{ x: number; y: number } | null>(null);
  const [lastDistance, setLastDistance] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [initialSetupComplete, setInitialSetupComplete] = useState(false);

  // Story dimensions (9:16 aspect ratio)
  const storyWidth = 360;
  const storyHeight = 640;

  // Calculate initial scale to fit image properly in story format
  const calculateInitialScale = useCallback((imgWidth: number, imgHeight: number) => {
    const containerAspectRatio = storyWidth / storyHeight; // 9:16 = 0.5625
    const imageAspectRatio = imgWidth / imgHeight;
    
    let initialScale;
    if (imageAspectRatio > containerAspectRatio) {
      // Image is wider - scale to fit height
      initialScale = storyHeight / imgHeight;
    } else {
      // Image is taller - scale to fit width
      initialScale = storyWidth / imgWidth;
    }
    
    return Math.max(initialScale, 0.5); // Ensure minimum scale
  }, []);

  // Handle image load to set initial scale and position
  useEffect(() => {
    if (imageRef.current && !initialSetupComplete) {
      const img = imageRef.current;
      
      const handleImageLoad = () => {
        const naturalWidth = img.naturalWidth;
        const naturalHeight = img.naturalHeight;
        
        // Calculate and set initial scale for optimal crop
        const initialScale = calculateInitialScale(naturalWidth, naturalHeight);
        
        // Use setTimeout to avoid React warning about updating during render
        setTimeout(() => {
          setImageDimensions({ width: naturalWidth, height: naturalHeight });
          setScale(initialScale);
          setPosition({ x: 0, y: 0 });
          setImageLoaded(true);
          setInitialSetupComplete(true);
          
          console.log(`Image auto-cropped: ${naturalWidth}x${naturalHeight} -> scale: ${initialScale.toFixed(2)}`);
        }, 0);
      };

      if (img.complete && img.naturalWidth > 0) {
        handleImageLoad();
      } else {
        img.addEventListener('load', handleImageLoad);
        return () => img.removeEventListener('load', handleImageLoad);
      }
    }
  }, [imageUrl, initialSetupComplete, calculateInitialScale]);

  // Reset when imageUrl changes
  useEffect(() => {
    setInitialSetupComplete(false);
    setImageLoaded(false);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [imageUrl]);

  // Touch events
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    
    if (e.touches.length === 1) {
      // Single touch - start dragging
      setIsDragging(true);
      setLastTouch({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      });
    } else if (e.touches.length === 2) {
      // Two touches - start pinching
      setIsDragging(false);
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      setLastDistance(distance);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    
    if (e.touches.length === 1 && isDragging && lastTouch) {
      // Single touch - dragging
      const deltaX = e.touches[0].clientX - lastTouch.x;
      const deltaY = e.touches[0].clientY - lastTouch.y;
      
      setPosition(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      setLastTouch({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      });
    } else if (e.touches.length === 2 && lastDistance > 0) {
      // Two touches - pinching
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      const scaleChange = distance / lastDistance;
      setScale(prev => Math.max(0.5, Math.min(3, prev * scaleChange)));
      setLastDistance(distance);
    }
  }, [isDragging, lastTouch, lastDistance]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setLastTouch(null);
    setLastDistance(0);
  }, []);

  // Mouse events for desktop
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setLastTouch({
      x: e.clientX,
      y: e.clientY
    });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && lastTouch) {
      const deltaX = e.clientX - lastTouch.x;
      const deltaY = e.clientY - lastTouch.y;
      
      setPosition(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      setLastTouch({
        x: e.clientX,
        y: e.clientY
      });
    }
  }, [isDragging, lastTouch]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setLastTouch(null);
  }, []);

  // Wheel event for desktop zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const scaleChange = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.max(0.5, Math.min(3, prev * scaleChange)));
  }, []);

  const handleSave = () => {
    if (!imageRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = storyWidth;
    canvas.height = storyHeight;

    // Fill with black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, storyWidth, storyHeight);

    // Calculate image position and size
    const img = imageRef.current;
    const imgWidth = img.naturalWidth * scale;
    const imgHeight = img.naturalHeight * scale;
    
    // Center the image initially, then apply position offset
    const centerX = (storyWidth - imgWidth) / 2 + position.x;
    const centerY = (storyHeight - imgHeight) / 2 + position.y;

    ctx.drawImage(img, centerX, centerY, imgWidth, imgHeight);
    
    onSave(canvas);
  };

  const resetToOptimalCrop = () => {
    if (imageDimensions.width && imageDimensions.height) {
      const initialScale = calculateInitialScale(imageDimensions.width, imageDimensions.height);
      setScale(initialScale);
      setPosition({ x: 0, y: 0 });
    }
  };

  return (
    <div className="flex flex-col h-full max-h-screen bg-background p-4 space-y-4">
      {/* Image Editor Container - Mobile Optimized */}
      <div className="flex-1 flex flex-col min-h-0">
        <div 
          className="relative bg-black rounded-lg overflow-hidden flex-1 min-h-0" 
          style={{ aspectRatio: '9/16', maxHeight: 'calc(100vh - 200px)' }}
        >
          <div
            ref={containerRef}
            className="w-full h-full relative cursor-move touch-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Story content"
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none"
              style={{
                transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transition: isDragging ? 'none' : 'transform 0.1s ease-out'
              }}
              draggable={false}
            />
            
            {/* Visual feedback overlay */}
            {isDragging && (
              <div className="absolute inset-0 bg-royal-blue/10 border-2 border-royal-blue border-dashed" />
            )}
          </div>
          
          {/* Scale indicator */}
          <div className="absolute top-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-sm">
            {Math.round(scale * 100)}%
          </div>
          
          {/* Instructions */}
          <div className="absolute bottom-4 left-4 bg-black/70 text-white px-2 py-1 rounded text-xs max-w-48">
            {initialSetupComplete ? 'Auto-cropped for Stories' : 'Loading...'}
          </div>
        </div>

        {/* Controls - Mobile Optimized */}
        <div className="flex gap-2 py-3">
          <button
            onClick={() => setScale(prev => Math.max(0.5, prev - 0.1))}
            className="flex-1 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
          >
            Zoom Out
          </button>
          <button
            onClick={() => setScale(prev => Math.min(3, prev + 0.1))}
            className="flex-1 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
          >
            Zoom In
          </button>
          <button
            onClick={resetToOptimalCrop}
            className="flex-1 px-3 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:bg-accent/80 transition-colors"
          >
            Auto Crop
          </button>
        </div>
      </div>

      {/* Action buttons - Fixed at bottom for mobile */}
      <div className="flex gap-3 pb-safe">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-3 border-2 border-border text-foreground hover:bg-accent hover:text-accent-foreground rounded-lg font-medium transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleSave}
          className="flex-1 px-4 py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium transition-colors"
        >
          Post Story
        </button>
      </div>

      {/* Hidden canvas for export */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default InteractiveImageEditor;
