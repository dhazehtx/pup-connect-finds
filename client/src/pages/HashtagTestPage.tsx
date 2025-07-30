import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import HashtagParser from '@/components/tags/HashtagParser';
import TagSelector from '@/components/tags/TagSelector';
import TagFilter from '@/components/feed/TagFilter';
import PostCard from '@/components/feed/PostCard';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Hash, Tag, TrendingUp, Search } from 'lucide-react';
import { useLocation } from 'wouter';

const HashtagTestPage = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [testText, setTestText] = useState("Check out this amazing #puppytraining session! Our #goldenretriever Luna is learning so fast 🐕 #rescuedogs #doghealth #puppylove");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filterTags, setFilterTags] = useState<string[]>([]);

  // Sample posts with hashtags for testing
  const samplePosts = [
    {
      id: 'hashtag-test-1',
      user_id: 'test-user-1',
      title: 'Puppy Training Success!',
      content: 'Luna just mastered the "sit" command! 🎉 #puppytraining #goldenretriever #success #dogtraining #puppylife',
      images: ['https://images.unsplash.com/photo-1552053831-71594a27632d?w=500'],
      post_type: 'image',
      hashtags: ['puppytraining', 'goldenretriever', 'success', 'dogtraining', 'puppylife'],
      likes_count: 24,
      comments_count: 8,
      shares_count: 3,
      created_at: new Date(Date.now() - 3600000).toISOString(),
      profiles: {
        full_name: 'Sarah Wilson',
        username: 'sarahgolden',
        avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
        verified: true
      }
    },
    {
      id: 'hashtag-test-2',
      user_id: 'test-user-2',
      title: 'Rescue Dog Recovery',
      content: 'Max has come so far since we rescued him! From scared to confident 💪 #rescuedogs #dogrescue #rehabilitation #secondchances #adoptdontshop',
      images: [
        'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500',
        'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500'
      ],
      post_type: 'image',
      hashtags: ['rescuedogs', 'dogrescue', 'rehabilitation', 'secondchances', 'adoptdontshop'],
      likes_count: 67,
      comments_count: 15,
      shares_count: 12,
      created_at: new Date(Date.now() - 7200000).toISOString(),
      profiles: {
        full_name: 'Rescue Paws Organization',
        username: 'rescuepawsorg',
        avatar_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150',
        verified: true
      }
    },
    {
      id: 'hashtag-test-3',
      user_id: 'test-user-3',
      content: 'Important tips for new puppy owners! 🧵 Proper nutrition is key for healthy development #doghealth #puppycare #dognutrition #healthydog #puppytips',
      post_type: 'text',
      hashtags: ['doghealth', 'puppycare', 'dognutrition', 'healthydog', 'puppytips'],
      likes_count: 89,
      comments_count: 23,
      shares_count: 34,
      created_at: new Date(Date.now() - 10800000).toISOString(),
      profiles: {
        full_name: 'Dr. Emily Pet Vet',
        username: 'dremilyvet',
        avatar_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150',
        verified: true
      }
    }
  ];

  const handleHashtagClick = (hashtag: string) => {
    toast({
      title: `Hashtag clicked: #${hashtag}`,
      description: `Would navigate to filtered feed showing all posts with #${hashtag}`,
    });
  };

  const handleLike = (postId: string) => {
    toast({
      title: "Post Liked!",
      description: "Hashtag functionality working in post cards",
    });
  };

  const handleComment = (postId: string) => {
    toast({
      title: "Opening Comments",
      description: "Comments with hashtag parsing enabled",
    });
  };

  const handleShare = (postId: string) => {
    toast({
      title: "Sharing Post",
      description: "Share functionality with hashtag preservation",
    });
  };

  const clearAllFilters = () => {
    setFilterTags([]);
  };

  // Filter posts based on selected filter tags
  const filteredPosts = filterTags.length > 0 
    ? samplePosts.filter(post => 
        post.hashtags?.some(hashtag => filterTags.includes(hashtag))
      )
    : samplePosts;

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
                onClick={() => setLocation('/explore')}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Feed
              </Button>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="w-5 h-5" />
                  Hashtags & Topic Tags Testing
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Test hashtag parsing, topic tagging, and content discovery features
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 flex items-center justify-center gap-1">
                  <Hash className="w-4 h-4" />
                  Hashtag Parsing
                </h4>
                <p className="text-xs text-blue-700 mt-1">Clickable #hashtags in content</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900 flex items-center justify-center gap-1">
                  <Tag className="w-4 h-4" />
                  Topic Tagging
                </h4>
                <p className="text-xs text-green-700 mt-1">Up to 3 topic tags per post</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-900 flex items-center justify-center gap-1">
                  <Search className="w-4 h-4" />
                  Filter & Search
                </h4>
                <p className="text-xs text-purple-700 mt-1">Find content by tags</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <h4 className="font-semibold text-orange-900 flex items-center justify-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  Discovery
                </h4>
                <p className="text-xs text-orange-700 mt-1">Enhanced content discovery</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Testing Components */}
          <div className="space-y-6">
            {/* Hashtag Parser Test */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hashtag Parser Test</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Test Text:</label>
                  <Input
                    value={testText}
                    onChange={(e) => setTestText(e.target.value)}
                    placeholder="Type text with #hashtags..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Parsed Result:</label>
                  <div className="p-3 bg-gray-50 rounded border mt-1">
                    <HashtagParser 
                      text={testText} 
                      onHashtagClick={handleHashtagClick}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tag Selector Test */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Topic Tag Selector</CardTitle>
              </CardHeader>
              <CardContent>
                <TagSelector
                  selectedTags={selectedTags}
                  onTagsChange={setSelectedTags}
                  maxTags={3}
                  placeholder="Test topic tag selection..."
                />
              </CardContent>
            </Card>

            {/* Tag Filter Test */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tag Filter</CardTitle>
              </CardHeader>
              <CardContent>
                <TagFilter
                  selectedTags={filterTags}
                  onTagsChange={setFilterTags}
                  onClearFilters={clearAllFilters}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sample Posts */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Sample Posts with Hashtags
                  {filterTags.length > 0 && (
                    <Badge variant="secondary">
                      Filtered by {filterTags.length} tag{filterTags.length > 1 ? 's' : ''}
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Click hashtags in posts to test navigation. Use filters to test content discovery.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onLike={handleLike}
                      onComment={handleComment}
                      onShare={handleShare}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Hash className="mx-auto h-12 w-12 mb-3 opacity-50" />
                    <p>No posts found with the selected tags</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={clearAllFilters}
                      className="mt-2"
                    >
                      Clear filters
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Features Summary */}
            <Card>
              <CardHeader>
                <CardTitle>✅ Implemented Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-blue-700">Hashtag Parsing</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Automatic #hashtag detection</li>
                      <li>• Clickable hashtag links</li>
                      <li>• Hover effects and styling</li>
                      <li>• Navigation to filtered feeds</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-green-700">Topic Tagging</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Up to 3 topic tags per post</li>
                      <li>• Auto-suggest popular tags</li>
                      <li>• Tag validation and cleanup</li>
                      <li>• Database integration ready</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-purple-700">Content Discovery</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Tag-based content filtering</li>
                      <li>• Popular/trending tag support</li>
                      <li>• Search functionality</li>
                      <li>• Multi-tag filtering</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-orange-700">Database Schema</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• post_tags table for tagging</li>
                      <li>• popular_tags for trending</li>
                      <li>• Tag usage tracking</li>
                      <li>• Category-based organization</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HashtagTestPage;