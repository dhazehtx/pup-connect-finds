
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, X, File, Image, CheckCircle, AlertCircle, Trash2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateFileThumbnail, generateImageThumbnail } from '@/utils/fileThumbnailGenerator';
import { compressFile } from '@/utils/fileCompression';

interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
  thumbnail?: string;
  compressed?: boolean;
}

interface FileUploadManagerProps {
  onUpload?: (files: File[]) => Promise<string[]>;
  acceptedTypes?: string[];
  maxFiles?: number;
  maxSize?: number;
  multiple?: boolean;
  enableCompression?: boolean;
}

const FileUploadManager = ({
  onUpload,
  acceptedTypes = ['image/*', 'application/pdf'],
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  multiple = true,
  enableCompression = true
}: FileUploadManagerProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const newFiles: UploadedFile[] = [];

    for (const file of acceptedFiles) {
      const fileId = Math.random().toString(36).substr(2, 9);
      let processedFile = file;
      let compressed = false;

      // Compress if enabled and file is large
      if (enableCompression && file.size > 2 * 1024 * 1024) { // 2MB threshold
        try {
          processedFile = await compressFile(file);
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

      newFiles.push({
        id: fileId,
        file: processedFile,
        progress: 0,
        status: 'uploading',
        thumbnail,
        compressed
      });
    }

    setUploadedFiles(prev => [...prev, ...newFiles]);
    setIsUploading(true);

    try {
      // Simulate upload progress for each file
      for (const uploadFile of newFiles) {
        // Update progress gradually
        for (let progress = 0; progress <= 100; progress += 20) {
          setTimeout(() => {
            setUploadedFiles(prev => 
              prev.map(f => 
                f.id === uploadFile.id 
                  ? { ...f, progress }
                  : f
              )
            );
          }, (progress / 20) * 200);
        }

        // Simulate completion
        setTimeout(() => {
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === uploadFile.id 
                ? { 
                    ...f, 
                    progress: 100, 
                    status: 'completed',
                    url: URL.createObjectURL(uploadFile.file)
                  }
                : f
            )
          );
        }, 1000);
      }

      if (onUpload) {
        const urls = await onUpload(newFiles.map(f => f.file));
        // Update with real URLs if provided
        urls.forEach((url, index) => {
          const uploadFile = newFiles[index];
          if (uploadFile) {
            setUploadedFiles(prev => 
              prev.map(f => 
                f.id === uploadFile.id 
                  ? { ...f, url }
                  : f
              )
            );
          }
        });
      }

      toast({
        title: "Upload successful!",
        description: `${acceptedFiles.length} file(s) uploaded successfully.`,
      });

    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Some files failed to upload. Please try again.",
        variant: "destructive",
      });

      // Mark failed files
      newFiles.forEach(uploadFile => {
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, status: 'error', error: 'Upload failed' }
              : f
          )
        );
      });
    } finally {
      setIsUploading(false);
    }
  }, [onUpload, toast, enableCompression]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxFiles,
    maxSize,
    multiple
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
    setSelectedFiles(new Set(uploadedFiles.map(f => f.id)));
  };

  const deselectAllFiles = () => {
    setSelectedFiles(new Set());
  };

  const deleteSelectedFiles = () => {
    setUploadedFiles(prev => prev.filter(f => !selectedFiles.has(f.id)));
    setSelectedFiles(new Set());
    toast({
      title: "Files deleted",
      description: `${selectedFiles.size} file(s) removed.`,
    });
  };

  const downloadSelectedFiles = () => {
    selectedFiles.forEach(fileId => {
      const file = uploadedFiles.find(f => f.id === fileId);
      if (file?.url) {
        const link = document.createElement('a');
        link.href = file.url;
        link.download = file.file.name;
        link.click();
      }
    });
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const retryUpload = (id: string) => {
    const file = uploadedFiles.find(f => f.id === id);
    if (file) {
      onDrop([file.file]);
      removeFile(id);
    }
  };

  const getFileIcon = (file: UploadedFile) => {
    if (file.thumbnail) {
      return (
        <img 
          src={file.thumbnail} 
          alt={file.file.name}
          className="w-10 h-10 object-cover rounded"
        />
      );
    }

    const config = generateFileThumbnail(file.file);
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

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const hasSelectedFiles = selectedFiles.size > 0;
  const allFilesSelected = uploadedFiles.length > 0 && selectedFiles.size === uploadedFiles.length;

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-8 h-8 mx-auto mb-4 text-gray-400" />
            
            {isDragActive ? (
              <p className="text-blue-600">Drop the files here...</p>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">
                  Drag & drop files here, or click to select
                </p>
                <p className="text-sm text-gray-400">
                  Supports: {acceptedTypes.join(', ')} • Max {maxFiles} files • {Math.round(maxSize / 1024 / 1024)}MB each
                  {enableCompression && ' • Auto compression enabled'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Uploaded Files ({uploadedFiles.length})
              </CardTitle>
              
              {/* Batch Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={allFilesSelected ? deselectAllFiles : selectAllFiles}
                >
                  {allFilesSelected ? 'Deselect All' : 'Select All'}
                </Button>
                
                {hasSelectedFiles && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadSelectedFiles}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download ({selectedFiles.size})
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={deleteSelectedFiles}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete ({selectedFiles.size})
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadedFiles.map((uploadFile) => (
                <div key={uploadFile.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Checkbox
                    checked={selectedFiles.has(uploadFile.id)}
                    onCheckedChange={() => toggleFileSelection(uploadFile.id)}
                  />
                  
                  {getFileIcon(uploadFile)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium truncate">
                        {uploadFile.file.name}
                      </p>
                      <div className="flex items-center gap-2">
                        {uploadFile.compressed && (
                          <Badge variant="secondary" className="text-xs">
                            Compressed
                          </Badge>
                        )}
                        <Badge 
                          variant={uploadFile.status === 'completed' ? 'default' : 
                                  uploadFile.status === 'error' ? 'destructive' : 'secondary'}
                        >
                          {uploadFile.status}
                        </Badge>
                        {getStatusIcon(uploadFile.status)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{Math.round(uploadFile.file.size / 1024)} KB</span>
                      {uploadFile.status === 'uploading' && (
                        <Progress value={uploadFile.progress} className="flex-1 h-1" />
                      )}
                    </div>
                    
                    {uploadFile.error && (
                      <p className="text-xs text-red-500 mt-1">{uploadFile.error}</p>
                    )}
                  </div>

                  <div className="flex gap-1">
                    {uploadFile.status === 'error' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => retryUpload(uploadFile.id)}
                      >
                        Retry
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFile(uploadFile.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileUploadManager;
