
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Share, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();

  // Mock post data - in real app this would come from an API
  const post = {
    id: postId,
    image: `https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=500&h=500&fit=crop`,
    user: {
      name: 'Golden Paws Kennel',
      username: 'goldenpaws',
      avatar: 'https://images.unsplash.com/photo-1560743173-567a3b5658b1?w=150&h=150&fit=crop&crop=face'
    },
    caption: 'Meet our beautiful Golden Retriever puppies! 🐕 These adorable little ones are looking for their forever homes. They are healthy, vaccinated, and ready to bring joy to your family. #GoldenRetriever #Puppies #DogsOfInstagram',
    likes: 243,
    comments: 28,
    timestamp: '2 hours ago'
  };

  const comments = [
    {
      id: 1,
      user: { name: 'Sarah M.', username: 'sarah_m', avatar: '' },
      text: 'They are absolutely adorable! 😍',
      timestamp: '1h'
    },
    {
      id: 2,
      user: { name: 'Mike D.', username: 'mike_d', avatar: '' },
      text: 'Are any of them still available?',
      timestamp: '45m'
    },
    {
      id: 3,
      user: { name: 'Emma W.', username: 'emma_w', avatar: '' },
      text: 'Beautiful puppies! Great breeding program 👏',
      timestamp: '30m'
    }
  ];

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
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.user.avatar} />
            <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-medium text-sm">{post.user.name}</p>
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
              <Button variant="ghost" size="icon" className="p-0">
                <Heart size={24} />
              </Button>
              <Button variant="ghost" size="icon" className="p-0">
                <MessageCircle size={24} />
              </Button>
              <Button variant="ghost" size="icon" className="p-0">
                <Share size={24} />
              </Button>
            </div>
          </div>

          {/* Likes */}
          <p className="font-medium text-sm mb-2">{post.likes.toLocaleString()} likes</p>

          {/* Caption */}
          <div className="mb-3">
            <span className="font-medium text-sm mr-2">{post.user.username}</span>
            <span className="text-sm">{post.caption}</span>
          </div>

          {/* View all comments */}
          <p className="text-gray-600 text-sm mb-3">
            View all {post.comments} comments
          </p>

          {/* Comments */}
          <div className="space-y-2">
            {comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {comment.user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <span className="font-medium text-sm mr-2">{comment.user.username}</span>
                  <span className="text-sm">{comment.text}</span>
                  <p className="text-gray-500 text-xs mt-1">{comment.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
