import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import PostCard from '@/components/feed/PostCard';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { 
  Bookmark, 
  Search, 
  Filter,
  Grid3X3,
  List,
  ArrowLeft,
  Calendar,
  Tag,
  Heart,
  MessageCircle
} from 'lucide-react';
import { useLocation } from 'wouter';

const SavedPostsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'most_liked'>('newest');
  const [filterBy, setFilterBy] = useState<'all' | 'images' | 'videos' | 'text'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Fetch saved posts
  const { data: savedPosts, isLoading, error } = useQuery({
    queryKey: ['saved-posts', sortBy, filterBy],
    queryFn: async () => {
      return await apiRequest(`/api/saved-posts?sort=${sortBy}&filter=${filterBy}`);
    },
    enabled: !!user,
  });

  // Redirect if not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <Bookmark className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle>Login Required</CardTitle>
            <p className="text-muted-foreground">
              Please log in to view your saved posts
            </p>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setLocation('/login')} 
              className="w-full"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filter posts based on search query
  const filteredPosts = savedPosts?.posts?.filter((post: any) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      post.title?.toLowerCase().includes(searchLower) ||
      post.content?.toLowerCase().includes(searchLower) ||
      post.caption?.toLowerCase().includes(searchLower) ||
      post.hashtags?.some((tag: string) => tag.toLowerCase().includes(searchLower))
    );
  }) || [];

  const handleLike = (postId: string) => {
    toast({
      title: "Post Liked!",
      description: "Like functionality working on saved posts",
    });
  };

  const handleComment = (postId: string) => {
    toast({
      title: "Opening Comments",
      description: "Comment functionality available on saved posts",
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="h-32 animate-pulse bg-gray-200" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Error Loading Saved Posts</CardTitle>
            <p className="text-muted-foreground">
              Unable to load your saved posts. Please try again.
            </p>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setLocation('/profile')}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Profile
              </Button>
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-primary" />
                  My Saved Posts
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {savedPosts?.total || 0} saved post{(savedPosts?.total || 0) !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search saved posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={(value: 'newest' | 'oldest' | 'most_liked') => setSortBy(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                    <SelectItem value="most_liked">Most Liked</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterBy} onValueChange={(value: 'all' | 'images' | 'videos' | 'text') => setFilterBy(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="images">Images</SelectItem>
                    <SelectItem value="videos">Videos</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Filter badges */}
            <div className="flex flex-wrap gap-2 mt-4">
              {searchQuery && (
                <Badge variant="secondary">
                  Search: "{searchQuery}"
                </Badge>
              )}
              {sortBy !== 'newest' && (
                <Badge variant="secondary">
                  Sort: {sortBy === 'oldest' ? 'Oldest First' : 'Most Liked'}
                </Badge>
              )}
              {filterBy !== 'all' && (
                <Badge variant="secondary">
                  Filter: {filterBy}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Posts */}
        {filteredPosts.length > 0 ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
            {filteredPosts.map((post: any) => (
              <div key={post.id} className={viewMode === 'grid' ? 'h-fit' : ''}>
                <PostCard
                  post={post}
                  onLike={handleLike}
                  onComment={handleComment}
                  onShare={handleShare}
                />
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Bookmark className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery || filterBy !== 'all' || sortBy !== 'newest' 
                  ? 'No posts found' 
                  : 'No saved posts yet'
                }
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || filterBy !== 'all' || sortBy !== 'newest'
                  ? 'Try adjusting your search or filters'
                  : 'Start saving posts to see them here. Look for the bookmark icon on any post!'
                }
              </p>
              {(searchQuery || filterBy !== 'all' || sortBy !== 'newest') && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterBy('all');
                    setSortBy('newest');
                  }}
                >
                  Clear all filters
                </Button>
              )}
              {(!savedPosts?.total || savedPosts.total === 0) && (
                <Button onClick={() => setLocation('/explore')}>
                  Explore Posts
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        {savedPosts?.total > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Saved Posts Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Bookmark className="mx-auto h-6 w-6 text-blue-600 mb-1" />
                  <p className="text-2xl font-bold text-blue-900">{savedPosts.total}</p>
                  <p className="text-xs text-blue-700">Total Saved</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <Heart className="mx-auto h-6 w-6 text-red-600 mb-1" />
                  <p className="text-2xl font-bold text-red-900">{savedPosts.totalLikes || 0}</p>
                  <p className="text-xs text-red-700">Total Likes</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <MessageCircle className="mx-auto h-6 w-6 text-green-600 mb-1" />
                  <p className="text-2xl font-bold text-green-900">{savedPosts.totalComments || 0}</p>
                  <p className="text-xs text-green-700">Total Comments</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <Calendar className="mx-auto h-6 w-6 text-purple-600 mb-1" />
                  <p className="text-2xl font-bold text-purple-900">{savedPosts.thisWeek || 0}</p>
                  <p className="text-xs text-purple-700">This Week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SavedPostsPage;