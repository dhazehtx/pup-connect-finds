
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AnimatedHeart from '@/components/ui/animated-heart';
import LikesModal from '@/components/post/LikesModal';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Comment {
  id: number;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  text: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  likedBy?: Array<{
    id: string;
    name: string;
    username: string;
    avatar: string;
    verified?: boolean;
    isFollowing?: boolean;
  }>;
}

interface CommentsSectionProps {
  comments: Comment[];
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
  onProfileClick: (userId: string) => void;
}

const CommentsSection = ({ comments, setComments, onProfileClick }: CommentsSectionProps) => {
  const [showAllComments, setShowAllComments] = useState(false);
  const [showCommentLikesModal, setShowCommentLikesModal] = useState(false);
  const [selectedCommentLikes, setSelectedCommentLikes] = useState([]);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const visibleComments = showAllComments ? comments : comments.slice(0, 3);
  const hasMoreComments = comments.length > 3;

  const handleCommentLike = (commentId: number) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to like comments",
        variant: "destructive",
      });
      return;
    }

    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? {
            ...comment,
            isLiked: !comment.isLiked,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
          }
        : comment
    ));
  };

  const handleShowCommentLikes = (commentId: number) => {
    const comment = comments.find(c => c.id === commentId);
    if (comment && comment.likedBy && comment.likes > 0) {
      setSelectedCommentLikes(comment.likedBy);
      setShowCommentLikesModal(true);
    }
  };

  return (
    <div>
      {/* View all comments link */}
      {hasMoreComments && !showAllComments && (
        <button
          onClick={() => setShowAllComments(true)}
          className="text-gray-600 text-sm mb-3 hover:text-gray-800"
        >
          View all {comments.length} comments
        </button>
      )}

      {/* Comments list */}
      <div className="space-y-3">
        {visibleComments.map((comment) => (
          <div key={comment.id} className="flex items-start gap-2">
            <Avatar 
              className="h-6 w-6 cursor-pointer" 
              onClick={() => onProfileClick(comment.user.id)}
            >
              <AvatarImage src={comment.user.avatar} />
              <AvatarFallback className="text-xs">
                {comment.user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <span 
                    className="font-medium text-sm mr-2 cursor-pointer hover:underline"
                    onClick={() => onProfileClick(comment.user.id)}
                  >
                    {comment.user.username}
                  </span>
                  <span className="text-sm break-words">{comment.text}</span>
                </div>
                <div className="ml-2 flex-shrink-0">
                  <AnimatedHeart 
                    isLiked={comment.isLiked}
                    onToggle={() => handleCommentLike(comment.id)}
                    size={12}
                    className="text-gray-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4 mt-1">
                <p className="text-gray-500 text-xs">{comment.timestamp}</p>
                {comment.likes > 0 && (
                  <p 
                    className="text-gray-500 text-xs cursor-pointer hover:text-gray-700"
                    onClick={() => handleShowCommentLikes(comment.id)}
                  >
                    {comment.likes} likes
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Show less comments */}
      {showAllComments && hasMoreComments && (
        <button
          onClick={() => setShowAllComments(false)}
          className="text-gray-600 text-sm mt-3 hover:text-gray-800"
        >
          Show less
        </button>
      )}

      {/* Comment Likes Modal */}
      <LikesModal
        isOpen={showCommentLikesModal}
        onClose={() => setShowCommentLikesModal(false)}
        likes={selectedCommentLikes}
        onProfileClick={onProfileClick}
      />
    </div>
  );
};

export default CommentsSection;
