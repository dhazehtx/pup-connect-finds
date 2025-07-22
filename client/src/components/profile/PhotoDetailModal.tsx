
import React from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Heart, MessageCircle, Share } from 'lucide-react';

interface Photo {
  id: string;
  url: string;
  caption?: string;
}

interface PhotoDetailModalProps {
  photo: Photo | null;
  isOpen: boolean;
  onClose: () => void;
}

const PhotoDetailModal = ({ photo, isOpen, onClose }: PhotoDetailModalProps) => {
  if (!photo) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 bg-white">
        <DialogHeader className="p-4 pb-0">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Photo</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="relative">
          <img
            src={photo.url}
            alt={photo.caption || 'Post photo'}
            className="w-full max-h-96 object-cover"
          />
        </div>
        
        {photo.caption && (
          <div className="p-4">
            <p className="text-gray-700">{photo.caption}</p>
          </div>
        )}
        
        <div className="flex items-center justify-between p-4 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Heart className="w-4 h-4 mr-1" />
              Like
            </Button>
            <Button variant="ghost" size="sm">
              <MessageCircle className="w-4 h-4 mr-1" />
              Comment
            </Button>
          </div>
          <Button variant="ghost" size="sm">
            <Share className="w-4 h-4 mr-1" />
            Share
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoDetailModal;
