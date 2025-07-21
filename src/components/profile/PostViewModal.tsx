
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
  // Mock post data with comments included
  const mockPost = {
    id: '1',
    user_id: 'goldenpaws123',
    caption: '🎄🐕 Holiday Cheer for Your Pup! Deck the paws with our holiday-themed dog toys — perfect for tug-of-war, chewing, and photo ops! 🎁 Durable, festive, and full of tail-wagging joy. Add some holiday spirit to your pup\'s toy bin! #HolidayPup #DogToys #TugTime #MyPup',
    image_url: postUrl,
    video_url: null,
    created_at: new Date().toISOString(),
    profiles: {
      full_name: 'Golden Paws Kennel',
      username: 'goldenpaws',
      avatar_url: 'https://images.unsplash.com/photo-1560743173-567a3b5658b1?w=150&h=150&fit=crop&crop=face',
    }
  };

  // Mock comments data to ensure they show up
  const mockComments = [
    {
      id: 'comment1',
      post_id: '1',
      user_id: 'user1',
      content: 'I have too get Mochi this!',
      created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      profiles: {
        full_name: 'Royalbabybullz',
        username: 'Royalbabybullz',
        avatar_url: 'https://images.unsplash.com/photo-1560743173-567a3b5658b1?w=150&h=150&fit=crop&crop=face',
      }
    },
    {
      id: 'comment2', 
      post_id: '1',
      user_id: 'user2',
      content: 'I need to get this for Mochi',
      created_at: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
      profiles: {
        full_name: 'Royalbabybullz',
        username: 'Royalbabybullz', 
        avatar_url: 'https://images.unsplash.com/photo-1560743173-567a3b5658b1?w=150&h=150&fit=crop&crop=face',
      }
    }
  ];

  return (
    <FullPostModal
      post={mockPost}
      isOpen={isOpen}
      onClose={onClose}
      onProfileClick={onProfileClick}
      initialComments={mockComments}
    />
  );
};

export default PostViewModal;
