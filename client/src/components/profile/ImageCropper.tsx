import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';

type CropArea = {
  unit: '%' | 'px';
  x: number;
  y: number;
  width: number;
  height: number;
};
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropperProps {
  src: string;
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedImage: File) => void;
  /** Aspect ratio (width/height). Default 1 (square). Use 4/5 for portrait posts. */
  aspect?: number;
  circularCrop?: boolean;
  title?: string;
  outputFileName?: string;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

const ImageCropper = ({
  src,
  isOpen,
  onClose,
  onCropComplete,
  aspect = 1,
  circularCrop = true,
  title = 'Crop Your Photo',
  outputFileName = 'cropped.jpg',
}: ImageCropperProps) => {
  const [crop, setCrop] = useState<CropArea>();
  const [completedCrop, setCompletedCrop] = useState<CropArea>();
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    },
    [aspect],
  );

  const getCroppedImg = useCallback(async () => {
    if (!completedCrop || !imgRef.current || !canvasRef.current) {
      return;
    }

    const image = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return;
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const pixelCrop = {
      x: (completedCrop.x ?? 0) * scaleX,
      y: (completedCrop.y ?? 0) * scaleY,
      width: (completedCrop.width ?? 0) * scaleX,
      height: (completedCrop.height ?? 0) * scaleY,
    };

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height,
    );

    return new Promise<File>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], outputFileName, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(file);
        }
      }, 'image/jpeg', 0.9);
    });
  }, [completedCrop, outputFileName]);

  const handleCropComplete = async () => {
    const croppedImage = await getCroppedImg();
    if (!croppedImage || croppedImage.size === 0) {
      return;
    }
    onCropComplete(croppedImage);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4">
          <ReactCrop
            crop={crop}
            onChange={(_crop: CropArea, percentCrop: CropArea) => setCrop(percentCrop)}
            onComplete={(c: CropArea) => setCompletedCrop(c)}
            aspect={aspect}
            circularCrop={circularCrop}
          >
            <img
              ref={imgRef}
              alt="Crop preview"
              src={src}
              onLoad={onImageLoad}
              className="max-h-96 max-w-full"
            />
          </ReactCrop>

          <canvas ref={canvasRef} className="hidden" />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-slate-300 text-slate-900">
            Cancel
          </Button>
          <Button onClick={handleCropComplete} className="bg-blue-600 text-white hover:bg-blue-700">
            Apply Crop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropper;
