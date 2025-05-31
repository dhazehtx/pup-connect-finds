import React, { useState } from 'react';
import { Camera, User, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AvatarUploadProps {
  currentAvatar?: string;
  onAvatarChange: (url: string) => void;
  userName?: string;
}

const AvatarUpload = ({ currentAvatar, onAvatarChange, userName }: AvatarUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const { uploadImage, uploading, uploadProgress } = useImageUpload();
  const { toast } = useToast();

  const handleFile = async (file: File) => {
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "File size must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Only JPEG, PNG, and WebP files are allowed",
        variant: "destructive",
      });
      return;
    }

    const imageId = `avatar-${Date.now()}`;
    const url = await uploadImage(file, imageId);
    if (url) {
      onAvatarChange(url);
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

  const getUploadProgress = () => {
    const imageId = `avatar-${Date.now()}`;
    return uploadProgress[imageId] || 0;
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="w-24 h-24">
          <AvatarImage src={currentAvatar} alt={userName || 'User'} />
          <AvatarFallback className="text-lg">
            <User size={32} />
          </AvatarFallback>
        </Avatar>
        
        {currentAvatar && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={() => onAvatarChange('')}
          >
            <X size={12} />
          </Button>
        )}
      </div>

      <div
        className={cn(
          "border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors cursor-pointer",
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
              <Upload className="h-6 w-6 text-blue-500 animate-pulse" />
              <p className="text-sm text-gray-600">Uploading... {getUploadProgress()}%</p>
            </>
          ) : (
            <>
              <Camera className="h-6 w-6 text-gray-400" />
              <p className="text-sm text-gray-600">
                Drag photo here or{' '}
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
              <p className="text-xs text-gray-400">PNG, JPG, WebP up to 10MB</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvatarUpload;
