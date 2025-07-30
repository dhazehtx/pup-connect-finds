import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, SortAsc, SortDesc } from 'lucide-react';
import CommentThread from './CommentThread';
import CommentInput from './CommentInput';
import { useToast } from '@/hooks/use-toast';

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  parent_comment_id?: string;
  content: string;
  mentions?: string[];
  likes_count: number;
  replies_count: number;
  created_at: string;
  profiles?: {
    full_name: string;
    username: string;
    avatar_url?: string;
    verified?: boolean;
  };
  replies?: Comment[];
}

interface CommentsSectionProps {
  postId: string;
  commentsCount: number;
  onCommentsCountChange?: (count: number) => void;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  postId,
  commentsCount,
  onCommentsCountChange
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [showAllComments, setShowAllComments] = useState(false);
  const { toast } = useToast();

  // Mock comments data for demonstration
  const mockComments: Comment[] = [
    {
      id: '1',
      post_id: postId,
      user_id: 'user1',
      content: 'Such a beautiful puppy! 😍 @sarahlovesdogs how old is Luna?',
      mentions: ['sarahlovesdogs'],
      likes_count: 8,
      replies_count: 2,
      created_at: new Date(Date.now() - 3600000).toISOString(),
      profiles: {
        full_name: 'Mike Wilson',
        username: 'dogtrainer_mike',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        verified: false
      }
    },
    {
      id: '2',
      post_id: postId,
      user_id: 'user2',
      content: 'Great advice! I\'m definitely going to try positive reinforcement with my puppy.',
      likes_count: 12,
      replies_count: 0,
      created_at: new Date(Date.now() - 7200000).toISOString(),
      profiles: {
        full_name: 'Emma Davis',
        username: 'bellaadventures',
        avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
        verified: false
      }
    },
    {
      id: '3',
      post_id: postId,
      user_id: 'user3',
      content: 'Love seeing rescue success stories! @rescuepawsorg does amazing work. Keep it up! 💕',
      mentions: ['rescuepawsorg'],
      likes_count: 24,
      replies_count: 1,
      created_at: new Date(Date.now() - 10800000).toISOString(),
      profiles: {
        full_name: 'Sarah Johnson',
        username: 'sarahlovesdogs',
        avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
        verified: true
      }
    }
  ];

  useEffect(() => {
    // Load comments for the post
    setTimeout(() => {
      setComments(mockComments);
      setLoading(false);
    }, 1000);
  }, [postId]);

  const handleAddComment = async (content: string, mentions: string[]) => {
    try {
      // In a real app, this would make an API call
      const newComment: Comment = {
        id: Date.now().toString(),
        post_id: postId,
        user_id: 'current_user',
        content,
        mentions,
        likes_count: 0,
        replies_count: 0,
        created_at: new Date().toISOString(),
        profiles: {
          full_name: 'You',
          username: 'you',
          verified: false
        }
      };

      setComments(prev => [newComment, ...prev]);
      onCommentsCountChange?.(commentsCount + 1);

      // Send notifications for mentions
      if (mentions.length > 0) {
        toast({
          title: "Mentions sent",
          description: `Notified ${mentions.length} user${mentions.length > 1 ? 's' : ''}`,
        });
      }

      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully",
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAddReply = async (parentCommentId: string, content: string, mentions: string[]) => {
    try {
      // In a real app, this would make an API call
      const newReply: Comment = {
        id: Date.now().toString(),
        post_id: postId,
        user_id: 'current_user',
        parent_comment_id: parentCommentId,
        content,
        mentions,
        likes_count: 0,
        replies_count: 0,
        created_at: new Date().toISOString(),
        profiles: {
          full_name: 'You',
          username: 'you',
          verified: false
        }
      };

      // Update parent comment's replies count
      setComments(prev => prev.map(comment => 
        comment.id === parentCommentId
          ? { ...comment, replies_count: comment.replies_count + 1 }
          : comment
      ));

      // In a real implementation, you'd also add the reply to the parent's replies array
      toast({
        title: "Reply added",
        description: "Your reply has been posted successfully",
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post reply. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleLikeComment = (commentId: string) => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId
        ? { ...comment, likes_count: comment.likes_count + 1 }
        : comment
    ));
  };

  const loadReplies = async (commentId: string): Promise<Comment[]> => {
    // Mock replies for demonstration
    const mockReplies: Comment[] = [
      {
        id: `${commentId}-reply-1`,
        post_id: postId,
        user_id: 'user4',
        parent_comment_id: commentId,
        content: 'She\'s 3 months old! Still learning but so smart already.',
        likes_count: 3,
        replies_count: 0,
        created_at: new Date(Date.now() - 1800000).toISOString(),
        profiles: {
          full_name: 'Sarah Johnson',
          username: 'sarahlovesdogs',
          avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
          verified: true
        }
      }
    ];

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockReplies;
  };

  const sortedComments = [...comments].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const displayedComments = showAllComments ? sortedComments : sortedComments.slice(0, 3);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="w-24 h-3 bg-gray-200 rounded"></div>
                  <div className="w-full h-4 bg-gray-200 rounded"></div>
                  <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Comments ({commentsCount})
          </CardTitle>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
          >
            {sortOrder === 'newest' ? (
              <>
                <SortDesc className="w-4 h-4 mr-1" />
                Newest first
              </>
            ) : (
              <>
                <SortAsc className="w-4 h-4 mr-1" />
                Oldest first
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Add Comment */}
        <CommentInput
          placeholder="Write a comment... Use @username to mention someone"
          onSubmit={handleAddComment}
          buttonText="Comment"
        />
        
        {/* Comments List */}
        {comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {displayedComments.map((comment) => (
              <CommentThread
                key={comment.id}
                comment={comment}
                onReply={handleAddReply}
                onLike={handleLikeComment}
                onLoadReplies={loadReplies}
              />
            ))}
            
            {/* Show More/Less Button */}
            {comments.length > 3 && (
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={() => setShowAllComments(!showAllComments)}
                >
                  {showAllComments 
                    ? 'Show fewer comments' 
                    : `View ${comments.length - 3} more comments`
                  }
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CommentsSection;