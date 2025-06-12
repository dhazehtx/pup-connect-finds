
import React, { useState, useRef, useEffect } from 'react';
import { X, Check, RotateCw, Crop } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InteractiveImageEditorProps {
  imageUrl: string;
  onSave: (canvas: HTMLCanvasElement) => void;
  onCancel: () => void;
}

const InteractiveImageEditor = ({ imageUrl, onSave, onCancel }: InteractiveImageEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImage(img);
      drawImage(img, 0);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const drawImage = (img: HTMLImageElement, rotationAngle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size for story format (9:16 aspect ratio)
    const targetWidth = 400;
    const targetHeight = 600;
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    // Calculate scaling to fit/fill the story format
    const scaleX = targetWidth / img.width;
    const scaleY = targetHeight / img.height;
    const scale = Math.max(scaleX, scaleY); // Use max to fill the area

    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;

    // Center the image
    const x = (targetWidth - scaledWidth) / 2;
    const y = (targetHeight - scaledHeight) / 2;

    // Apply rotation
    ctx.save();
    ctx.translate(targetWidth / 2, targetHeight / 2);
    ctx.rotate((rotationAngle * Math.PI) / 180);
    ctx.translate(-targetWidth / 2, -targetHeight / 2);

    // Draw image
    ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
    ctx.restore();
  };

  const handleRotate = () => {
    if (!image) return;
    const newRotation = (rotation + 90) % 360;
    setRotation(newRotation);
    drawImage(image, newRotation);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      onSave(canvas);
    }
  };

  return (
    <div className="w-full h-full bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black text-white">
        <Button variant="ghost" size="sm" onClick={onCancel} className="text-white">
          <X className="w-6 h-6" />
        </Button>
        <h3 className="text-lg font-semibold">Edit Story</h3>
        <Button variant="ghost" size="sm" onClick={handleSave} className="text-white">
          <Check className="w-6 h-6" />
        </Button>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center p-4">
        <canvas
          ref={canvasRef}
          className="max-w-full max-h-full border border-gray-600 rounded-lg"
        />
      </div>

      {/* Controls */}
      <div className="p-4 bg-black border-t border-gray-800">
        <div className="flex justify-center space-x-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRotate}
            className="text-white flex flex-col items-center space-y-1"
          >
            <RotateCw className="w-6 h-6" />
            <span className="text-xs">Rotate</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InteractiveImageEditor;
