
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share, MoreHorizontal, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PostViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  postUrl: string;
  onShowLikes: () => void;
}

const PostViewModal = ({ isOpen, onClose, postUrl, onShowLikes }: PostViewModalProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [comment, setComment] = useState('');

  // Mock data for the post
  const mockPost = {
    user: {
      name: 'Golden Paws Kennel',
      username: 'goldenpaws',
      avatar: 'https://images.unsplash.com/photo-1560743173-567a3b5658b1?w=150&h=150&fit=crop&crop=face',
      verified: true
    },
    caption: 'Meet our newest litter of Golden Retriever puppies! 🐕 They\'re 8 weeks old and ready for their forever homes. All health tested and AKC registered.',
    likes: 247,
    comments: [
      {
        id: '1',
        user: { name: 'Sarah Johnson', username: 'sarahj', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b494?w=150&h=150&fit=crop&crop=face' },
        text: 'They are absolutely adorable! 😍',
        time: '2h'
      },
      {
        id: '2',
        user: { name: 'Mike Chen', username: 'mikechen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
        text: 'Do you have any females available?',
        time: '1h'
      },
      {
        id: '3',
        user: { name: 'Emma Wilson', username: 'emmaw', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' },
        text: 'Beautiful puppies! What\'s the price range?',
        time: '45m'
      }
    ],
    timePosted: '3 hours ago'
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleComment = () => {
    if (comment.trim()) {
      // Handle comment submission
      console.log('Adding comment:', comment);
      setComment('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={mockPost.user.avatar} />
                <AvatarFallback>{mockPost.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{mockPost.user.username}</span>
                {mockPost.user.verified && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                    Verified
                  </Badge>
                )}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={16} />
            </Button>
          </div>

          {/* Image */}
          <div className="relative">
            <img 
              src={postUrl} 
              alt="Post" 
              className="w-full aspect-square object-cover"
            />
          </div>

          {/* Actions */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-0 h-auto"
                  onClick={handleLike}
                >
                  <Heart 
                    size={24} 
                    className={`transition-colors ${
                      isLiked ? 'text-red-500 fill-current' : 'text-gray-600'
                    }`} 
                  />
                </Button>
                <Button variant="ghost" size="sm" className="p-0 h-auto">
                  <MessageCircle size={24} className="text-gray-600" />
                </Button>
                <Button variant="ghost" size="sm" className="p-0 h-auto">
                  <Share size={24} className="text-gray-600" />
                </Button>
              </div>
              <Button variant="ghost" size="sm" className="p-0 h-auto">
                <MoreHorizontal size={24} className="text-gray-600" />
              </Button>
            </div>

            {/* Likes */}
            <button 
              onClick={onShowLikes}
              className="font-semibold text-sm mb-2 hover:opacity-75 transition-opacity"
            >
              {mockPost.likes} likes
            </button>

            {/* Caption */}
            <div className="text-sm mb-2">
              <span className="font-semibold mr-2">{mockPost.user.username}</span>
              <span>{mockPost.caption}</span>
            </div>

            <div className="text-xs text-gray-500 mb-4">{mockPost.timePosted}</div>
          </div>

          {/* Comments */}
          <div className="flex-1 overflow-y-auto p-4 max-h-40">
            <div className="space-y-3">
              {mockPost.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={comment.user.avatar} />
                    <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-sm">
                      <span className="font-semibold mr-2">{comment.user.username}</span>
                      <span>{comment.text}</span>
                    </div>
                    <div className="text-xs text-gray-500">{comment.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comment Input */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="flex-1 text-sm bg-transparent border-none outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                />
                {comment.trim() && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-blue-600 font-semibold p-0 h-auto"
                    onClick={handleComment}
                  >
                    Post
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostViewModal;
