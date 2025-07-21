import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { usePosts } from '@/hooks/usePosts';
import { useFollow } from '@/hooks/useFollow';
import LoadingState from '@/components/ui/loading-state';
import ProfileHeader from './ProfileHeader';
import PostGrid from './PostGrid';
import EditPostModal from '@/components/home/EditPostModal';
import FullPostModal from '@/components/post/FullPostModal';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  username: string | null;
  bio: string | null;
  location: string | null;
  avatar_url: string | null;
  website: string | null;
  user_type: 'buyer' | 'seller' | 'both';
  rating: number;
  total_reviews: number;
  created_at: string;
  privacy_settings: any;
  social_links: any;
  follower_count?: number;
  following_count?: number;
  post_count?: number;
  verified?: boolean;
}

interface UnifiedProfileViewProps {
  userId?: string;
  isCurrentUser: boolean;
}

const UnifiedProfileView = ({ userId, isCurrentUser }: UnifiedProfileViewProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [isFullPostModalOpen, setIsFullPostModalOpen] = useState(false);

  const targetUserId = userId || user?.id;
  const { posts, loading: postsLoading, fetchPosts } = usePosts(targetUserId);
  const { isFollowing, followerCount, followingCount, toggleFollow } = useFollow(targetUserId || '');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', targetUserId)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          toast({
            title: "Error",
            description: "Failed to load profile",
            variant: "destructive",
          });
        }

        const { data: followerData } = await supabase
          .from('followers')
          .select('*', { count: 'exact' })
          .eq('following_id', targetUserId);

        const { data: followingData } = await supabase
          .from('followers')
          .select('*', { count: 'exact' })
          .eq('follower_id', targetUserId);

        const { data: postData } = await supabase
          .from('posts')
          .select('*', { count: 'exact' })
          .eq('user_id', targetUserId);

        setProfile({
          ...profileData,
          follower_count: followerData ? followerData.length : 0,
          following_count: followingData ? followingData.length : 0,
          post_count: postData ? postData.length : 0,
        } as Profile);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [targetUserId, toast]);

  const handlePostUpdate = (postId: string, newCaption: string) => {
    // Update the post in the local state
    fetchPosts(); // Refresh posts
    setEditingPost(null);
    
    toast({
      title: "Post updated",
      description: "Your post has been successfully updated.",
    });
  };

  const handlePostDelete = async (postId: string) => {
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      // Refresh posts
      fetchPosts();
      
      toast({
        title: "Post deleted",
        description: "Your post has been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePostClick = (post: any) => {
    setSelectedPost(post);
    setIsFullPostModalOpen(true);
  };

  const handleEditPost = (post: any) => {
    // Transform the post data for EditPostModal
    const transformedPost = {
      id: parseInt(post.id) || 0,
      postUuid: post.id,
      user: {
        id: post.user_id,
        username: post.profiles?.username || post.profiles?.full_name || 'User',
        name: post.profiles?.full_name || post.profiles?.username || 'User',
        location: 'Location',
        avatar: post.profiles?.avatar_url || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face`
      },
      image: post.image_url || '',
      likes: 0,
      isLiked: false,
      caption: post.caption || '',
      timeAgo: 'now'
    };
    setEditingPost(transformedPost);
  };

  const handlePostUpdateFromModal = (postId: string, newCaption: string) => {
    fetchPosts(); // Refresh posts
  };

  const handlePostDeleteFromModal = (postId: string) => {
    fetchPosts(); // Refresh posts
  };

  if (loading) {
    return <LoadingState message="Loading profile..." />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-4">
          <div className="text-center py-8 text-gray-500">
            Profile not found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <ProfileHeader
          profile={profile}
          isCurrentUser={isCurrentUser}
          isFollowing={isFollowing}
          followerCount={followerCount}
          followingCount={followingCount}
          postCount={posts.length}
          onFollow={toggleFollow}
          onEditProfile={() => {}}
        />
        
        <PostGrid
          posts={posts}
          loading={postsLoading}
          isCurrentUser={isCurrentUser}
          onPostClick={handlePostClick}
          onEditPost={handleEditPost}
          onDeletePost={handlePostDelete}
        />
      </div>

      {/* Edit Post Modal */}
      <EditPostModal
        post={editingPost}
        isOpen={!!editingPost}
        onClose={() => setEditingPost(null)}
        onUpdate={handlePostUpdate}
      />

      {/* Full Post Modal */}
      <FullPostModal
        post={selectedPost}
        isOpen={isFullPostModalOpen}
        onClose={() => {
          setIsFullPostModalOpen(false);
          setSelectedPost(null);
        }}
        onProfileClick={(userId) => {
          // Handle profile navigation if needed
        }}
        onPostUpdate={handlePostUpdateFromModal}
        onPostDelete={handlePostDeleteFromModal}
      />
    </div>
  );
};

export default UnifiedProfileView;
