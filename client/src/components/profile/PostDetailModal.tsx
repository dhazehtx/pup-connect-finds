
import React from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Heart, MessageCircle, Share, Edit, Trash2 } from 'lucide-react';

interface Photo {
  id: string;
  url: string;
  caption?: string;
  breed?: string;
  age?: string;
  tags?: string[];
  datePosted?: string;
}

interface PostDetailModalProps {
  photo: Photo | null;
  isOpen: boolean;
  onClose: () => void;
  isOwnPost?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const PostDetailModal = ({ 
  photo, 
  isOpen, 
  onClose, 
  isOwnPost = false,
  onEdit,
  onDelete 
}: PostDetailModalProps) => {
  if (!photo) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 bg-white rounded-xl">
        <DialogHeader className="p-4 pb-0">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Post Details</h3>
            <div className="flex items-center space-x-2">
              {isOwnPost && (
                <>
                  <Button variant="ghost" size="sm" onClick={onEdit}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={onDelete}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="relative">
          <img
            src={photo.url}
            alt={photo.caption || 'Post photo'}
            className="w-full max-h-96 object-cover"
          />
        </div>
        
        <div className="p-4 space-y-4">
          {/* Tags */}
          {(photo.breed || photo.age || photo.tags) && (
            <div className="flex flex-wrap gap-2">
              {photo.breed && (
                <Badge variant="secondary">
                  {photo.breed}
                </Badge>
              )}
              {photo.age && (
                <Badge variant="outline">
                  {photo.age}
                </Badge>
              )}
              {photo.tags?.map((tag, index) => (
                <Badge key={index} variant="outline">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
          
          {/* Caption */}
          {photo.caption && (
            <p className="text-gray-700">{photo.caption}</p>
          )}
          
          {/* Date */}
          {photo.datePosted && (
            <p className="text-sm text-gray-500">{photo.datePosted}</p>
          )}
        </div>
        
        {/* Action Buttons */}
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

export default PostDetailModal;
