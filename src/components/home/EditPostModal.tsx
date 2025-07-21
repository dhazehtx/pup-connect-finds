
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Post {
  id: string;
  postUuid: string;
  user: {
    id: string;
    username: string;
    name: string;
    location: string;
    avatar: string;
  };
  image: string;
  likes: number;
  isLiked: boolean;
  caption: string;
  timeAgo: string;
}

interface EditPostModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (postId: string, newCaption: string) => void;
}

const EditPostModal = ({ post, isOpen, onClose, onUpdate }: EditPostModalProps) => {
  const [caption, setCaption] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (post && isOpen) {
      console.log('EditPostModal: Modal opened with post:', post);
      setCaption(post.caption || '');
    }
  }, [post, isOpen]);

  if (!post) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      console.log('EditPostModal: Saving post update:', post.postUuid, caption);
      const { error } = await supabase
        .from('posts')
        .update({ caption })
        .eq('id', post.postUuid);

      if (error) {
        console.error('EditPostModal: Supabase update error:', error);
        throw error;
      }

      console.log('EditPostModal: Post updated successfully');
      toast({
        title: "Post updated",
        description: "Your post has been successfully updated.",
      });

      onUpdate(post.postUuid, caption);
      onClose();
    } catch (error) {
      console.error('EditPostModal: Error updating post:', error);
      toast({
        title: "Error",
        description: "Failed to update post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setCaption(post.caption || '');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Post Image */}
          <div className="aspect-square rounded-lg overflow-hidden">
            <img
              src={post.image}
              alt="Post"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Caption Editor */}
          <div>
            <label className="text-sm font-medium mb-2 block">Caption</label>
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption..."
              className="min-h-[100px] resize-none"
              maxLength={2200}
            />
            <div className="text-xs text-gray-500 mt-1">
              {caption.length}/2200
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={handleClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditPostModal;
