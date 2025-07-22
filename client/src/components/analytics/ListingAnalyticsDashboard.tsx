
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Eye, Heart, MessageCircle, TrendingUp, Calendar, Users } from 'lucide-react';
import { useListingAnalytics } from '@/hooks/useListingAnalytics';
import { useEnhancedListings } from '@/hooks/useEnhancedListings';

const ListingAnalyticsDashboard = () => {
  const [selectedListing, setSelectedListing] = useState<string>('');
  const [timeRange, setTimeRange] = useState('30d');
  const [analytics, setAnalytics] = useState<any>(null);
  
  const { getListingAnalytics, loading } = useListingAnalytics();
  const { listings } = useEnhancedListings();

  useEffect(() => {
    if (selectedListing) {
      loadAnalytics();
    }
  }, [selectedListing, timeRange]);

  const loadAnalytics = async () => {
    if (selectedListing) {
      const data = await getListingAnalytics(selectedListing);
      setAnalytics(data);
    }
  };

  const MetricCard = ({ title, value, change, icon: Icon, trend }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <p className={`text-xs ${trend === 'up' ? 'text-green-600' : 'text-red-600'} flex items-center`}>
                <TrendingUp className="h-3 w-3 mr-1" />
                {change}% from last period
              </p>
            )}
          </div>
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );

  if (!analytics && selectedListing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Listing Analytics</h2>
          <div className="flex gap-4">
            <Select value={selectedListing} onValueChange={setSelectedListing}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select a listing" />
              </SelectTrigger>
              <SelectContent>
                {listings.map((listing) => (
                  <SelectItem key={listing.id} value={listing.id}>
                    {listing.dog_name} - {listing.breed}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 days</SelectItem>
                <SelectItem value="30d">30 days</SelectItem>
                <SelectItem value="90d">90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Listing Analytics</h2>
        <div className="flex gap-4">
          <Select value={selectedListing} onValueChange={setSelectedListing}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select a listing" />
            </SelectTrigger>
            <SelectContent>
              {listings.map((listing) => (
                <SelectItem key={listing.id} value={listing.id}>
                  {listing.dog_name} - {listing.breed}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 days</SelectItem>
              <SelectItem value="30d">30 days</SelectItem>
              <SelectItem value="90d">90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {analytics && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Views"
              value={analytics.views.toLocaleString()}
              change={12}
              trend="up"
              icon={Eye}
            />
            <MetricCard
              title="Favorites"
              value={analytics.favorites.toLocaleString()}
              change={8}
              trend="up"
              icon={Heart}
            />
            <MetricCard
              title="Inquiries"
              value={analytics.inquiries.toLocaleString()}
              change={-3}
              trend="down"
              icon={MessageCircle}
            />
            <MetricCard
              title="Conversion Rate"
              value={`${analytics.conversionRate.toFixed(1)}%`}
              change={5}
              trend="up"
              icon={Users}
            />
          </div>

          {/* Charts */}
          <Tabs defaultValue="views" className="space-y-4">
            <TabsList>
              <TabsTrigger value="views">Views Over Time</TabsTrigger>
              <TabsTrigger value="engagement">Engagement</TabsTrigger>
              <TabsTrigger value="referrers">Top Referrers</TabsTrigger>
            </TabsList>
            
            <TabsContent value="views" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Views</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.viewsByDay}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="views" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="engagement" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Engagement Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Average Time on Listing</span>
                      <Badge variant="secondary">{analytics.avgTimeOnListing}s</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Favorite Rate</span>
                      <Badge variant="secondary">
                        {((analytics.favorites / analytics.views) * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="referrers" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Traffic Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.topReferrers.map((referrer: string, index: number) => (
                      <div key={referrer} className="flex justify-between items-center">
                        <span>{referrer}</span>
                        <Badge variant="outline">{Math.max(0, 100 - index * 30)}%</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default ListingAnalyticsDashboard;
