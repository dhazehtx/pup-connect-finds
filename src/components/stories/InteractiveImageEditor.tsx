
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

  // Calculate container dimensions for perfect 9:16 story format (Instagram style)
  useEffect(() => {
    const updateContainerSize = () => {
      if (containerRef.current) {
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        // Instagram story dimensions - prioritize mobile experience
        const maxWidth = Math.min(viewportWidth - 16, 420); // Slight padding for mobile
        const storyHeight = Math.min(viewportHeight * 0.75, 746); // Max Instagram story height
        const storyWidth = storyHeight * (9/16); // Perfect 9:16 ratio
        
        const finalWidth = Math.min(maxWidth, storyWidth);
        const finalHeight = finalWidth * (16/9); // Maintain exact 9:16
        
        setContainerDimensions({
          width: finalWidth,
          height: finalHeight
        });
      }
    };

    updateContainerSize();
    window.addEventListener('resize', updateContainerSize);
    return () => window.removeEventListener('resize', updateContainerSize);
  }, []);

  // Instagram-style auto-fit calculation
  const calculateInitialScale = useCallback((imgWidth: number, imgHeight: number, containerWidth: number, containerHeight: number) => {
    const containerAspectRatio = containerWidth / containerHeight;
    const imageAspectRatio = imgWidth / imgHeight;
    
    // Always fill the story frame completely (Instagram behavior)
    let initialScale;
    if (imageAspectRatio > containerAspectRatio) {
      // Image is wider - scale to fill height completely
      initialScale = containerHeight / imgHeight;
    } else {
      // Image is taller - scale to fill width completely  
      initialScale = containerWidth / imgWidth;
    }
    
    // Ensure no empty space (Instagram always fills completely)
    return Math.max(initialScale * 1.02, 1.1); // Slight overscan for complete fill
  }, []);

  // Setup initial scale and position when image loads
  useEffect(() => {
    if (imageRef.current && !initialSetupComplete && containerDimensions.width > 0) {
      const img = imageRef.current;
      
      const handleImageLoad = () => {
        const naturalWidth = img.naturalWidth;
        const naturalHeight = img.naturalHeight;
        
        const initialScale = calculateInitialScale(
          naturalWidth, 
          naturalHeight, 
          containerDimensions.width, 
          containerDimensions.height
        );
        
        // Small delay to ensure smooth loading
        setTimeout(() => {
          setImageDimensions({ width: naturalWidth, height: naturalHeight });
          setScale(initialScale);
          setPosition({ x: 0, y: 0 });
          setImageLoaded(true);
          setInitialSetupComplete(true);
          
          console.log(`Auto-fitted for story: ${naturalWidth}x${naturalHeight} -> scale: ${initialScale.toFixed(2)}`);
        }, 50);
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

  // Enhanced touch handling for better mobile experience
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    
    if (e.touches.length === 1) {
      setIsDragging(true);
      setLastTouch({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      });
    } else if (e.touches.length === 2) {
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
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      const scaleChange = distance / lastDistance;
      setScale(prev => Math.max(0.3, Math.min(4, prev * scaleChange)));
      setLastDistance(distance);
    }
  }, [isDragging, lastTouch, lastDistance]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setLastTouch(null);
    setLastDistance(0);
  }, []);

  // Desktop support
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

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const scaleChange = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.max(0.3, Math.min(4, prev * scaleChange)));
  }, []);

  const handleSave = () => {
    if (!imageRef.current || !canvasRef.current || !containerDimensions.width) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas to exact Instagram story dimensions
    canvas.width = containerDimensions.width;
    canvas.height = containerDimensions.height;

    // Black background (Instagram style)
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, containerDimensions.width, containerDimensions.height);

    const img = imageRef.current;
    const imgWidth = img.naturalWidth * scale;
    const imgHeight = img.naturalHeight * scale;
    
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

  const handleCancel = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col overflow-hidden z-50">
      {/* Instagram-style header */}
      <div className="flex items-center justify-between p-4 bg-black z-10 shrink-0">
        <button
          onClick={handleCancel}
          className="text-white text-lg font-medium hover:opacity-80 transition-opacity"
        >
          Cancel
        </button>
        <h2 className="text-white font-semibold">New Story</h2>
        <button
          onClick={handleSave}
          className="text-blue-500 text-lg font-semibold hover:opacity-80 transition-opacity"
        >
          Share
        </button>
      </div>

      {/* Main editing area */}
      <div className="flex-1 flex flex-col items-center justify-center p-2 min-h-0 bg-black">
        <div 
          ref={containerRef}
          className="relative bg-black rounded-xl overflow-hidden shadow-2xl" 
          style={{ 
            width: containerDimensions.width || 300,
            height: containerDimensions.height || 533,
            aspectRatio: '9/16'
          }}
        >
          <div
            className="w-full h-full relative cursor-move touch-none overflow-hidden"
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
                transition: isDragging ? 'none' : 'transform 0.2s ease-out'
              }}
              draggable={false}
            />
            
            {/* Visual feedback when dragging */}
            {isDragging && (
              <div className="absolute inset-0 bg-white/5 border border-white/30 border-dashed rounded-lg" />
            )}
          </div>
          
          {/* Zoom indicator */}
          <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm">
            {Math.round(scale * 100)}%
          </div>
          
          {/* Instructions overlay */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
            {initialSetupComplete ? 'Pinch to zoom • Drag to move' : 'Loading...'}
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center justify-center space-x-6 mt-6">
          <button
            onClick={() => setScale(prev => Math.max(0.3, prev - 0.15))}
            className="w-12 h-12 bg-gray-800 text-white rounded-full text-xl font-bold hover:bg-gray-700 active:bg-gray-900 transition-colors shadow-lg touch-manipulation"
          >
            −
          </button>
          <button
            onClick={resetToOptimalCrop}
            className="px-6 py-3 bg-white text-black rounded-full text-sm font-semibold hover:bg-gray-100 active:bg-gray-200 transition-colors shadow-lg touch-manipulation"
          >
            Reset
          </button>
          <button
            onClick={() => setScale(prev => Math.min(4, prev + 0.15))}
            className="w-12 h-12 bg-gray-800 text-white rounded-full text-xl font-bold hover:bg-gray-700 active:bg-gray-900 transition-colors shadow-lg touch-manipulation"
          >
            +
          </button>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default InteractiveImageEditor;
