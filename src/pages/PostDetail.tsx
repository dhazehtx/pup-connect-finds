import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import PostHeader from '@/components/post/PostHeader';
import PostUserInfo from '@/components/post/PostUserInfo';
import PostImage from '@/components/post/PostImage';
import PostActions from '@/components/post/PostActions';
import PostLikes from '@/components/post/PostLikes';
import PostCaption from '@/components/post/PostCaption';
import CommentsSection from '@/components/post/CommentsSection';
import AddCommentInput from '@/components/post/AddCommentInput';
import ShareDialog from '@/components/post/ShareDialog';
import LikesModal from '@/components/post/LikesModal';
import PostPrivacySettings from '@/components/post/PostPrivacySettings';
import { useNavigate } from 'react-router-dom';

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(243);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  
  // Post privacy settings
  const [postPrivacySettings, setPostPrivacySettings] = useState({
    showLikes: true,
    allowComments: true,
  });

  // Mock post data - in real app this would come from an API
  const post = {
    id: postId,
    image: `https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=500&h=500&fit=crop`,
    user: {
      id: 'goldenpaws123',
      name: 'Golden Paws Kennel',
      username: 'goldenpaws',
      avatar: 'https://images.unsplash.com/photo-1560743173-567a3b5658b1?w=150&h=150&fit=crop&crop=face',
      isOwnPost: user?.id === 'goldenpaws123'
    },
    caption: 'Meet our beautiful Golden Retriever puppies! 🐕 These adorable little ones are looking for their forever homes. They are healthy, vaccinated, and ready to bring joy to your family. #GoldenRetriever #Puppies #DogsOfInstagram',
    timestamp: '2 hours ago'
  };

  // Mock users who liked the post
  const postLikes = [
    {
      id: 'sarah123',
      name: 'Sarah M.',
      username: 'sarah_m',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
      verified: true,
      isFollowing: false
    },
    {
      id: 'mike456',
      name: 'Mike D.',
      username: 'mike_d',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      verified: false,
      isFollowing: true
    },
    {
      id: 'emma789',
      name: 'Emma W.',
      username: 'emma_w',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      verified: true,
      isFollowing: false
    }
  ];

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

  const handleFollow = () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to follow users",
        variant: "destructive",
      });
      return;
    }

    setIsFollowing(!isFollowing);
    toast({
      title: isFollowing ? "Unfollowed" : "Following",
      description: isFollowing 
        ? `You have unfollowed ${post.user.name}` 
        : `You are now following ${post.user.name}`,
    });
  };

  const handleAddComment = (commentText: string) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to comment",
        variant: "destructive",
      });
      return;
    }

    if (!postPrivacySettings.allowComments) {
      toast({
        title: "Comments disabled",
        description: "Comments are not allowed on this post",
        variant: "destructive",
      });
      return;
    }

    const comment = {
      id: comments.length + 1,
      user: {
        id: user.id,
        name: user.email?.split('@')[0] || 'User',
        username: user.email?.split('@')[0] || 'user',
        avatar: ''
      },
      text: commentText,
      timestamp: 'now',
      likes: 0,
      isLiked: false
    };

    setComments([...comments, comment]);
    
    toast({
      title: "Comment added!",
      description: "Your comment has been posted",
    });
  };

  const handleProfileClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const handleLikesClick = () => {
    if (!postPrivacySettings.showLikes) {
      toast({
        title: "Likes hidden",
        description: "The post owner has hidden likes for this post",
        variant: "destructive",
      });
      return;
    }
    setShowLikesModal(true);
  };

  const scrollToComments = () => {
    const commentsSection = document.getElementById('comments-section');
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <PostHeader
        isOwnPost={post.user.isOwnPost}
        onPrivacySettingsClick={() => setShowPrivacySettings(true)}
      />

      <div>
        <PostUserInfo
          user={post.user}
          timestamp={post.timestamp}
          isFollowing={isFollowing}
          onProfileClick={handleProfileClick}
          onFollowClick={handleFollow}
        />

        <PostImage src={post.image} alt="Post" />

        <div className="p-4">
          <PostActions
            isLiked={isLiked}
            allowComments={postPrivacySettings.allowComments}
            onLikeToggle={handleLike}
            onCommentClick={scrollToComments}
            onShareClick={() => setShowShareDialog(true)}
          />

          <PostLikes
            likesCount={likesCount}
            showLikes={postPrivacySettings.showLikes}
            onLikesClick={handleLikesClick}
          />

          <PostCaption
            username={post.user.username}
            caption={post.caption}
            onProfileClick={handleProfileClick}
            userId={post.user.id}
          />

          <div id="comments-section">
            {postPrivacySettings.allowComments ? (
              <CommentsSection 
                comments={comments}
                setComments={setComments}
                onProfileClick={handleProfileClick}
              />
            ) : (
              <div className="text-gray-500 text-sm py-4 text-center">
                Comments have been disabled for this post
              </div>
            )}
          </div>

          <AddCommentInput
            onAddComment={handleAddComment}
            disabled={!postPrivacySettings.allowComments}
          />
        </div>
      </div>

      <ShareDialog
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        post={post}
      />

      <LikesModal
        isOpen={showLikesModal}
        onClose={() => setShowLikesModal(false)}
        likes={postLikes}
        onProfileClick={handleProfileClick}
      />

      {post.user.isOwnPost && (
        <PostPrivacySettings
          isOpen={showPrivacySettings}
          onClose={() => setShowPrivacySettings(false)}
          settings={postPrivacySettings}
          onSettingsChange={setPostPrivacySettings}
        />
      )}
    </div>
  );
};

export default PostDetail;
