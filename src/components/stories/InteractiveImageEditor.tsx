
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
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [initialSetupComplete, setInitialSetupComplete] = useState(false);

  // Calculate container dimensions based on mobile screen
  useEffect(() => {
    const updateContainerSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const availableHeight = window.innerHeight - 200; // Account for header and controls
        const maxHeight = Math.min(availableHeight, rect.width * (16/9)); // 9:16 aspect ratio
        
        setContainerDimensions({
          width: rect.width,
          height: maxHeight
        });
      }
    };

    updateContainerSize();
    window.addEventListener('resize', updateContainerSize);
    return () => window.removeEventListener('resize', updateContainerSize);
  }, []);

  // Calculate initial scale to fit image properly in story format
  const calculateInitialScale = useCallback((imgWidth: number, imgHeight: number, containerWidth: number, containerHeight: number) => {
    const containerAspectRatio = containerWidth / containerHeight;
    const imageAspectRatio = imgWidth / imgHeight;
    
    let initialScale;
    if (imageAspectRatio > containerAspectRatio) {
      // Image is wider - scale to fit height
      initialScale = containerHeight / imgHeight;
    } else {
      // Image is taller - scale to fit width
      initialScale = containerWidth / imgWidth;
    }
    
    return Math.max(initialScale, 0.3); // Ensure minimum scale for mobile
  }, []);

  // Handle image load to set initial scale and position
  useEffect(() => {
    if (imageRef.current && !initialSetupComplete && containerDimensions.width > 0) {
      const img = imageRef.current;
      
      const handleImageLoad = () => {
        const naturalWidth = img.naturalWidth;
        const naturalHeight = img.naturalHeight;
        
        // Calculate and set initial scale for optimal crop
        const initialScale = calculateInitialScale(
          naturalWidth, 
          naturalHeight, 
          containerDimensions.width, 
          containerDimensions.height
        );
        
        // Use setTimeout to avoid React warning about updating during render
        setTimeout(() => {
          setImageDimensions({ width: naturalWidth, height: naturalHeight });
          setScale(initialScale);
          setPosition({ x: 0, y: 0 });
          setImageLoaded(true);
          setInitialSetupComplete(true);
          
          console.log(`Image auto-fitted: ${naturalWidth}x${naturalHeight} -> scale: ${initialScale.toFixed(2)}`);
        }, 0);
      };

      if (img.complete && img.naturalWidth > 0) {
        handleImageLoad();
      } else {
        img.addEventListener('load', handleImageLoad);
        return () => img.removeEventListener('load', handleImageLoad);
      }
    }
  }, [imageUrl, initialSetupComplete, calculateInitialScale, containerDimensions]);

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
      setScale(prev => Math.max(0.3, Math.min(5, prev * scaleChange)));
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
    setScale(prev => Math.max(0.3, Math.min(5, prev * scaleChange)));
  }, []);

  const handleSave = () => {
    if (!imageRef.current || !canvasRef.current || !containerDimensions.width) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use container dimensions for canvas
    canvas.width = containerDimensions.width;
    canvas.height = containerDimensions.height;

    // Fill with black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, containerDimensions.width, containerDimensions.height);

    // Calculate image position and size
    const img = imageRef.current;
    const imgWidth = img.naturalWidth * scale;
    const imgHeight = img.naturalHeight * scale;
    
    // Center the image initially, then apply position offset
    const centerX = (containerDimensions.width - imgWidth) / 2 + position.x;
    const centerY = (containerDimensions.height - imgHeight) / 2 + position.y;

    ctx.drawImage(img, centerX, centerY, imgWidth, imgHeight);
    
    onSave(canvas);
  };

  const resetToOptimalCrop = () => {
    if (imageDimensions.width && imageDimensions.height && containerDimensions.width) {
      const initialScale = calculateInitialScale(
        imageDimensions.width, 
        imageDimensions.height, 
        containerDimensions.width, 
        containerDimensions.height
      );
      setScale(initialScale);
      setPosition({ x: 0, y: 0 });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-background z-10">
        <h2 className="text-lg font-semibold text-foreground">Edit Your Story</h2>
        <button
          onClick={onCancel}
          className="p-2 text-foreground hover:bg-muted rounded-full transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Image Editor Container - Mobile Optimized */}
      <div className="flex-1 flex flex-col min-h-0 p-4">
        <div 
          ref={containerRef}
          className="relative bg-muted rounded-lg overflow-hidden flex-1 border border-border" 
          style={{ 
            height: containerDimensions.height || 'auto',
            maxHeight: '70vh'
          }}
        >
          <div
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
              <div className="absolute inset-0 bg-primary/10 border-2 border-primary border-dashed" />
            )}
          </div>
          
          {/* Scale indicator - Enhanced visibility */}
          <div className="absolute top-3 right-3 bg-black/80 text-white px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm">
            {Math.round(scale * 100)}%
          </div>
          
          {/* Instructions - Enhanced visibility */}
          <div className="absolute bottom-3 left-3 bg-black/80 text-white px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm">
            {initialSetupComplete ? 'Pinch to zoom, drag to move' : 'Loading...'}
          </div>
        </div>

        {/* Controls - Enhanced for Mobile with better spacing */}
        <div className="grid grid-cols-3 gap-3 py-4">
          <button
            onClick={() => setScale(prev => Math.max(0.3, prev - 0.2))}
            className="px-4 py-3 bg-secondary text-secondary-foreground rounded-lg text-sm font-semibold hover:bg-secondary/80 active:bg-secondary/60 transition-all duration-200 border border-border shadow-sm touch-manipulation"
          >
            Zoom Out
          </button>
          <button
            onClick={resetToOptimalCrop}
            className="px-4 py-3 bg-accent text-accent-foreground rounded-lg text-sm font-semibold hover:bg-accent/80 active:bg-accent/60 transition-all duration-200 border border-border shadow-sm touch-manipulation"
          >
            Auto Fit
          </button>
          <button
            onClick={() => setScale(prev => Math.min(5, prev + 0.2))}
            className="px-4 py-3 bg-secondary text-secondary-foreground rounded-lg text-sm font-semibold hover:bg-secondary/80 active:bg-secondary/60 transition-all duration-200 border border-border shadow-sm touch-manipulation"
          >
            Zoom In
          </button>
        </div>
      </div>

      {/* Action buttons - Fixed to bottom with safe area */}
      <div className="flex gap-4 p-4 bg-background border-t border-border safe-area-inset-bottom">
        <button
          onClick={onCancel}
          className="flex-1 px-6 py-4 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground active:bg-primary/90 rounded-lg font-semibold transition-all duration-200 bg-background shadow-sm min-h-[52px] touch-manipulation"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="flex-1 px-6 py-4 bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 rounded-lg font-semibold transition-all duration-200 shadow-sm min-h-[52px] touch-manipulation"
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
