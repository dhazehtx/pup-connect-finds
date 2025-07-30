import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PostCard from '@/components/feed/PostCard';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';

const CommentsTestPage = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Test post with comments functionality
  const testPost = {
    id: 'test-post-comments',
    user_id: 'test-user',
    title: 'Testing Advanced Comment Features',
    content: 'This post demonstrates our new threaded comments system with @mentions, nested replies, and real-time engagement! Try clicking the comment button to see the full comment modal with all features. #CommentsTest #ThreadedReplies #Mentions',
    images: [
      'https://images.unsplash.com/photo-1552053831-71594a27632d?w=500',
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500'
    ],
    post_type: 'image',
    hashtags: ['CommentsTest', 'ThreadedReplies', 'Mentions', 'SocialFeatures'],
    likes_count: 42,
    comments_count: 8,
    shares_count: 3,
    created_at: new Date().toISOString(),
    profiles: {
      full_name: 'Comments Demo User',
      username: 'commentsdemo',
      avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
      verified: true
    }
  };

  const handleLike = (postId: string) => {
    toast({
      title: "Post Liked!",
      description: "Like functionality working correctly",
    });
  };

  const handleComment = (postId: string) => {
    toast({
      title: "Opening Comments",
      description: "Comment modal will open with threaded comments",
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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
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
                <CardTitle>Advanced Comments Testing</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Test the new threaded comments, @mentions, and engagement features
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900">🧵 Threaded Comments</h4>
                <p className="text-xs text-blue-700 mt-1">Nested replies with visual threading</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900">@ Mentions</h4>
                <p className="text-xs text-green-700 mt-1">Auto-suggest and user notifications</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-900">💬 Rich UI</h4>
                <p className="text-xs text-purple-700 mt-1">Expand/collapse replies, likes, timestamps</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How to Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">1</span>
              <div>
                <p className="font-medium">Click the comment button on the post below</p>
                <p className="text-sm text-muted-foreground">This opens the post detail modal with full comments section</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">2</span>
              <div>
                <p className="font-medium">Try adding a comment with @mentions</p>
                <p className="text-sm text-muted-foreground">Type @ to see auto-suggest dropdown with available users</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">3</span>
              <div>
                <p className="font-medium">Reply to existing comments</p>
                <p className="text-sm text-muted-foreground">Click "Reply" on any comment to start a threaded conversation</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">4</span>
              <div>
                <p className="font-medium">Expand/collapse comment threads</p>
                <p className="text-sm text-muted-foreground">Use "View X replies" to show/hide nested conversations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Post */}
        <PostCard
          post={testPost}
          onLike={handleLike}
          onComment={handleComment}
          onShare={handleShare}
        />

        {/* Features List */}
        <Card>
          <CardHeader>
            <CardTitle>✅ Implemented Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-700">Comment Threading</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Nested replies up to 3 levels deep</li>
                  <li>• Visual thread lines and indentation</li>
                  <li>• Expand/collapse reply threads</li>
                  <li>• Reply count tracking</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-700">@Mentions System</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Auto-suggest dropdown on @</li>
                  <li>• User search by name/username</li>
                  <li>• Mention highlighting in comments</li>
                  <li>• Notification system integration</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-purple-700">Enhanced UI/UX</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Post detail modal with comments</li>
                  <li>• Real-time engagement counters</li>
                  <li>• Sort comments (newest/oldest)</li>
                  <li>• Like individual comments</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-orange-700">Database Schema</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• parent_comment_id for threading</li>
                  <li>• mentions array for @mentions</li>
                  <li>• comment_likes table for engagement</li>
                  <li>• mentions tracking table</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CommentsTestPage;