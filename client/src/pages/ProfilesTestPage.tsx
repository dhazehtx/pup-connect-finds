import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import FollowButton from '@/components/follow/FollowButton';
import BookmarkButton from '@/components/bookmarks/BookmarkButton';
import ReportModal from '@/components/reports/ReportModal';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Heart, 
  MessageCircle, 
  Share, 
  Flag,
  Bookmark,
  Search,
  UserPlus,
  Calendar,
  MapPin,
  Shield
} from 'lucide-react';

const ProfilesTestPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  // Mock users for testing follow functionality
  const mockUsers = [
    {
      id: 'user-1',
      username: 'dog_lover_123',
      full_name: 'Sarah Johnson',
      bio: 'Golden Retriever breeder with 10+ years experience. AKC certified.',
      avatar_url: null,
      verified: true,
      followers_count: 1250,
      following_count: 340,
      posts_count: 89,
      location: 'California, USA',
      joined: '2023-01-15'
    },
    {
      id: 'user-2',
      username: 'puppylove_rescue',
      full_name: 'Rescue Paws Foundation',
      bio: 'Non-profit rescue organization saving lives one pup at a time ❤️',
      avatar_url: null,
      verified: true,
      followers_count: 2890,
      following_count: 156,
      posts_count: 203,
      location: 'Texas, USA',
      joined: '2022-08-20'
    },
    {
      id: 'user-3',
      username: 'bella_the_beagle',
      full_name: 'Bella & Family',
      bio: 'Just a beagle living her best life! Training tips and daily adventures.',
      avatar_url: null,
      verified: false,
      followers_count: 567,
      following_count: 890,
      posts_count: 145,
      location: 'New York, USA',
      joined: '2023-06-10'
    }
  ];

  // Mock posts for testing bookmark and report functionality
  const mockPosts = [
    {
      id: 'post-1',
      title: 'Golden Retriever Puppies Available',
      content: 'Beautiful golden retriever puppies looking for loving homes. All health tested and vaccinated.',
      author: 'dog_lover_123',
      likes_count: 45,
      comments_count: 12,
      shares_count: 8,
      created_at: '2024-01-20'
    },
    {
      id: 'post-2',
      title: 'Rescue Success Story',
      content: 'Meet Max - from abandoned puppy to therapy dog! His transformation is incredible.',
      author: 'puppylove_rescue',
      likes_count: 234,
      comments_count: 67,
      shares_count: 43,
      created_at: '2024-01-19'
    }
  ];

  // Mock listings for testing bookmark functionality
  const mockListings = [
    {
      id: 'listing-1',
      title: 'AKC German Shepherd Puppies',
      description: 'Champion bloodline German Shepherd puppies. Health guaranteed.',
      price: 1200,
      location: 'Denver, CO',
      breed: 'German Shepherd'
    },
    {
      id: 'listing-2',
      title: 'French Bulldog - Rehoming',
      description: 'Sweet 3-year-old Frenchie needs new home due to allergies.',
      price: 800,
      location: 'Miami, FL',
      breed: 'French Bulldog'
    }
  ];

  const filteredUsers = mockUsers.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePostAction = (action: string, id: string) => {
    toast({
      title: `${action} Test`,
      description: `${action} functionality working for ${id}`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Social Features Test Page
            </CardTitle>
            <p className="text-muted-foreground">
              Test bookmark, follow, and report functionality
            </p>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* User Profiles Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Follow System Test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredUsers.map((mockUser) => (
                <Card key={mockUser.id} className="h-fit">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={mockUser.avatar_url || undefined} />
                        <AvatarFallback>
                          {mockUser.full_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <h3 className="font-semibold text-sm truncate">
                            {mockUser.full_name}
                          </h3>
                          {mockUser.verified && (
                            <Shield className="w-3 h-3 text-blue-600" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          @{mockUser.username}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {mockUser.bio}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <MapPin className="w-3 h-3" />
                      <span>{mockUser.location}</span>
                      <Calendar className="w-3 h-3 ml-2" />
                      <span>Joined {new Date(mockUser.joined).getFullYear()}</span>
                    </div>

                    <div className="flex justify-between text-xs mb-3">
                      <span><strong>{mockUser.followers_count}</strong> followers</span>
                      <span><strong>{mockUser.following_count}</strong> following</span>
                      <span><strong>{mockUser.posts_count}</strong> posts</span>
                    </div>

                    <div className="flex gap-2">
                      <FollowButton 
                        userId={mockUser.id} 
                        size="sm" 
                        className="flex-1"
                      />
                      <ReportModal
                        targetId={mockUser.id}
                        targetType="user"
                        targetTitle={mockUser.full_name}
                        trigger={
                          <Button variant="outline" size="sm">
                            <Flag className="w-3 h-3" />
                          </Button>
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Posts Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bookmark className="w-5 h-5" />
              Bookmark & Report Test - Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockPosts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>
                          {post.author[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">@{post.author}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <h3 className="font-semibold mb-2">{post.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{post.content}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePostAction('Like', post.id)}
                          className="text-muted-foreground hover:text-red-600"
                        >
                          <Heart className="w-4 h-4 mr-1" />
                          {post.likes_count}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePostAction('Comment', post.id)}
                          className="text-muted-foreground hover:text-blue-600"
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          {post.comments_count}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePostAction('Share', post.id)}
                          className="text-muted-foreground hover:text-green-600"
                        >
                          <Share className="w-4 h-4 mr-1" />
                          {post.shares_count}
                        </Button>
                      </div>

                      <div className="flex items-center gap-2">
                        <BookmarkButton 
                          contentId={post.id} 
                          contentType="post" 
                          size="sm"
                        />
                        <ReportModal
                          targetId={post.id}
                          targetType="post"
                          targetTitle={post.title}
                          trigger={
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-red-600"
                            >
                              <Flag className="w-4 h-4" />
                            </Button>
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Listings Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bookmark className="w-5 h-5" />
              Bookmark & Report Test - Listings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {mockListings.map((listing) => (
                <Card key={listing.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{listing.title}</h3>
                        <Badge variant="outline" className="text-xs mt-1">
                          {listing.breed}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-primary">
                          ${listing.price}
                        </p>
                      </div>
                    </div>

                    <p className="text-muted-foreground text-sm mb-3">
                      {listing.description}
                    </p>

                    <p className="text-xs text-muted-foreground mb-4">
                      📍 {listing.location}
                    </p>

                    <div className="flex justify-between items-center">
                      <Button size="sm" className="flex-1 mr-2">
                        Contact Seller
                      </Button>
                      <div className="flex gap-1">
                        <BookmarkButton 
                          contentId={listing.id} 
                          contentType="listing" 
                          size="sm"
                        />
                        <ReportModal
                          targetId={listing.id}
                          targetType="listing"
                          targetTitle={listing.title}
                          trigger={
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-muted-foreground hover:text-red-600"
                            >
                              <Flag className="w-4 h-4" />
                            </Button>
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle>Test Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-900">Follow System:</p>
                <p className="text-blue-800">Click follow buttons to test user following. Buttons should show "Following" state and allow unfollowing on hover.</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="font-medium text-green-900">Bookmark System:</p>
                <p className="text-green-800">Click bookmark icons on posts and listings. Icons should fill when bookmarked and be accessible at /bookmarks.</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <p className="font-medium text-orange-900">Report System:</p>
                <p className="text-orange-800">Click flag icons to open report modals. Select reasons and submit reports for admin review.</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="font-medium text-purple-900">Navigation:</p>
                <p className="text-purple-800">Visit /bookmarks to see saved content and use admin panel to review reports.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilesTestPage;