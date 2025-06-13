
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Eye, MessageCircle, Clock, TrendingUp, Activity } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';

interface UserActivity {
  id: string;
  user_id: string;
  action: string;
  page: string;
  timestamp: string;
  session_duration?: number;
  user_info?: {
    username: string;
    avatar_url?: string;
    location?: string;
  };
}

const UserActivityTracker = () => {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [liveUpdates, setLiveUpdates] = useState(true);
  const { trackEvent, getAnalytics } = useAnalytics();

  useEffect(() => {
    if (liveUpdates) {
      const interval = setInterval(fetchRecentActivity, 3000);
      fetchRecentActivity();
      return () => clearInterval(interval);
    }
  }, [liveUpdates]);

  const fetchRecentActivity = async () => {
    // Mock real-time activity data
    const mockActivities: UserActivity[] = [
      {
        id: '1',
        user_id: 'user_123',
        action: 'viewed_listing',
        page: '/listing/golden-retriever-puppy',
        timestamp: new Date(Date.now() - Math.random() * 300000).toISOString(),
        user_info: {
          username: 'dog_lover_2024',
          location: 'San Francisco, CA'
        }
      },
      {
        id: '2',
        user_id: 'user_456',
        action: 'sent_message',
        page: '/messages',
        timestamp: new Date(Date.now() - Math.random() * 300000).toISOString(),
        session_duration: 1247,
        user_info: {
          username: 'breeder_pro',
          location: 'Austin, TX'
        }
      },
      {
        id: '3',
        user_id: 'user_789',
        action: 'created_listing',
        page: '/create-listing',
        timestamp: new Date(Date.now() - Math.random() * 300000).toISOString(),
        user_info: {
          username: 'happy_tails_kennel',
          location: 'Denver, CO'
        }
      },
      {
        id: '4',
        user_id: 'user_101',
        action: 'search_performed',
        page: '/explore',
        timestamp: new Date(Date.now() - Math.random() * 300000).toISOString(),
        user_info: {
          username: 'new_pet_parent',
          location: 'Seattle, WA'
        }
      }
    ];

    setActivities(mockActivities);
  };

  const formatTimestamp = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'viewed_listing': return <Eye className="w-4 h-4" />;
      case 'sent_message': return <MessageCircle className="w-4 h-4" />;
      case 'created_listing': return <TrendingUp className="w-4 h-4" />;
      case 'search_performed': return <Activity className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'viewed_listing': return 'text-blue-600 bg-blue-100';
      case 'sent_message': return 'text-green-600 bg-green-100';
      case 'created_listing': return 'text-purple-600 bg-purple-100';
      case 'search_performed': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Live User Activity
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={liveUpdates ? 'default' : 'secondary'} className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${liveUpdates ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              {liveUpdates ? 'LIVE' : 'PAUSED'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLiveUpdates(!liveUpdates)}
            >
              {liveUpdates ? 'Pause' : 'Resume'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className={`p-2 rounded-full ${getActionColor(activity.action)}`}>
                {getActionIcon(activity.action)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">
                    @{activity.user_info?.username}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatTimestamp(activity.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {formatAction(activity.action)} on {activity.page}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {activity.user_info?.location && (
                    <Badge variant="outline" className="text-xs">
                      {activity.user_info.location}
                    </Badge>
                  )}
                  {activity.session_duration && (
                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {Math.floor(activity.session_duration / 60)}m session
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserActivityTracker;
