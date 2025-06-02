
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
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Story dimensions (9:16 aspect ratio)
  const storyWidth = 360;
  const storyHeight = 640;

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

  return (
    <div className="space-y-4">
      <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '9/16', height: '500px' }}>
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
            <div className="absolute inset-0 bg-blue-500/10 border-2 border-blue-500 border-dashed" />
          )}
        </div>
        
        {/* Scale indicator */}
        <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
          {Math.round(scale * 100)}%
        </div>
        
        {/* Instructions */}
        <div className="absolute bottom-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-xs max-w-48">
          Pinch to zoom, drag to move
        </div>
      </div>

      {/* Controls */}
      <div className="flex space-x-2">
        <button
          onClick={() => setScale(prev => Math.max(0.5, prev - 0.1))}
          className="px-3 py-2 bg-gray-200 rounded text-sm"
        >
          Zoom Out
        </button>
        <button
          onClick={() => setScale(prev => Math.min(3, prev + 0.1))}
          className="px-3 py-2 bg-gray-200 rounded text-sm"
        >
          Zoom In
        </button>
        <button
          onClick={() => {
            setScale(1);
            setPosition({ x: 0, y: 0 });
          }}
          className="px-3 py-2 bg-gray-200 rounded text-sm"
        >
          Reset
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex space-x-2">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 border-2 border-gray-500 text-gray-700 hover:bg-gray-100 rounded"
        >
          Back
        </button>
        <button
          onClick={handleSave}
          className="flex-1 px-4 py-2 bg-gray-600 text-white hover:bg-gray-700 rounded"
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
