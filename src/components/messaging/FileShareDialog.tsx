
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, File, Image, Video, FileText, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileShareDialogProps {
  onFileShare: (url: string, type: string, fileName: string) => void;
  children: React.ReactNode;
}

const FileShareDialog = ({ onFileShare, children }: FileShareDialogProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const validFiles = selectedFiles.filter(file => file.size <= 10 * 1024 * 1024); // 10MB limit
    
    if (validFiles.length !== selectedFiles.length) {
      toast({
        title: "File size limit",
        description: "Some files were skipped. Maximum file size is 10MB.",
        variant: "destructive",
      });
    }
    
    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image size={20} />;
    if (file.type.startsWith('video/')) return <Video size={20} />;
    if (file.type.startsWith('text/') || file.type.includes('document')) return <FileText size={20} />;
    return <File size={20} />;
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Mock file upload - in production, this would upload to Supabase storage
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate upload
        
        const mockUrl = URL.createObjectURL(file);
        const fileType = file.type.startsWith('image/') ? 'image' : 
                        file.type.startsWith('video/') ? 'video' : 'file';
        
        onFileShare(mockUrl, fileType, file.name);
        setUploadProgress(((i + 1) / files.length) * 100);
      }

      toast({
        title: "Files shared successfully",
        description: `${files.length} file(s) shared in the conversation`,
      });

      setFiles([]);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to share files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Files</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="mx-auto mb-2 text-gray-400" size={32} />
            <p className="text-sm text-gray-600 mb-2">
              Drag files here or click to browse
            </p>
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              accept="image/*,video/*,.pdf,.doc,.docx,.txt"
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={uploading}
            >
              Select Files
            </Button>
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Selected Files:</h4>
              {files.map((file, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  {getFileIcon(file)}
                  <span className="flex-1 text-sm truncate">{file.name}</span>
                  <span className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(1)}MB
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={uploading}
                  >
                    <X size={14} />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {uploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} />
              <p className="text-sm text-center text-gray-600">
                Uploading... {Math.round(uploadProgress)}%
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={uploadFiles}
              disabled={files.length === 0 || uploading}
              className="flex-1"
            >
              Share {files.length > 0 && `(${files.length})`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FileShareDialog;
