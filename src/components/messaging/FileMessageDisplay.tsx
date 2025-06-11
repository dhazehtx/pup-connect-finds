
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, Image, Video, File } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface FileMessageDisplayProps {
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize?: number;
  timestamp: string;
  isOwn?: boolean;
}

const FileMessageDisplay = ({ 
  fileUrl, 
  fileName, 
  fileType, 
  fileSize, 
  timestamp, 
  isOwn = false 
}: FileMessageDisplayProps) => {
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = () => {
    if (fileType.startsWith('image/')) return <Image size={20} />;
    if (fileType.startsWith('video/')) return <Video size={20} />;
    if (fileType === 'application/pdf') return <FileText size={20} />;
    return <File size={20} />;
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    link.click();
  };

  const isImage = fileType.startsWith('image/');
  const isVideo = fileType.startsWith('video/');

  return (
    <div className={`max-w-sm ${isOwn ? 'ml-auto' : ''}`}>
      {/* Image preview */}
      {isImage && (
        <div className="mb-2">
          <img 
            src={fileUrl} 
            alt={fileName}
            className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => window.open(fileUrl, '_blank')}
          />
        </div>
      )}

      {/* Video preview */}
      {isVideo && (
        <div className="mb-2">
          <video 
            src={fileUrl}
            controls
            className="rounded-lg max-w-full h-auto"
          />
        </div>
      )}

      {/* File info */}
      <div className={`flex items-center gap-3 p-3 rounded-lg border ${
        isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'
      }`}>
        <div className="flex-shrink-0">
          {getFileIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate text-sm">{fileName}</p>
          <div className="flex items-center gap-2 text-xs opacity-70">
            {fileSize && <span>{formatFileSize(fileSize)}</span>}
            <span>•</span>
            <span>{formatDistanceToNow(new Date(timestamp), { addSuffix: true })}</span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleDownload}
          className="rounded-full w-8 h-8 p-0"
        >
          <Download size={16} />
        </Button>
      </div>
    </div>
  );
};

export default FileMessageDisplay;
