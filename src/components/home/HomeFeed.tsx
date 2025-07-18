import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import ModernPostCreator from './ModernPostCreator';
import PostCard from './PostCard';

interface Post {
  id: string;
  user_id: string;
  caption: string | null;
  image_url: string | null;
  video_url: string | null;
  created_at: string;
  profiles?: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
}

interface PostCardData {
  id: number;
  postUuid: string; // Add the original UUID for like functionality
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
  likedBy: any[];
  comments: any[];
}

const HomeFeed = () => {
  const { user, isGuest } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<PostCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPostCreator, setShowPostCreator] = useState(false);

  useEffect(() => {
    document.title = 'My Pup - Home';
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_profiles_id_fkey (
            full_name,
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        return;
      }

      // Transform database posts to match PostCard interface
      const transformedPosts: PostCardData[] = (data || []).map((post: Post, index: number) => ({
        id: index + 1, // Simple numeric ID for display purposes
        postUuid: post.id, // Keep the original UUID for database operations
        user: {
          id: post.user_id,
          username: post.profiles?.username || 'Unknown User',
          name: post.profiles?.full_name || post.profiles?.username || 'Unknown User',
          location: 'Location', // Default for now
          avatar: post.profiles?.avatar_url || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face`
        },
        image: post.image_url || '',
        likes: 0, // Will be updated with real likes from usePostLikes hook
        isLiked: false, // Will be updated with user's like status from usePostLikes hook
        caption: post.caption || '',
        timeAgo: formatDistanceToNow(new Date(post.created_at), { addSuffix: true }),
        likedBy: [],
        comments: []
      })).filter(post => post.image); // Only show posts with images

      setPosts(transformedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLike = (postId: number) => {
    // This is handled by the usePostLikes hook in PostActions component
    // No need to manually update state here as the hook handles real-time updates
    console.log('Like toggled for post:', postId);
  };

  const handleShare = (postId: number) => {
    toast({
      title: "Post Shared",
      description: `You have shared the post with your followers`,
    });
  };

  const handleBookmark = (postId: number) => {
    toast({
      title: "Post Bookmarked",
      description: `You have bookmarked the post to view later`,
    });
  };

  const handleComment = (postId: number) => {
    console.log('Comment on post:', postId);
  };

  const handleShowLikes = (postId: number) => {
    console.log('Show likes for post:', postId);
  };

  const handleProfileClick = (userId: string) => {
    // Navigate to profile - this would be handled by routing
    console.log('Navigate to profile:', userId);
  };

  const handlePostCreated = async (newPost: any) => {
    // Refresh posts after creating a new one
    await fetchPosts();
    toast({
      title: "Post shared! 🎉",
      description: "Your post is now live!",
    });
    setShowPostCreator(false);
  };

  const handleCommentsUpdate = (updateFn: (comments: any[]) => any[]) => {
    // Handle comments update if needed
    console.log('Comments updated');
  };

  if (!user && !isGuest) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Welcome to MY PUP</h2>
            <p className="text-gray-600 mb-6">Sign in to see your personalized puppy feed</p>
            <Button className="w-full">Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto py-6 px-4">
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="shadow-sm">
                <CardContent className="p-4">
                  <div className="animate-pulse">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/6 mt-1"></div>
                      </div>
                    </div>
                    <div className="h-64 bg-gray-300 rounded mb-3"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto py-6 px-4">
          {/* Create Post Section */}
          <Card className="mb-6 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <Button
                  onClick={() => setShowPostCreator(true)}
                  variant="outline"
                  className="flex-1 justify-start text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-full border-gray-200"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Share a moment with your community...
                </Button>
                <Button
                  onClick={() => setShowPostCreator(true)}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-full"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Posts Feed */}
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Posts Yet</h3>
              <p className="text-gray-500 mb-6">Start sharing your puppy moments!</p>
              <Button
                onClick={() => setShowPostCreator(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Post
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  onProfileClick={handleProfileClick}
                  onShare={handleShare}
                  onBookmark={handleBookmark}
                  onComment={handleComment}
                  onShowLikes={handleShowLikes}
                  onCommentsUpdate={handleCommentsUpdate}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modern Post Creator Modal */}
      {showPostCreator && (
        <ModernPostCreator
          onClose={() => setShowPostCreator(false)}
          onPostCreated={handlePostCreated}
        />
      )}
    </>
  );
};

export default HomeFeed;
