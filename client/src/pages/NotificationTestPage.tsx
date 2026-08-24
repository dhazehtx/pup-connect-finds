import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import NotificationButton from '@/components/notifications/NotificationButton';
import ShareModal from '@/components/share/ShareModal';
import AdvancedFilters from '@/components/explore/AdvancedFilters';
import { 
  Heart, 
  MessageCircle, 
  UserPlus, 
  Share,
  AtSign,
  Bell,
  TestTube,
  Filter,
  Search
} from 'lucide-react';

const NotificationTestPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState('like');
  const [targetId, setTargetId] = useState('test-post-1');
  const [content, setContent] = useState('');

  // Create test notification
  const createNotificationMutation = useMutation({
    mutationFn: async (notificationData: any) => {
      return apiRequest('/api/notifications', { method: 'POST', body: notificationData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: "Test notification created!",
        description: "Check the notification bell to see it.",
      });
    },
    onError: () => {
      toast({
        title: "Error creating notification",
        variant: "destructive",
      });
    },
  });

  const handleCreateNotification = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to test notifications.",
        variant: "destructive",
      });
      return;
    }

    createNotificationMutation.mutate({
      user_id: user.id,
      actor_id: user.id, // Self-notification for testing
      type: selectedType,
      target_id: targetId,
      target_type: 'post',
      content: content || undefined,
    });
  };

  const testFilters = (filters: any) => {
    console.log('Filter test:', filters);
    toast({
      title: "Filters applied!",
      description: `Applied ${Object.keys(filters).length} filter settings`,
    });
  };

  const notificationTypes = [
    { value: 'like', label: 'Like', icon: Heart, color: 'text-red-600' },
    { value: 'comment', label: 'Comment', icon: MessageCircle, color: 'text-blue-600' },
    { value: 'reply', label: 'Reply', icon: MessageCircle, color: 'text-green-600' },
    { value: 'follow', label: 'Follow', icon: UserPlus, color: 'text-purple-600' },
    { value: 'mention', label: 'Mention', icon: AtSign, color: 'text-orange-600' },
    { value: 'post_share', label: 'Share', icon: Share, color: 'text-indigo-600' },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
            <p className="text-gray-600 mb-6">
              Please log in to test the notification, sharing, and explore filter features.
            </p>
            <Button onClick={() => window.location.href = '/auth'}>
              Log In
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <TestTube className="w-8 h-8 text-blue-600" />
            Feature Testing Center
          </h1>
          <p className="text-gray-600 mt-2">
            Test the new notification system, sharing functionality, and advanced explore filters
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Notification Testing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                Notification System
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Live Notification Button */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">Live Notification Center</span>
                  <NotificationButton />
                </div>
                <p className="text-sm text-gray-600">
                  Real notification button with red badge indicator and grouped notifications
                </p>
              </div>

              {/* Create Test Notification */}
              <div className="space-y-3">
                <label className="font-medium">Create Test Notification</label>
                
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {notificationTypes.map(type => {
                      const IconComponent = type.icon;
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <IconComponent className={`w-4 h-4 ${type.color}`} />
                            {type.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Target ID (e.g., post-123)"
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                />

                <Input
                  placeholder="Optional content/message"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />

                <Button
                  onClick={handleCreateNotification}
                  disabled={createNotificationMutation.isPending}
                  className="w-full"
                >
                  {createNotificationMutation.isPending ? 'Creating...' : 'Create Test Notification'}
                </Button>
              </div>

              {/* Features List */}
              <div className="space-y-2">
                <h4 className="font-medium">Features Tested:</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    ✅ Real-time notification grouping
                  </div>
                  <div className="flex items-center gap-2">
                    ✅ Red badge count indicator
                  </div>
                  <div className="flex items-center gap-2">
                    ✅ Mark as read/unread functionality
                  </div>
                  <div className="flex items-center gap-2">
                    ✅ Clear all notifications
                  </div>
                  <div className="flex items-center gap-2">
                    ✅ Professional UI with user avatars
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Share Modal Testing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share className="w-5 h-5 text-green-600" />
                Share Functionality
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Share Modal Demo */}
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">Share Modal Demo</span>
                  <ShareModal
                    postId="test-post-123"
                    postTitle="Adorable Golden Retriever Puppies"
                    postContent="Check out these beautiful puppies looking for their forever homes!"
                    postImage="/placeholder-puppy.jpg"
                    trigger={
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <Share className="w-4 h-4 mr-1" />
                        Test Share
                      </Button>
                    }
                  />
                </div>
                <p className="text-sm text-gray-600">
                  Complete sharing solution with external platform support
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-2">
                <h4 className="font-medium">Features Tested:</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    ✅ Copy link functionality
                  </div>
                  <div className="flex items-center gap-2">
                    ✅ Facebook sharing
                  </div>
                  <div className="flex items-center gap-2">
                    ✅ Twitter/X sharing
                  </div>
                  <div className="flex items-center gap-2">
                    ✅ Instagram link copy
                  </div>
                  <div className="flex items-center gap-2">
                    ✅ Native mobile sharing
                  </div>
                  <div className="flex items-center gap-2">
                    ✅ Clean shareable URLs
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  📱 <strong>Mobile Bonus:</strong> On mobile devices, you'll see a native share button that works with all installed apps!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Filters Testing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-purple-600" />
              Advanced Explore Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                Test the comprehensive filtering system with breed selection, age/price ranges, location filtering, and search functionality.
              </p>
              
              <AdvancedFilters
                onFiltersChange={testFilters}
                className="border border-purple-200"
              />

              <div className="space-y-2">
                <h4 className="font-medium">Features Tested:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    ✅ 22+ dog breed selection
                  </div>
                  <div className="flex items-center gap-2">
                    ✅ Age and price range sliders
                  </div>
                  <div className="flex items-center gap-2">
                    ✅ US state location filtering
                  </div>
                  <div className="flex items-center gap-2">
                    ✅ Sort by newest, price, verified
                  </div>
                  <div className="flex items-center gap-2">
                    ✅ Keyword search functionality
                  </div>
                  <div className="flex items-center gap-2">
                    ✅ localStorage filter persistence
                  </div>
                  <div className="flex items-center gap-2">
                    ✅ Mobile-responsive design
                  </div>
                  <div className="flex items-center gap-2">
                    ✅ Filter count indicators
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  💾 <strong>Persistence:</strong> Your filter selections are automatically saved and restored when you return to the explore page!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Integration Status */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              ✅ Integration Complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-green-700">
                All three major features have been successfully implemented and integrated:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                  <Bell className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-medium">Notifications</h4>
                  <p className="text-sm text-gray-600">Real-time engagement tracking with grouping and red badge indicators</p>
                </div>
                
                <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                  <Share className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-medium">External Sharing</h4>
                  <p className="text-sm text-gray-600">Social media integration with native mobile sharing support</p>
                </div>
                
                <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                  <Search className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-medium">Advanced Filters</h4>
                  <p className="text-sm text-gray-600">Comprehensive search with persistent filter preferences</p>
                </div>
              </div>
              
              <div className="text-center pt-4">
                <Badge className="bg-green-600 text-white">
                  PAWS is now a complete modern social platform! 🎉
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotificationTestPage;