import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePosts } from '@/hooks/usePosts';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, MessageCircle, Share, Bookmark, Plus, Camera } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import ModernPostCreator from './ModernPostCreator';
import { formatPostTime } from '@/utils/timeFormatting';
import LoadingSpinner from '@/components/ui/loading-spinner';
import ErrorState from '@/components/ui/error-state';

const HomeFeed = () => {
  const { user, isGuest } = useAuth();
  const { toast } = useToast();
  const { posts, loading, fetchPosts, error } = usePosts(); // Get all posts, not filtered by user
  const [showPostCreator, setShowPostCreator] = useState(false);

  useEffect(() => {
    document.title = 'My Pup - Home';
  }, []);

  const handleLike = (postId: string) => {
    // Mock like functionality - you can implement actual like logic later
    toast({
      title: "Post Liked",
      description: "You liked this post",
    });
  };

  const handleShare = (postId: string) => {
    toast({
      title: "Post Shared",
      description: `You have shared post ${postId} with your followers`,
    });
  };

  const handleBookmark = (postId: string) => {
    toast({
      title: "Post Bookmarked",
      description: `You have bookmarked post ${postId} to view later`,
    });
  };

  const handlePostCreated = () => {
    fetchPosts(); // Refresh the feed
    toast({
      title: "Post shared! 🎉",
      description: "Your post is now live!",
    });
    setShowPostCreator(false);
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
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" text="Loading feed..." />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto py-6 px-4">
          <ErrorState
            title="Unable to load posts"
            message="Please try again."
            onRetry={fetchPosts}
            retryText="Reload feed"
          />
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
          <div className="space-y-6">
            {posts.length === 0 ? (
              <Card className="shadow-sm">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Posts Yet</h3>
                  <p className="text-gray-500 mb-4">
                    Be the first to share a moment with the community!
                  </p>
                  <Button onClick={() => setShowPostCreator(true)}>
                    Create First Post
                  </Button>
                </CardContent>
              </Card>
            ) : (
              posts.map((post) => (
                <Card key={post.id} className="shadow-sm">
                  <CardContent className="p-4">
                    {/* User Info */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden">
                          {post.profiles?.avatar_url ? (
                            <img
                              src={post.profiles.avatar_url}
                              alt={post.profiles.full_name || 'User'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                              {(post.profiles?.full_name || post.profiles?.username || 'U')?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">
                            {post.profiles?.full_name || post.profiles?.username || 'User'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatPostTime(post.created_at)}
                          </div>
                        </div>
                      </div>
                      <Badge className="rounded-full">Dog Lover</Badge>
                    </div>

                    {/* Post Caption */}
                    {post.caption && (
                      <p className="text-gray-900 mb-3 whitespace-pre-wrap">{post.caption}</p>
                    )}

                    {/* Post Image */}
                    {post.image_url && (
                      <img
                        src={post.image_url}
                        alt="Post content"
                        className="w-full rounded-md mb-3 max-h-96 object-cover"
                      />
                    )}

                    {/* Post Video */}
                    {post.video_url && (
                      <video
                        src={post.video_url}
                        className="w-full rounded-md mb-3 max-h-96"
                        controls
                      />
                    )}

                    {/* Post Actions */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-4">
                        <Button
                          onClick={() => handleLike(post.id)}
                          variant="ghost"
                          size="icon"
                        >
                          <Heart className="w-5 h-5 text-gray-500" />
                          <span className="ml-1 text-sm">0</span>
                        </Button>
                        <Button variant="ghost" size="icon">
                          <MessageCircle className="w-5 h-5 text-gray-500" />
                        </Button>
                        <Button onClick={() => handleShare(post.id)} variant="ghost" size="icon">
                          <Share className="w-5 h-5 text-gray-500" />
                        </Button>
                      </div>
                      <Button onClick={() => handleBookmark(post.id)} variant="ghost" size="icon">
                        <Bookmark className="w-5 h-5 text-gray-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
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
