
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Heart, MessageCircle, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';

interface ListingPerformanceDashboardProps {
  listingId?: string;
  userListings?: string[];
}

const ListingPerformanceDashboard = ({ listingId, userListings = [] }: ListingPerformanceDashboardProps) => {
  const { listingMetrics, trackEvent, loadListingMetrics, loading } = useAnalytics();
  const [selectedListing, setSelectedListing] = useState(listingId || userListings[0] || '');
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    if (selectedListing) {
      loadListingMetrics([selectedListing]);
      trackEvent('page_view', { page: 'listing_performance', listing_id: selectedListing });
    }
  }, [selectedListing, timeRange, loadListingMetrics, trackEvent]);

  const currentMetrics = listingMetrics.find(m => m.listing_id === selectedListing);

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
          <h1 className="text-3xl font-bold">Listing Performance</h1>
          <p className="text-muted-foreground">Track how your listings are performing</p>
        </div>
        
        <div className="flex gap-4">
          <Select value={selectedListing} onValueChange={setSelectedListing}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select listing" />
            </SelectTrigger>
            <SelectContent>
              {userListings.map(id => (
                <SelectItem key={id} value={id}>Listing {id.slice(0, 8)}...</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {!currentMetrics ? (
        <Card>
          <CardContent className="p-8 text-center">
            <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Performance Data</h3>
            <p className="text-muted-foreground">
              Performance data will appear here once your listing starts receiving views
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                    <p className="text-2xl font-bold">{currentMetrics.views}</p>
                    <p className="text-xs text-muted-foreground">
                      {currentMetrics.unique_views} unique
                    </p>
                  </div>
                  <Eye className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Favorites</p>
                    <p className="text-2xl font-bold">{currentMetrics.favorites}</p>
                    <p className="text-xs text-green-600 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {((currentMetrics.favorites / currentMetrics.views) * 100).toFixed(1)}% rate
                    </p>
                  </div>
                  <Heart className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Inquiries</p>
                    <p className="text-2xl font-bold">{currentMetrics.inquiries}</p>
                    <p className="text-xs text-blue-600 flex items-center">
                      <MessageCircle className="w-3 h-3 mr-1" />
                      {((currentMetrics.inquiries / currentMetrics.views) * 100).toFixed(1)}% rate
                    </p>
                  </div>
                  <MessageCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Conversion</p>
                    <p className="text-2xl font-bold">
                      {(currentMetrics.conversion_rate * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      vs. platform avg
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Details */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Click-through Rate</span>
                    <span className="text-sm text-muted-foreground">
                      {(currentMetrics.click_through_rate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={currentMetrics.click_through_rate * 100} />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Bounce Rate</span>
                    <span className="text-sm text-muted-foreground">
                      {(currentMetrics.bounce_rate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={currentMetrics.bounce_rate * 100} className="[&>div]:bg-red-500" />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Avg. View Duration</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(currentMetrics.avg_view_duration)}s
                    </span>
                  </div>
                  <Progress value={Math.min((currentMetrics.avg_view_duration / 60) * 100, 100)} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Search Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Search Appearances</span>
                  <Badge variant="outline">{currentMetrics.search_appearances}</Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Position Clicked</span>
                  <Badge variant="secondary">#{currentMetrics.avg_position_clicked}</Badge>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Recommendations</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {currentMetrics.bounce_rate > 0.7 && (
                      <li>• Add more photos to reduce bounce rate</li>
                    )}
                    {currentMetrics.click_through_rate < 0.1 && (
                      <li>• Optimize your listing title and description</li>
                    )}
                    {currentMetrics.avg_view_duration < 30 && (
                      <li>• Improve listing content engagement</li>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default ListingPerformanceDashboard;
