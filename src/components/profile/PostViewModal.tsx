
import React from 'react';
import FullPostModal from '@/components/post/FullPostModal';

interface PostViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  postUrl: string;
  onShowLikes: () => void;
  onProfileClick?: (userId: string) => void;
}

const PostViewModal = ({ isOpen, onClose, postUrl, onShowLikes, onProfileClick }: PostViewModalProps) => {
  // Mock post data - you can replace this with actual post data
  const mockPost = {
    id: '1',
    user_id: 'goldenpaws123',
    caption: 'Meet our newest litter of Golden Retriever puppies! 🐕 They\'re 8 weeks old and ready for their forever homes. All health tested and AKC registered.',
    image_url: postUrl,
    video_url: null,
    created_at: new Date().toISOString(),
    profiles: {
      full_name: 'Golden Paws Kennel',
      username: 'goldenpaws',
      avatar_url: 'https://images.unsplash.com/photo-1560743173-567a3b5658b1?w=150&h=150&fit=crop&crop=face',
    }
  };

  return (
    <FullPostModal
      post={mockPost}
      isOpen={isOpen}
      onClose={onClose}
      onProfileClick={onProfileClick}
    />
  );
};

export default PostViewModal;
