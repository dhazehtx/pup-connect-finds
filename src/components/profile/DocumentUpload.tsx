
import React, { useState } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface DocumentUploadProps {
  onDocumentUploaded: (url: string, type: string) => void;
  documentType: 'business_license' | 'id_document' | 'address_proof';
  title: string;
  description: string;
  currentDocument?: string;
}

const DocumentUpload = ({ 
  onDocumentUploaded, 
  documentType, 
  title, 
  description,
  currentDocument 
}: DocumentUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const { uploadFile, isUploading, uploadProgress } = useFileUpload({
    bucket: 'images',
    folder: 'documents',
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  });
  const { toast } = useToast();

  // Extract the first progress value from the uploadProgress object
  const progressValue = Object.values(uploadProgress)[0] || 0;

  const handleFile = async (file: File) => {
    const url = await uploadFile(file);
    if (url) {
      onDocumentUploaded(url, documentType);
      toast({
        title: "Document uploaded",
        description: `${title} has been uploaded successfully.`,
      });
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

  const removeDocument = () => {
    onDocumentUploaded('', documentType);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <FileText size={16} />
          {title}
        </CardTitle>
        <p className="text-xs text-gray-600">{description}</p>
      </CardHeader>
      <CardContent>
        {currentDocument ? (
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-600" />
              <span className="text-sm text-green-800">Document uploaded</span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={removeDocument}
              className="text-red-600 hover:text-red-700"
            >
              <X size={14} />
            </Button>
          </div>
        ) : (
          <div
            className={cn(
              "border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors cursor-pointer",
              dragActive && "border-blue-400 bg-blue-50",
              isUploading && "opacity-50 pointer-events-none"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center space-y-2">
              {isUploading ? (
                <>
                  <Upload className="h-6 w-6 text-blue-500 animate-pulse" />
                  <p className="text-xs text-gray-600">Uploading... {progressValue}%</p>
                  <div className="w-full max-w-xs">
                    <Progress value={progressValue} className="w-full h-2" />
                  </div>
                </>
              ) : (
                <>
                  <Upload className="h-6 w-6 text-gray-400" />
                  <p className="text-xs text-gray-600">
                    Drag file here or{' '}
                    <label className="text-blue-500 hover:text-blue-700 cursor-pointer">
                      browse
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,application/pdf"
                        onChange={handleFileInput}
                      />
                    </label>
                  </p>
                  <p className="text-xs text-gray-400">PDF, PNG, JPG up to 10MB</p>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;
