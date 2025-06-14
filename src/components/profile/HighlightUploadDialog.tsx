
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useUnifiedFileUpload } from '@/hooks/useUnifiedFileUpload';
import { Upload, X } from 'lucide-react';

interface HighlightUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (highlight: { title: string; cover: string; type: 'image' | 'video' }) => void;
}

const HighlightUploadDialog = ({ isOpen, onClose, onUpload }: HighlightUploadDialogProps) => {
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const { toast } = useToast();
  const { uploadImage, uploading } = useUnifiedFileUpload({
    bucket: 'highlights',
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !title.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both a title and select a file",
        variant: "destructive",
      });
      return;
    }

    try {
      const uploadedUrl = await uploadImage(selectedFile);
      if (uploadedUrl) {
        const fileType = selectedFile.type.startsWith('video/') ? 'video' : 'image';
        onUpload({
          title: title.trim(),
          cover: uploadedUrl,
          type: fileType
        });
        
        // Reset form
        setTitle('');
        setSelectedFile(null);
        setPreviewUrl('');
        onClose();
        
        toast({
          title: "Highlight Added! ✨",
          description: "Your highlight has been added to your profile",
        });
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload your highlight. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setTitle('');
    setSelectedFile(null);
    setPreviewUrl('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Highlight</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Highlight Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter highlight title"
              maxLength={20}
            />
            <p className="text-xs text-gray-500 mt-1">{title.length}/20 characters</p>
          </div>

          <div>
            <Label>Upload Image or Video</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              {previewUrl ? (
                <div className="relative">
                  {selectedFile?.type.startsWith('video/') ? (
                    <video 
                      src={previewUrl} 
                      className="w-full h-32 object-cover rounded"
                      controls
                    />
                  ) : (
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="w-full h-32 object-cover rounded"
                    />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-1 right-1"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl('');
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center space-y-2">
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Click to upload image or video
                  </span>
                  <span className="text-xs text-gray-500">
                    Max 50MB • JPG, PNG, MP4, WebM
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.webp,.mp4,.webm"
                    onChange={handleFileSelect}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload}
              disabled={!selectedFile || !title.trim() || uploading}
            >
              {uploading ? 'Uploading...' : 'Add Highlight'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HighlightUploadDialog;
