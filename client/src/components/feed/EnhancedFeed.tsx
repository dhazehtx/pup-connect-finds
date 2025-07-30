import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Video, 
  Search, 
  TrendingUp,
  Heart,
  MessageCircle,
  Play
} from 'lucide-react';
import PostCard from './PostCard';
import CreatePostModal from './CreatePostModal';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

interface Post {
  id: string;
  user_id: string;
  title?: string;
  content: string;
  image_url?: string;
  images?: string[];
  video_url?: string;
  videos?: string[];
  post_type: string;
  caption?: string;
  hashtags?: string[];
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count?: number;
  created_at: string;
  profiles?: {
    full_name: string;
    username: string;
    avatar_url?: string;
    verified?: boolean;
  };
}

const EnhancedFeed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Mock data for demonstration
  const mockPosts: Post[] = [
    {
      id: '1',
      user_id: 'user1',
      title: 'Meet Luna - Golden Retriever Puppy!',
      content: 'Just adopted this beautiful Golden Retriever puppy! She\'s 3 months old and already learning her first tricks. Looking for training tips from fellow dog parents! 🐕',
      images: [
        'https://images.unsplash.com/photo-1552053831-71594a27632d?w=500',
        'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500',
        'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500'
      ],
      post_type: 'image',
      hashtags: ['GoldenRetriever', 'Puppy', 'NewDog', 'Training'],
      likes_count: 124,
      comments_count: 18,
      shares_count: 5,
      created_at: new Date().toISOString(),
      profiles: {
        full_name: 'Sarah Johnson',
        username: 'sarahlovesdogs',
        avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
        verified: true
      }
    },
    {
      id: '2',
      user_id: 'user2',
      content: 'Training session with Max! Teaching him new tricks with positive reinforcement. Consistency is key! 🎯',
      video_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      post_type: 'reel',
      caption: 'Training session with Max! Teaching him new tricks with positive reinforcement. #DogTraining #PositiveReinforcement #Puppy',
      hashtags: ['DogTraining', 'PositiveReinforcement', 'Puppy'],
      likes_count: 89,
      comments_count: 12,
      shares_count: 3,
      views_count: 856,
      created_at: new Date(Date.now() - 3600000).toISOString(),
      profiles: {
        full_name: 'Mike Wilson',
        username: 'dogtrainer_mike',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        verified: false
      }
    },
    {
      id: '3',
      user_id: 'user3',
      title: 'Dog Park Adventures',
      content: 'Beautiful day at the dog park! Bella made so many new friends today. There\'s nothing better than watching dogs play and socialize. What\'s your favorite dog park activity?',
      image_url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500',
      post_type: 'image',
      hashtags: ['DogPark', 'Socialization', 'PlayTime'],
      likes_count: 67,
      comments_count: 24,
      shares_count: 8,
      created_at: new Date(Date.now() - 7200000).toISOString(),
      profiles: {
        full_name: 'Emma Davis',
        username: 'bellaadventures',
        avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
        verified: false
      }
    },
    {
      id: '4',
      user_id: 'user4',
      content: 'Rescue transformation story! From scared shelter pup to confident family dog. Adoption saves lives! 💕',
      video_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      post_type: 'video',
      hashtags: ['RescueDog', 'AdoptDontShop', 'Transformation'],
      likes_count: 234,
      comments_count: 45,
      shares_count: 19,
      views_count: 1200,
      created_at: new Date(Date.now() - 14400000).toISOString(),
      profiles: {
        full_name: 'Rescue Paws Organization',
        username: 'rescuepawsorg',
        avatar_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150',
        verified: true
      }
    }
  ];

  useEffect(() => {
    // Simulate loading posts
    setTimeout(() => {
      setPosts(mockPosts);
      setLoading(false);
    }, 1000);
  }, []);

  const handleCreatePost = async (postData: any) => {
    // In a real app, this would make an API call
    console.log('Creating post:', postData);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Add new post to feed
    const newPost: Post = {
      id: Date.now().toString(),
      user_id: 'current_user',
      title: postData.title,
      content: postData.content,
      post_type: postData.post_type,
      hashtags: postData.hashtags,
      likes_count: 0,
      comments_count: 0,
      shares_count: 0,
      created_at: new Date().toISOString(),
      profiles: {
        full_name: 'You',
        username: 'you',
        verified: false
      }
    };

    setPosts(prev => [newPost, ...prev]);
  };

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, likes_count: post.likes_count + 1 }
        : post
    ));
  };

  const handleComment = (postId: string) => {
    toast({
      title: "Comments",
      description: "Comments feature coming soon!",
    });
  };

  const handleShare = (postId: string) => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out this post!',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Post link copied to clipboard",
      });
    }
  };

  const handleOpenReels = (postId?: string) => {
    setLocation('/reels');
  };

  const filteredPosts = posts.filter(post => 
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.hashtags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const reelsPosts = posts.filter(post => post.post_type === 'reel');

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="w-24 h-4 bg-gray-200 rounded"></div>
                    <div className="w-16 h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="w-full h-4 bg-gray-200 rounded"></div>
                  <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                  <div className="w-full h-64 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Header Actions */}
      <div className="flex gap-3">
        <CreatePostModal
          trigger={
            <Button className="flex-1">
              <Plus className="w-4 h-4 mr-2" />
              Create Post
            </Button>
          }
          onCreatePost={handleCreatePost}
        />
        
        {reelsPosts.length > 0 && (
          <Button 
            variant="outline" 
            onClick={() => handleOpenReels()}
            className="flex-shrink-0"
          >
            <Video className="w-4 h-4 mr-2" />
            Watch Reels
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search posts, hashtags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Trending Hashtags */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5" />
            Trending
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {['GoldenRetriever', 'DogTraining', 'RescueDog', 'Puppy', 'AdoptDontShop'].map((tag) => (
              <Badge 
                key={tag}
                variant="secondary" 
                className="cursor-pointer hover:bg-primary/20"
                onClick={() => setSearchTerm(tag)}
              >
                #{tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reels Preview */}
      {reelsPosts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Play className="w-5 h-5" />
              Latest Reels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {reelsPosts.slice(0, 5).map((reel) => (
                <div 
                  key={reel.id}
                  className="flex-shrink-0 w-24 h-40 bg-black rounded-lg overflow-hidden cursor-pointer group relative"
                  onClick={() => handleOpenReels(reel.id)}
                >
                  <video className="w-full h-full object-cover">
                    <source src={reel.video_url} type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute bottom-1 left-1 right-1">
                    <div className="flex items-center text-white text-xs">
                      <Heart className="w-3 h-3 mr-1" />
                      {reel.likes_count}
                    </div>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => handleOpenReels()}
                className="flex-shrink-0 w-24 h-40 border-dashed border-2"
              >
                <div className="text-center">
                  <Play className="w-6 h-6 mx-auto mb-1" />
                  <span className="text-xs">View All</span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts Feed */}
      <div className="space-y-6">
        {filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm ? 'No posts found matching your search.' : 'No posts yet. Be the first to share!'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onComment={handleComment}
              onShare={handleShare}
              onOpenReels={handleOpenReels}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default EnhancedFeed;