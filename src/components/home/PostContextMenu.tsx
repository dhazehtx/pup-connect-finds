import React, { useState } from 'react';
import { MoreHorizontal, Trash2, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Post {
  id: number;
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

interface PostContextMenuProps {
  post: Post;
  onEdit: (post: Post) => void;
  onDelete: (postId: string) => void;
}

const PostContextMenu = ({ post, onEdit, onDelete }: PostContextMenuProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Only show menu for post owner
  const isOwner = user?.id === post.user.id;

  if (!isOwner) {
    return null;
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('PostContextMenu: Edit clicked for post:', post.postUuid);
    onEdit(post);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('PostContextMenu: Delete clicked for post:', post.postUuid);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      console.log('PostContextMenu: Deleting post:', post.postUuid);
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.postUuid);

      if (error) {
        console.error('Supabase delete error:', error);
        throw error;
      }

      toast({
        title: "Post deleted",
        description: "Your post has been successfully deleted.",
      });

      onDelete(post.postUuid);
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-1 h-auto hover:bg-gray-100"
            onClick={(e) => {
              e.stopPropagation();
              console.log('PostContextMenu: 3-dot button clicked');
            }}
          >
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          <ContextMenuItem 
            onClick={handleEdit} 
            className="cursor-pointer flex items-center"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Edit Post
          </ContextMenuItem>
          <ContextMenuItem 
            onClick={handleDeleteClick} 
            className="cursor-pointer text-red-600 focus:text-red-600 flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Post
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PostContextMenu;
