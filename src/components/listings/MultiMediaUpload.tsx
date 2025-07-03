
import React, { useState, useCallback } from 'react';
import { Upload, X, Image, Video, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useUnifiedFileUpload } from '@/hooks/useUnifiedFileUpload';

interface UploadedFile {
  id: string;
  file: File;
  type: 'image' | 'video';
  previewUrl: string;
  uploadedUrl?: string;
  uploading?: boolean;
}

interface MultiMediaUploadProps {
  onImagesChange: (urls: string[]) => void;
  onVideoChange: (url: string) => void;
  className?: string;
}

const MultiMediaUpload = ({ onImagesChange, onVideoChange, className }: MultiMediaUploadProps) => {
  const { toast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const { uploadFile: uploadToStorage, uploading } = useUnifiedFileUpload({
    bucket: 'dog-images',
    folder: 'listings',
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/mov']
  });

  const validateFile = useCallback((file: File): { valid: boolean; type?: 'image' | 'video'; error?: string } => {
    const imageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const videoTypes = ['video/mp4', 'video/quicktime'];
    
    if (imageTypes.includes(file.type)) {
      const imageCount = uploadedFiles.filter(f => f.type === 'image').length;
      if (imageCount >= 5) {
        return { valid: false, error: 'Maximum 5 images allowed' };
      }
      return { valid: true, type: 'image' };
    }
    
    if (videoTypes.includes(file.type)) {
      const hasVideo = uploadedFiles.some(f => f.type === 'video');
      if (hasVideo) {
        return { valid: false, error: 'Only 1 video allowed' };
      }
      if (file.size > 30 * 1024 * 1024) {
        return { valid: false, error: 'Video must be under 30MB' };
      }
      return { valid: true, type: 'video' };
    }
    
    return { valid: false, error: 'Unsupported file type' };
  }, [uploadedFiles]);

  const handleFileSelect = useCallback(async (files: FileList) => {
    const newFiles: UploadedFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = validateFile(file);
      
      if (!validation.valid) {
        toast({
          title: "Invalid file",
          description: validation.error,
          variant: "destructive",
        });
        continue;
      }
      
      const uploadedFile: UploadedFile = {
        id: `${Date.now()}-${i}`,
        file,
        type: validation.type!,
        previewUrl: URL.createObjectURL(file),
        uploading: true
      };
      
      newFiles.push(uploadedFile);
    }
    
    if (newFiles.length === 0) return;
    
    // Add files to state immediately for preview
    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    // Upload files
    for (const uploadedFile of newFiles) {
      try {
        const uploadedUrl = await uploadToStorage(uploadedFile.file);
        if (uploadedUrl) {
          setUploadedFiles(prev => prev.map(f => 
            f.id === uploadedFile.id 
              ? { ...f, uploadedUrl, uploading: false }
              : f
          ));
        }
      } catch (error) {
        console.error('Upload failed:', error);
        toast({
          title: "Upload failed",
          description: `Failed to upload ${uploadedFile.file.name}`,
          variant: "destructive",
        });
        // Remove failed upload
        setUploadedFiles(prev => prev.filter(f => f.id !== uploadedFile.id));
      }
    }
  }, [validateFile, uploadToStorage, toast]);

  const removeFile = useCallback((id: string) => {
    setUploadedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return prev.filter(f => f.id !== id);
    });
  }, []);

  // Update parent components when files change
  React.useEffect(() => {
    const images = uploadedFiles
      .filter(f => f.type === 'image' && f.uploadedUrl)
      .map(f => f.uploadedUrl!);
    
    const video = uploadedFiles
      .find(f => f.type === 'video' && f.uploadedUrl)
      ?.uploadedUrl || '';
    
    onImagesChange(images);
    onVideoChange(video);
  }, [uploadedFiles, onImagesChange, onVideoChange]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [handleFileSelect]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files);
    }
  }, [handleFileSelect]);

  return (
    <div className={className}>
      <div className="space-y-4">
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
            onChange={handleInputChange}
            className="hidden"
            id="media-upload"
          />
          <label htmlFor="media-upload" className="cursor-pointer">
            <div className="flex flex-col items-center space-y-2">
              <Upload className="h-8 w-8 text-gray-400" />
              <div className="text-gray-600">
                <p className="font-medium">Click to upload or drag and drop</p>
                <p className="text-sm">Images: JPG, PNG, WebP (max 5)</p>
                <p className="text-sm">Video: MP4, MOV (max 1, under 30MB)</p>
              </div>
            </div>
          </label>
        </div>

        {/* Preview Grid */}
        {uploadedFiles.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  {file.type === 'image' ? (
                    <img
                      src={file.previewUrl}
                      alt={file.file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="w-8 h-8 text-gray-500" />
                      <span className="ml-2 text-sm text-gray-600 truncate">
                        {file.file.name}
                      </span>
                    </div>
                  )}
                  
                  {/* Loading overlay */}
                  {file.uploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                </div>
                
                {/* Remove button */}
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeFile(file.id)}
                >
                  <X className="w-3 h-3" />
                </Button>
                
                {/* File type indicator */}
                <div className="absolute bottom-2 left-2">
                  {file.type === 'image' ? (
                    <Image className="w-4 h-4 text-white drop-shadow" />
                  ) : (
                    <Video className="w-4 h-4 text-white drop-shadow" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Upload stats */}
        <div className="text-sm text-gray-500 flex justify-between">
          <span>
            Images: {uploadedFiles.filter(f => f.type === 'image').length}/5
          </span>
          <span>
            Video: {uploadedFiles.filter(f => f.type === 'video').length}/1
          </span>
        </div>
      </div>
    </div>
  );
};

export default MultiMediaUpload;
