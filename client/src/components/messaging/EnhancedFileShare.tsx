import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useDropzone } from 'react-dropzone';
import { Upload, File, Image, X, Check, Trash2, Download } from 'lucide-react';
import { useUnifiedFileUpload } from '@/hooks/useUnifiedFileUpload';
import { generateFileThumbnail, generateImageThumbnail } from '@/utils/fileThumbnailGenerator';
import { compressFile } from '@/utils/fileCompression';

interface FileUpload {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  url?: string;
  thumbnail?: string;
  compressed?: boolean;
}

interface EnhancedFileShareProps {
  isOpen: boolean;
  onClose: () => void;
  onFilesUpload: (files: FileUpload[]) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  enableCompression?: boolean;
}

const EnhancedFileShare = ({
  isOpen,
  onClose,
  onFilesUpload,
  maxFiles = 5,
  maxSize = 10,
  acceptedTypes = ['image/*', 'application/pdf', 'text/*'],
  enableCompression = true
}: EnhancedFileShareProps) => {
  const [uploads, setUploads] = useState<FileUpload[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  
  const { uploadMultipleFiles, uploading } = useUnifiedFileUpload({
    bucket: 'message-files',
    folder: 'shared',
    maxSize: maxSize * 1024 * 1024,
    allowedTypes: acceptedTypes
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newUploads: FileUpload[] = [];

    for (const file of acceptedFiles) {
      const fileId = crypto.randomUUID();
      let processedFile = file;
      let compressed = false;

      // Compress if enabled and file is large
      if (enableCompression && file.size > 2 * 1024 * 1024) {
        try {
          processedFile = await compressFile(file, {
            maxSize: maxSize,
            quality: 0.8
          });
          compressed = file.size !== processedFile.size;
        } catch (error) {
          console.warn('Compression failed:', error);
        }
      }

      // Generate thumbnail
      let thumbnail: string | undefined;
      try {
        if (file.type.startsWith('image/')) {
          thumbnail = await generateImageThumbnail(file);
        }
      } catch (error) {
        console.warn('Thumbnail generation failed:', error);
      }

      newUploads.push({
        id: fileId,
        file: processedFile,
        progress: 0,
        status: 'pending',
        thumbnail,
        compressed
      });
    }

    setUploads(prev => [...prev, ...newUploads].slice(0, maxFiles));
  }, [maxFiles, enableCompression, maxSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize: maxSize * 1024 * 1024,
    maxFiles
  });

  const toggleFileSelection = (id: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAllFiles = () => {
    setSelectedFiles(new Set(uploads.map(f => f.id)));
  };

  const deselectAllFiles = () => {
    setSelectedFiles(new Set());
  };

  const removeSelectedFiles = () => {
    setUploads(prev => prev.filter(upload => !selectedFiles.has(upload.id)));
    setSelectedFiles(new Set());
  };

  const removeFile = (id: string) => {
    setUploads(prev => prev.filter(upload => upload.id !== id));
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const startUpload = async () => {
    const pendingUploads = uploads.filter(upload => upload.status === 'pending');
    
    try {
      // Update status to uploading
      setUploads(prev => prev.map(u => 
        pendingUploads.find(p => p.id === u.id) ? { ...u, status: 'uploading' } : u
      ));

      // Upload files
      const urls = await uploadMultipleFiles(pendingUploads.map(u => u.file));
      
      // Update with completed status and URLs
      const completedUploads = uploads.map((upload, index) => {
        if (pendingUploads.includes(upload)) {
          const urlIndex = pendingUploads.findIndex(p => p.id === upload.id);
          return {
            ...upload,
            status: 'completed' as const,
            progress: 100,
            url: urls[urlIndex]
          };
        }
        return upload;
      });

      setUploads(completedUploads);
      onFilesUpload(completedUploads);
      onClose();
      setUploads([]);
      setSelectedFiles(new Set());
    } catch (error) {
      console.error('Upload failed:', error);
      setUploads(prev => prev.map(u => 
        pendingUploads.find(p => p.id === u.id) ? { ...u, status: 'error' } : u
      ));
    }
  };

  const getFileIcon = (upload: FileUpload) => {
    if (upload.thumbnail) {
      return (
        <img 
          src={upload.thumbnail} 
          alt={upload.file.name}
          className="w-10 h-10 object-cover rounded"
        />
      );
    }

    const config = generateFileThumbnail(upload.file);
    const IconComponent = config.icon;

    if (IconComponent) {
      return (
        <div className={`w-10 h-10 rounded flex items-center justify-center ${config.bgColor}`}>
          <IconComponent className={`w-5 h-5 ${config.color}`} />
        </div>
      );
    }

    return <File className="w-5 h-5 text-gray-400" />;
  };

  const getStatusIcon = (status: FileUpload['status']) => {
    switch (status) {
      case 'completed': return <Check className="w-4 h-4 text-green-500" />;
      case 'error': return <X className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const hasSelectedFiles = selectedFiles.size > 0;
  const allFilesSelected = uploads.length > 0 && selectedFiles.size === uploads.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Files</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {isDragActive ? 'Drop files here' : 'Drag & drop files or click to select'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Max {maxFiles} files, {maxSize}MB each
              {enableCompression && ' • Auto compression enabled'}
            </p>
          </div>

          {uploads.length > 0 && (
            <div className="space-y-2">
              {/* Batch Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={allFilesSelected}
                    onCheckedChange={allFilesSelected ? deselectAllFiles : selectAllFiles}
                  />
                  <span className="text-sm text-muted-foreground">
                    {selectedFiles.size} of {uploads.length} selected
                  </span>
                </div>
                
                {hasSelectedFiles && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={removeSelectedFiles}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Remove ({selectedFiles.size})
                  </Button>
                )}
              </div>

              {/* Files List */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {uploads.map((upload) => (
                  <div key={upload.id} className="flex items-center gap-3 p-2 border rounded">
                    <Checkbox
                      checked={selectedFiles.has(upload.id)}
                      onCheckedChange={() => toggleFileSelection(upload.id)}
                    />
                    
                    {getFileIcon(upload)}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium truncate">{upload.file.name}</p>
                        {upload.compressed && (
                          <Badge variant="secondary" className="text-xs">
                            Compressed
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {(upload.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      {upload.status === 'uploading' && (
                        <Progress value={upload.progress} className="h-1 mt-1" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusIcon(upload.status)}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(upload.id)}
                        disabled={upload.status === 'uploading'}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={startUpload}
              disabled={uploads.length === 0 || uploading}
            >
              {uploading ? 'Uploading...' : 'Upload & Send'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedFileShare;
