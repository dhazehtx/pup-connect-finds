
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, MessageCircle, Share, Bookmark, Plus, Camera } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import ModernPostCreator from './ModernPostCreator';

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

const HomeFeed = () => {
  const { user, isGuest } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
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

      if (error) throw error;
      setPosts(data || []);
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

  const handlePostCreated = (newPost: any) => {
    // Refresh posts to show the new one
    fetchPosts();
    toast({
      title: "Post shared! 🎉",
      description: "Your post is now live!",
    });
    setShowPostCreator(false);
  };

  const handleLike = (postId: string) => {
    // TODO: Implement like functionality
    toast({
      title: "Like feature coming soon!",
      description: "We're working on this feature",
    });
  };

  const handleShare = (postId: string) => {
    toast({
      title: "Post Shared",
      description: "You have shared this post",
    });
  };

  const handleBookmark = (postId: string) => {
    toast({
      title: "Post Bookmarked",
      description: "You have bookmarked this post to view later",
    });
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

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto py-6 px-4">
          {/* Create Post Section */}
          {user && (
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
          )}

          {/* Posts Feed */}
          {loading ? (
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
                      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                      <div className="h-64 bg-gray-300 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Posts Yet</h3>
              <p className="text-gray-500 mb-4">
                Be the first to share a moment with the community!
              </p>
              {user && (
                <Button 
                  onClick={() => setShowPostCreator(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Post
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <Card key={post.id} className="shadow-sm">
                  <CardContent className="p-4">
                    {/* Post Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                          {post.profiles?.avatar_url ? (
                            <img
                              src={post.profiles.avatar_url}
                              alt={post.profiles.full_name || 'User'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            (post.profiles?.full_name || post.profiles?.username || 'U')?.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">
                            {post.profiles?.full_name || post.profiles?.username || 'User'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Post Caption */}
                    {post.caption && (
                      <p className="text-gray-900 mb-3 whitespace-pre-wrap">{post.caption}</p>
                    )}

                    {/* Post Media */}
                    {post.image_url && (
                      <img
                        src={post.image_url}
                        alt="Post content"
                        className="w-full rounded-lg mb-3 max-h-96 object-cover"
                      />
                    )}
                    
                    {post.video_url && (
                      <video
                        src={post.video_url}
                        className="w-full rounded-lg mb-3 max-h-96"
                        controls
                      />
                    )}

                    {/* Post Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex items-center space-x-4">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-600 hover:text-red-600"
                          onClick={() => handleLike(post.id)}
                        >
                          <Heart className="w-4 h-4 mr-1" />
                          <span className="text-sm">0</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          <span className="text-sm">0</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-600 hover:text-green-600"
                          onClick={() => handleShare(post.id)}
                        >
                          <Share className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-500"
                        onClick={() => handleBookmark(post.id)}
                      >
                        <Bookmark className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
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
