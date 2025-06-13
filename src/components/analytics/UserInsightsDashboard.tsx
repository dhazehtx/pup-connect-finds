
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Eye, 
  Heart, 
  MessageCircle, 
  Search, 
  Clock, 
  Target,
  BarChart3,
  Lightbulb
} from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useSmartRecommendations } from '@/hooks/useSmartRecommendations';

const UserInsightsDashboard = () => {
  const { userMetrics, trackEvent, generateInsights, loading } = useAnalytics();
  const { userBehavior } = useSmartRecommendations();
  const [insights, setInsights] = useState<any>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  useEffect(() => {
    trackEvent('page_view', { page: 'user_insights' });
  }, [trackEvent]);

  const handleGenerateInsights = async () => {
    setInsightsLoading(true);
    const data = await generateInsights();
    setInsights(data);
    setInsightsLoading(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Your Activity Insights</h1>
          <p className="text-muted-foreground">Understand your engagement and optimize your search</p>
        </div>
        <Button onClick={handleGenerateInsights} disabled={insightsLoading}>
          <Lightbulb className="w-4 h-4 mr-2" />
          {insightsLoading ? 'Generating...' : 'Generate AI Insights'}
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                <p className="text-2xl font-bold">{userMetrics?.total_sessions || 0}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Listings Viewed</p>
                <p className="text-2xl font-bold">{userMetrics?.total_listings_viewed || 0}</p>
              </div>
              <Eye className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Searches Made</p>
                <p className="text-2xl font-bold">{userMetrics?.total_searches || 0}</p>
              </div>
              <Search className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Favorites</p>
                <p className="text-2xl font-bold">{userMetrics?.total_favorites || 0}</p>
              </div>
              <Heart className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="behavior" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="behavior">Behavior Patterns</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="behavior">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Engagement Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Overall Activity</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round((userMetrics?.conversion_rate || 0) * 100)}%
                      </span>
                    </div>
                    <Progress value={(userMetrics?.conversion_rate || 0) * 100} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{userMetrics?.total_messages_sent || 0}</p>
                      <p className="text-sm text-muted-foreground">Messages Sent</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        {Math.round((userMetrics?.avg_session_duration || 0) / 60)}m
                      </p>
                      <p className="text-sm text-muted-foreground">Avg. Session</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Active</span>
                    <Badge variant="outline">
                      {userMetrics?.last_active ? 
                        new Date(userMetrics.last_active).toLocaleDateString() : 
                        'Never'
                      }
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Page Views</span>
                    <span className="font-medium">{userMetrics?.total_page_views || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Conversion Rate</span>
                    <span className="font-medium">
                      {Math.round((userMetrics?.conversion_rate || 0) * 100)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preferences">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Breed Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {userBehavior?.preferred_breeds?.length ? (
                    userBehavior.preferred_breeds.map((breed, index) => (
                      <Badge key={index} variant="secondary">{breed}</Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No breed preferences detected yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Price Range</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Min Price</span>
                    <span className="font-medium">
                      ${userBehavior?.price_range?.[0] || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Max Price</span>
                    <span className="font-medium">
                      ${userBehavior?.price_range?.[1] || 5000}
                    </span>
                  </div>
                  <Progress 
                    value={((userBehavior?.price_range?.[1] || 0) / 5000) * 100} 
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Personalized Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {insights ? (
                <div className="space-y-4">
                  {insights.recommendations?.map((insight: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                      <Badge variant="outline">{insight.category}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Lightbulb className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">AI Insights Coming Soon</h3>
                  <p className="text-muted-foreground mb-4">
                    Generate personalized insights based on your activity
                  </p>
                  <Button onClick={handleGenerateInsights} disabled={insightsLoading}>
                    {insightsLoading ? 'Generating...' : 'Generate Insights'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserInsightsDashboard;
