
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Image, Video } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface HighlightUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (highlight: { title: string; cover: string; type: 'image' | 'video' }) => void;
}

const HighlightUploadDialog = ({ isOpen, onClose, onUpload }: HighlightUploadDialogProps) => {
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  const handleUpload = () => {
    if (!selectedFile || !title.trim()) {
      toast({
        title: "Error",
        description: "Please provide a title and select a file",
        variant: "destructive",
      });
      return;
    }

    const type = selectedFile.type.startsWith('video/') ? 'video' : 'image';
    
    onUpload({
      title: title.trim(),
      cover: preview,
      type
    });

    toast({
      title: "Success",
      description: "Highlight uploaded successfully!",
    });

    setTitle('');
    setSelectedFile(null);
    setPreview('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Highlight</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Input
            placeholder="Highlight title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            {preview ? (
              <div className="space-y-2">
                {selectedFile?.type.startsWith('video/') ? (
                  <video src={preview} className="w-full h-32 object-cover rounded" controls />
                ) : (
                  <img src={preview} alt="Preview" className="w-full h-32 object-cover rounded" />
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreview('');
                  }}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Upload image or video
                </span>
                <div className="flex gap-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Image size={12} />
                    JPG, PNG
                  </span>
                  <span className="flex items-center gap-1">
                    <Video size={12} />
                    MP4, MOV
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleUpload} className="flex-1">
              Upload
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HighlightUploadDialog;
