
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { 
  ArrowRight, 
  Type, 
  Palette, 
  Sparkles, 
  RotateCw, 
  Crop,
  Sun,
  Contrast,
  Zap
} from 'lucide-react';

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
  const [editMode, setEditMode] = useState<'crop' | 'text' | 'filters' | 'adjust'>('crop');
  const [textInput, setTextInput] = useState('');
  const [textElements, setTextElements] = useState<Array<{id: number, text: string, x: number, y: number, color: string}>>([]);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [initialSetupComplete, setInitialSetupComplete] = useState(false);

  // Calculate container dimensions for perfect 9:16 story format
  useEffect(() => {
    const updateContainerSize = () => {
      if (containerRef.current) {
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        const maxWidth = Math.min(viewportWidth - 16, 420);
        const storyHeight = Math.min(viewportHeight * 0.75, 746);
        const storyWidth = storyHeight * (9/16);
        
        const finalWidth = Math.min(maxWidth, storyWidth);
        const finalHeight = finalWidth * (16/9);
        
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
    
    let initialScale;
    if (imageAspectRatio > containerAspectRatio) {
      initialScale = containerHeight / imgHeight;
    } else {
      initialScale = containerWidth / imgWidth;
    }
    
    return Math.max(initialScale * 1.02, 1.1);
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
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setTextElements([]);
  }, [imageUrl]);

  // Touch handling for cropping
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (editMode !== 'crop') return;
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
  }, [editMode]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (editMode !== 'crop') return;
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
  }, [editMode, isDragging, lastTouch, lastDistance]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setLastTouch(null);
    setLastDistance(0);
  }, []);

  const handleAddText = () => {
    if (textInput.trim()) {
      const newText = {
        id: Date.now(),
        text: textInput,
        x: 50,
        y: 50,
        color: '#FFFFFF'
      };
      setTextElements(prev => [...prev, newText]);
      setTextInput('');
    }
  };

  const resetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
  };

  const handleSave = () => {
    if (!imageRef.current || !canvasRef.current || !containerDimensions.width) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = containerDimensions.width;
    canvas.height = containerDimensions.height;

    // Apply filters
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    
    // Black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, containerDimensions.width, containerDimensions.height);

    const img = imageRef.current;
    const imgWidth = img.naturalWidth * scale;
    const imgHeight = img.naturalHeight * scale;
    
    const centerX = (containerDimensions.width - imgWidth) / 2 + position.x;
    const centerY = (containerDimensions.height - imgHeight) / 2 + position.y;

    ctx.drawImage(img, centerX, centerY, imgWidth, imgHeight);
    
    // Reset filter for text
    ctx.filter = 'none';
    
    // Draw text elements
    textElements.forEach(textEl => {
      ctx.fillStyle = textEl.color;
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(textEl.text, (textEl.x / 100) * containerDimensions.width, (textEl.y / 100) * containerDimensions.height);
    });
    
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
          className="text-white text-lg font-medium hover:opacity-80 transition-opacity touch-manipulation min-h-[44px] px-2"
        >
          Cancel
        </button>
        <h2 className="text-white font-semibold">Edit Story</h2>
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors touch-manipulation min-h-[44px]"
        >
          <span className="font-semibold">Share</span>
          <ArrowRight className="w-4 h-4" />
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
            style={{
              filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
            }}
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
            
            {/* Text elements overlay */}
            {textElements.map(textEl => (
              <div
                key={textEl.id}
                className="absolute font-bold text-2xl text-center pointer-events-none select-none"
                style={{
                  left: `${textEl.x}%`,
                  top: `${textEl.y}%`,
                  color: textEl.color,
                  transform: 'translate(-50%, -50%)',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                }}
              >
                {textEl.text}
              </div>
            ))}
            
            {/* Visual feedback when dragging */}
            {isDragging && editMode === 'crop' && (
              <div className="absolute inset-0 bg-white/5 border border-white/30 border-dashed rounded-lg" />
            )}
          </div>
        </div>

        {/* Edit mode tabs */}
        <div className="flex items-center justify-center space-x-2 mt-4 bg-gray-900 rounded-full p-1">
          <button
            onClick={() => setEditMode('crop')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors touch-manipulation min-h-[40px] ${
              editMode === 'crop' ? 'bg-white text-black' : 'text-white hover:bg-gray-800'
            }`}
          >
            <Crop className="w-4 h-4 mr-1 inline" />
            Crop
          </button>
          <button
            onClick={() => setEditMode('text')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors touch-manipulation min-h-[40px] ${
              editMode === 'text' ? 'bg-white text-black' : 'text-white hover:bg-gray-800'
            }`}
          >
            <Type className="w-4 h-4 mr-1 inline" />
            Text
          </button>
          <button
            onClick={() => setEditMode('adjust')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors touch-manipulation min-h-[40px] ${
              editMode === 'adjust' ? 'bg-white text-black' : 'text-white hover:bg-gray-800'
            }`}
          >
            <Sun className="w-4 h-4 mr-1 inline" />
            Adjust
          </button>
        </div>

        {/* Edit controls */}
        <div className="w-full max-w-md mt-4 px-4">
          {editMode === 'crop' && (
            <div className="flex items-center justify-center space-x-4">
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
          )}

          {editMode === 'text' && (
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Add text..."
                  className="flex-1 bg-gray-800 text-white border-gray-600 min-h-[48px] touch-manipulation"
                />
                <Button
                  onClick={handleAddText}
                  className="bg-blue-500 hover:bg-blue-600 min-h-[48px] touch-manipulation"
                >
                  Add
                </Button>
              </div>
              <p className="text-white/70 text-sm text-center">
                {textElements.length} text element(s) added
              </p>
            </div>
          )}

          {editMode === 'adjust' && (
            <div className="space-y-4">
              <div>
                <label className="text-white text-sm mb-2 block">Brightness</label>
                <Slider
                  value={[brightness]}
                  onValueChange={(value) => setBrightness(value[0])}
                  min={50}
                  max={150}
                  step={1}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-white text-sm mb-2 block">Contrast</label>
                <Slider
                  value={[contrast]}
                  onValueChange={(value) => setContrast(value[0])}
                  min={50}
                  max={150}
                  step={1}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-white text-sm mb-2 block">Saturation</label>
                <Slider
                  value={[saturation]}
                  onValueChange={(value) => setSaturation(value[0])}
                  min={0}
                  max={200}
                  step={1}
                  className="w-full"
                />
              </div>
              <button
                onClick={resetFilters}
                className="w-full px-4 py-3 bg-gray-800 text-white rounded-full text-sm font-semibold hover:bg-gray-700 transition-colors touch-manipulation"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default InteractiveImageEditor;
