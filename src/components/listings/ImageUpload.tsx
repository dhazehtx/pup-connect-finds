
import React, { useState } from 'react';
import { Camera, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFileUpload } from '@/hooks/useFileUpload';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  className?: string;
  folder?: string;
}

const ImageUpload = ({ value, onChange, className, folder = 'listings' }: ImageUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const { uploadFile, uploading, progress } = useFileUpload({
    bucket: 'dog-images',
    folder,
    maxSizeBytes: 50 * 1024 * 1024, // 50MB
  });

  const handleFile = async (file: File) => {
    const url = await uploadFile(file);
    if (url) {
      onChange(url);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className={cn("relative", className)}>
      {value ? (
        <div className="relative">
          <img
            src={value}
            alt="Uploaded"
            className="w-full h-48 object-cover rounded-lg"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={() => onChange('')}
          >
            <X size={16} />
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            "border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors",
            dragActive && "border-blue-400 bg-blue-50",
            uploading && "opacity-50 pointer-events-none"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center space-y-2">
            {uploading ? (
              <>
                <Upload className="h-8 w-8 text-blue-500 animate-pulse" />
                <p className="text-sm text-gray-600">Uploading... {progress}%</p>
              </>
            ) : (
              <>
                <Camera className="h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-600">
                  Drag and drop an image, or{' '}
                  <label className="text-blue-500 hover:text-blue-700 cursor-pointer">
                    browse
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileInput}
                    />
                  </label>
                </p>
                <p className="text-xs text-gray-400">PNG, JPG, WebP up to 50MB</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
