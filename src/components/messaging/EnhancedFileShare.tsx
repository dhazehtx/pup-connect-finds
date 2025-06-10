
import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useDropzone } from 'react-dropzone';
import { Upload, File, Image, X, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileUpload {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  url?: string;
}

interface EnhancedFileShareProps {
  isOpen: boolean;
  onClose: () => void;
  onFilesUpload: (files: FileUpload[]) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
}

const EnhancedFileShare = ({
  isOpen,
  onClose,
  onFilesUpload,
  maxFiles = 5,
  maxSize = 10,
  acceptedTypes = ['image/*', 'application/pdf', 'text/*']
}: EnhancedFileShareProps) => {
  const [uploads, setUploads] = useState<FileUpload[]>([]);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newUploads: FileUpload[] = acceptedFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      progress: 0,
      status: 'pending' as const
    }));

    setUploads(prev => [...prev, ...newUploads].slice(0, maxFiles));
  }, [maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize: maxSize * 1024 * 1024,
    maxFiles,
    onDropRejected: (rejectedFiles) => {
      rejectedFiles.forEach(({ errors }) => {
        errors.forEach(error => {
          toast({
            title: "File rejected",
            description: error.message,
            variant: "destructive"
          });
        });
      });
    }
  });

  const removeFile = (id: string) => {
    setUploads(prev => prev.filter(upload => upload.id !== id));
  };

  const startUpload = async () => {
    const pendingUploads = uploads.filter(upload => upload.status === 'pending');
    
    for (const upload of pendingUploads) {
      setUploads(prev => prev.map(u => 
        u.id === upload.id ? { ...u, status: 'uploading' } : u
      ));

      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploads(prev => prev.map(u => 
          u.id === upload.id ? { ...u, progress } : u
        ));
      }

      setUploads(prev => prev.map(u => 
        u.id === upload.id ? { ...u, status: 'completed', url: URL.createObjectURL(upload.file) } : u
      ));
    }

    onFilesUpload(uploads);
    onClose();
    setUploads([]);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const getStatusIcon = (status: FileUpload['status']) => {
    switch (status) {
      case 'completed': return <Check className="w-4 h-4 text-green-500" />;
      case 'error': return <X className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

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
            </p>
          </div>

          {uploads.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {uploads.map((upload) => (
                <div key={upload.id} className="flex items-center gap-3 p-2 border rounded">
                  {getFileIcon(upload.file)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{upload.file.name}</p>
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
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={startUpload}
              disabled={uploads.length === 0 || uploads.some(u => u.status === 'uploading')}
            >
              Upload & Send
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedFileShare;
