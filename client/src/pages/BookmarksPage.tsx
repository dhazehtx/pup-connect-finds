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
  Grid3X3,
  List,
  ArrowLeft,
  Calendar,
  Heart,
  MessageCircle,
  Image,
  FileText
} from 'lucide-react';
import { useLocation } from 'wouter';

const BookmarksPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'posts' | 'listings'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Fetch bookmarks
  const { data: bookmarks, isLoading, error } = useQuery({
    queryKey: ['bookmarks', filterType],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/bookmarks?type=${filterType}`);
      return response.json();
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
              Please log in to view your bookmarks
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

  // Filter bookmarks based on search query
  const filteredBookmarks = bookmarks?.bookmarks?.filter((bookmark: any) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      bookmark.content_type.toLowerCase().includes(searchLower) ||
      bookmark.content_id.toLowerCase().includes(searchLower)
    );
  }) || [];

  const handleLike = (postId: string) => {
    toast({
      title: "Post Liked!",
      description: "Like functionality working on bookmarked content",
    });
  };

  const handleComment = (postId: string) => {
    toast({
      title: "Opening Comments",
      description: "Comment functionality available on bookmarked content",
    });
  };

  const handleShare = (postId: string) => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out this bookmarked content!',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Bookmark link copied to clipboard",
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
            <CardTitle className="text-red-600">Error Loading Bookmarks</CardTitle>
            <p className="text-muted-foreground">
              Unable to load your bookmarks. Please try again.
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
                  My Bookmarks
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {bookmarks?.total || 0} bookmarked item{(bookmarks?.total || 0) !== 1 ? 's' : ''}
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
                  placeholder="Search bookmarks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <Select value={filterType} onValueChange={(value: 'all' | 'posts' | 'listings') => setFilterType(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="posts">Posts</SelectItem>
                    <SelectItem value="listings">Listings</SelectItem>
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
              {filterType !== 'all' && (
                <Badge variant="secondary">
                  Type: {filterType}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bookmarks */}
        {filteredBookmarks.length > 0 ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
            {filteredBookmarks.map((bookmark: any) => (
              <Card key={bookmark.id} className={viewMode === 'grid' ? 'h-fit' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {bookmark.content_type === 'post' ? (
                      <FileText className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Image className="w-5 h-5 text-green-600" />
                    )}
                    <div className="flex-1">
                      <Badge variant="outline" className="text-xs">
                        {bookmark.content_type}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Bookmarked {new Date(bookmark.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <p>Content ID: {bookmark.content_id}</p>
                    <p className="text-xs mt-2">
                      Click to view full {bookmark.content_type}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Bookmark className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery || filterType !== 'all'
                  ? 'No bookmarks found' 
                  : 'No bookmarks yet'
                }
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || filterType !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Start bookmarking posts and listings to see them here!'
                }
              </p>
              {(searchQuery || filterType !== 'all') && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterType('all');
                  }}
                >
                  Clear all filters
                </Button>
              )}
              {(!bookmarks?.total || bookmarks.total === 0) && (
                <Button onClick={() => setLocation('/explore')}>
                  Explore Content
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        {bookmarks?.total > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Bookmark Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Bookmark className="mx-auto h-6 w-6 text-blue-600 mb-1" />
                  <p className="text-2xl font-bold text-blue-900">{bookmarks.total}</p>
                  <p className="text-xs text-blue-700">Total Bookmarks</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <FileText className="mx-auto h-6 w-6 text-green-600 mb-1" />
                  <p className="text-2xl font-bold text-green-900">
                    {filteredBookmarks.filter((b: any) => b.content_type === 'post').length}
                  </p>
                  <p className="text-xs text-green-700">Posts</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <Image className="mx-auto h-6 w-6 text-purple-600 mb-1" />
                  <p className="text-2xl font-bold text-purple-900">
                    {filteredBookmarks.filter((b: any) => b.content_type === 'listing').length}
                  </p>
                  <p className="text-xs text-purple-700">Listings</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <Calendar className="mx-auto h-6 w-6 text-orange-600 mb-1" />
                  <p className="text-2xl font-bold text-orange-900">
                    {filteredBookmarks.filter((b: any) => 
                      new Date(b.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    ).length}
                  </p>
                  <p className="text-xs text-orange-700">This Week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BookmarksPage;