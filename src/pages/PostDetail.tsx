
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import AnimatedHeart from '@/components/ui/animated-heart';
import CommentsSection from '@/components/post/CommentsSection';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(243);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([
    {
      id: 1,
      user: { 
        id: 'sarah123',
        name: 'Sarah M.', 
        username: 'sarah_m', 
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face'
      },
      text: 'They are absolutely adorable! 😍',
      timestamp: '1h',
      likes: 5,
      isLiked: false
    },
    {
      id: 2,
      user: { 
        id: 'mike456',
        name: 'Mike D.', 
        username: 'mike_d', 
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
      },
      text: 'Are any of them still available?',
      timestamp: '45m',
      likes: 2,
      isLiked: false
    },
    {
      id: 3,
      user: { 
        id: 'emma789',
        name: 'Emma W.', 
        username: 'emma_w', 
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
      },
      text: 'Beautiful puppies! Great breeding program 👏',
      timestamp: '30m',
      likes: 8,
      isLiked: false
    },
    {
      id: 4,
      user: { 
        id: 'john321',
        name: 'John K.', 
        username: 'john_k', 
        avatar: ''
      },
      text: 'How much for one of these beauties?',
      timestamp: '20m',
      likes: 1,
      isLiked: false
    },
    {
      id: 5,
      user: { 
        id: 'lisa654',
        name: 'Lisa P.', 
        username: 'lisa_p', 
        avatar: ''
      },
      text: 'My dream dogs! 🐕💕',
      timestamp: '15m',
      likes: 3,
      isLiked: false
    }
  ]);

  // Mock post data - in real app this would come from an API
  const post = {
    id: postId,
    image: `https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=500&h=500&fit=crop`,
    user: {
      id: 'goldenpaws123',
      name: 'Golden Paws Kennel',
      username: 'goldenpaws',
      avatar: 'https://images.unsplash.com/photo-1560743173-567a3b5658b1?w=150&h=150&fit=crop&crop=face'
    },
    caption: 'Meet our beautiful Golden Retriever puppies! 🐕 These adorable little ones are looking for their forever homes. They are healthy, vaccinated, and ready to bring joy to your family. #GoldenRetriever #Puppies #DogsOfInstagram',
    timestamp: '2 hours ago'
  };

  const handleLike = () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to like posts",
        variant: "destructive",
      });
      return;
    }
    
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleAddComment = () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to comment",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) return;

    const comment = {
      id: comments.length + 1,
      user: {
        id: user.id,
        name: user.email?.split('@')[0] || 'User',
        username: user.email?.split('@')[0] || 'user',
        avatar: ''
      },
      text: newComment,
      timestamp: 'now',
      likes: 0,
      isLiked: false
    };

    setComments([...comments, comment]);
    setNewComment('');
    
    toast({
      title: "Comment added!",
      description: "Your comment has been posted",
    });
  };

  const handleProfileClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddComment();
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={20} />
        </Button>
        <h1 className="font-medium">Post</h1>
        <Button variant="ghost" size="icon">
          <MoreHorizontal size={20} />
        </Button>
      </div>

      {/* Post content */}
      <div>
        {/* User info */}
        <div className="flex items-center gap-3 p-4">
          <Avatar 
            className="h-10 w-10 cursor-pointer" 
            onClick={() => handleProfileClick(post.user.id)}
          >
            <AvatarImage src={post.user.avatar} />
            <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p 
              className="font-medium text-sm cursor-pointer hover:underline"
              onClick={() => handleProfileClick(post.user.id)}
            >
              {post.user.name}
            </p>
            <p className="text-gray-600 text-xs">{post.timestamp}</p>
          </div>
          <Button size="sm" variant="outline">
            Follow
          </Button>
        </div>

        {/* Post image */}
        <img 
          src={post.image} 
          alt="Post" 
          className="w-full aspect-square object-cover"
        />

        {/* Actions */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <AnimatedHeart 
                isLiked={isLiked}
                onToggle={handleLike}
                size={24}
              />
            </div>
          </div>

          {/* Likes */}
          <p className="font-medium text-sm mb-2">{likesCount.toLocaleString()} likes</p>

          {/* Caption */}
          <div className="mb-3">
            <span 
              className="font-medium text-sm mr-2 cursor-pointer hover:underline"
              onClick={() => handleProfileClick(post.user.id)}
            >
              {post.user.username}
            </span>
            <span className="text-sm">{post.caption}</span>
          </div>

          {/* Comments Section */}
          <CommentsSection 
            comments={comments}
            setComments={setComments}
            onProfileClick={handleProfileClick}
          />

          {/* Add comment */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t">
            <Input
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 border-none focus:ring-0"
            />
            <Button 
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              variant="ghost"
              size="sm"
              className="text-blue-500 hover:text-blue-600 disabled:text-gray-400"
            >
              Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
