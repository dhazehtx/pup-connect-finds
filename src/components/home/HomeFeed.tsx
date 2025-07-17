
import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { formatPostTime } from '@/utils/timeFormatting';
import LoadingState from '@/components/ui/loading-state';

interface Post {
  id: string;
  caption: string | null;
  image_url: string | null;
  created_at: string;
  user_id: string;
  profiles: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

const HomeFeed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, [user]);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          caption,
          image_url,
          created_at,
          user_id,
          profiles (
            username,
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error loading posts",
        description: "Please try refreshing the page",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like posts",
        variant: "destructive",
      });
      return;
    }

    // For now, just toggle the like state locally since post_likes table doesn't exist
    const isLiked = likedPosts.has(postId);
    
    if (isLiked) {
      setLikedPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    } else {
      setLikedPosts(prev => new Set(prev).add(postId));
    }
  };

  const handleShare = async (post: Post) => {
    const shareUrl = `${window.location.origin}/post/${post.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.caption || 'Check out this post!',
          url: shareUrl,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "Post link has been copied to clipboard",
      });
    }
  };

  if (loading) {
    return <LoadingState message="Loading posts..." variant="card" />;
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="text-center">
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Be the first to post!</h3>
          <p className="text-gray-600 mb-6">
            Share a moment with your puppy to get the community started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-4 pb-4">
      {posts.map((post) => (
        <Card key={post.id} className="border-0 shadow-sm">
          <CardContent className="p-0">
            {/* Post Header */}
            <div className="flex items-center justify-between p-4 pb-3">
              <div className="flex items-center space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={post.profiles?.avatar_url || ''} />
                  <AvatarFallback className="text-xs">
                    {(post.profiles?.full_name || post.profiles?.username || 'U')[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900">
                    {post.profiles?.full_name || post.profiles?.username || 'Unknown User'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatPostTime(post.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Post Image */}
            {post.image_url && (
              <div className="relative">
                <img
                  src={post.image_url}
                  alt="Post content"
                  className="w-full aspect-square object-cover"
                />
              </div>
            )}

            {/* Post Actions and Caption */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(post.id)}
                    className="p-0 h-auto hover:bg-transparent"
                  >
                    <Heart
                      className={`w-6 h-6 ${
                        likedPosts.has(post.id)
                          ? 'fill-red-500 text-red-500'
                          : 'text-gray-700 hover:text-red-500'
                      } transition-colors`}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-auto hover:bg-transparent"
                  >
                    <MessageCircle className="w-6 h-6 text-gray-700 hover:text-blue-500 transition-colors" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare(post)}
                    className="p-0 h-auto hover:bg-transparent"
                  >
                    <Share2 className="w-6 h-6 text-gray-700 hover:text-green-500 transition-colors" />
                  </Button>
                </div>
              </div>

              {/* Caption */}
              {post.caption && (
                <div className="text-sm">
                  <span className="font-semibold text-gray-900 mr-2">
                    {post.profiles?.full_name || post.profiles?.username || 'Unknown User'}
                  </span>
                  <span className="text-gray-900">{post.caption}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default HomeFeed;
