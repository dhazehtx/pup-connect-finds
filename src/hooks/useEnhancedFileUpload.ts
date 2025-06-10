
import { useState, useCallback } from 'react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/hooks/use-toast';

interface EnhancedFileUploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
  uploadedFiles: Array<{
    id: string;
    url: string;
    name: string;
    type: string;
    size: number;
  }>;
}

export const useEnhancedFileUpload = () => {
  const [state, setState] = useState<EnhancedFileUploadState>({
    uploading: false,
    progress: 0,
    error: null,
    uploadedFiles: []
  });

  const { uploadFile, uploadImage, isUploading } = useFileUpload({
    bucket: 'message-attachments',
    folder: 'conversations',
    maxSize: 50, // 50MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'text/plain']
  });

  const { toast } = useToast();

  console.log('📎 useEnhancedFileUpload - State:', {
    uploading: state.uploading || isUploading,
    progress: state.progress,
    uploadedFilesCount: state.uploadedFiles.length,
    hasError: !!state.error
  });

  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    if (fileArray.length === 0) return [];

    console.log('📎 useEnhancedFileUpload - Starting upload:', {
      fileCount: fileArray.length,
      files: fileArray.map(f => ({ name: f.name, size: f.size, type: f.type }))
    });

    setState(prev => ({
      ...prev,
      uploading: true,
      progress: 0,
      error: null
    }));

    const uploadedFiles: typeof state.uploadedFiles = [];
    const totalFiles = fileArray.length;

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        
        console.log(`📎 useEnhancedFileUpload - Uploading file ${i + 1}/${totalFiles}:`, file.name);
        
        // Update progress
        setState(prev => ({
          ...prev,
          progress: (i / totalFiles) * 100
        }));

        let url: string | null = null;
        
        if (file.type.startsWith('image/')) {
          url = await uploadImage(file);
        } else {
          url = await uploadFile(file);
        }

        if (url) {
          const uploadedFile = {
            id: `${Date.now()}-${i}`,
            url,
            name: file.name,
            type: file.type,
            size: file.size
          };
          
          uploadedFiles.push(uploadedFile);
          
          console.log('✅ useEnhancedFileUpload - File uploaded successfully:', {
            name: file.name,
            url,
            size: file.size
          });
        } else {
          throw new Error(`Failed to upload ${file.name}`);
        }
      }

      // Complete upload
      setState(prev => ({
        ...prev,
        uploading: false,
        progress: 100,
        uploadedFiles: [...prev.uploadedFiles, ...uploadedFiles]
      }));

      toast({
        title: "Upload Complete",
        description: `Successfully uploaded ${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''}`,
      });

      console.log('🎉 useEnhancedFileUpload - All files uploaded successfully:', uploadedFiles.length);
      
      return uploadedFiles;

    } catch (error) {
      console.error('❌ useEnhancedFileUpload - Upload error:', error);
      
      setState(prev => ({
        ...prev,
        uploading: false,
        progress: 0,
        error: error instanceof Error ? error.message : 'Upload failed'
      }));

      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : 'Failed to upload files',
        variant: "destructive",
      });

      return [];
    }
  }, [uploadFile, uploadImage, toast]);

  const uploadSingleFile = useCallback(async (file: File) => {
    const results = await uploadFiles([file]);
    return results[0] || null;
  }, [uploadFiles]);

  const clearUploads = useCallback(() => {
    console.log('🧹 useEnhancedFileUpload - Clearing uploads');
    setState({
      uploading: false,
      progress: 0,
      error: null,
      uploadedFiles: []
    });
  }, []);

  const removeUploadedFile = useCallback((fileId: string) => {
    console.log('🗑️ useEnhancedFileUpload - Removing file:', fileId);
    setState(prev => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter(f => f.id !== fileId)
    }));
  }, []);

  return {
    uploading: state.uploading || isUploading,
    progress: state.progress,
    error: state.error,
    uploadedFiles: state.uploadedFiles,
    uploadFiles,
    uploadSingleFile,
    clearUploads,
    removeUploadedFile
  };
};
