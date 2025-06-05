
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, TrendingUp, Users, Calendar } from 'lucide-react';
import { UserProfile } from '@/types/profile';
import AdvancedAnalytics from './AdvancedAnalytics';

interface ProfileAnalyticsEnhancedProps {
  profile: UserProfile;
}

const ProfileAnalyticsEnhanced = ({ profile }: ProfileAnalyticsEnhancedProps) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [activeView, setActiveView] = useState<'overview' | 'detailed'>('overview');

  const quickStats = [
    {
      title: 'Total Views',
      value: profile.stats?.totalViews?.toLocaleString() || '0',
      change: '+12%',
      icon: <Users className="h-4 w-4" />
    },
    {
      title: 'Profile Rating',
      value: profile.rating?.toFixed(1) || '0.0',
      change: '+0.2',
      icon: <TrendingUp className="h-4 w-4" />
    },
    {
      title: 'Total Reviews',
      value: profile.total_reviews?.toString() || '0',
      change: '+3',
      icon: <BarChart3 className="h-4 w-4" />
    },
    {
      title: 'Experience',
      value: `${profile.years_experience || 0} years`,
      change: 'verified',
      icon: <Calendar className="h-4 w-4" />
    }
  ];

  return (
    <div className="space-y-6 p-4">
      {/* Header Controls */}
      <div className="flex flex-col space-y-4">
        <div>
          <h2 className="text-2xl font-bold">Profile Analytics</h2>
          <p className="text-gray-600">Track your profile performance and engagement</p>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-2">
            <Button
              variant={activeView === 'overview' ? 'default' : 'outline'}
              onClick={() => setActiveView('overview')}
              className="rounded-md"
            >
              Overview
            </Button>
            <Button
              variant={activeView === 'detailed' ? 'default' : 'outline'}
              onClick={() => setActiveView('detailed')}
              className="rounded-md"
            >
              Detailed
            </Button>
          </div>
          
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {stat.icon}
                  <span className="text-sm font-medium text-gray-600">{stat.title}</span>
                </div>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold">{stat.value}</span>
                <span className="ml-2 text-sm text-green-600">{stat.change}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Analytics Content */}
      {activeView === 'overview' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Completion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Basic Info</span>
                  <span className="text-green-600">✓ Complete</span>
                </div>
                <div className="flex justify-between">
                  <span>Profile Photo</span>
                  <span className="text-green-600">✓ Complete</span>
                </div>
                <div className="flex justify-between">
                  <span>Verification</span>
                  <span className={profile.verified ? "text-green-600" : "text-gray-600"}>
                    {profile.verified ? "✓ Verified" : "⚠ Pending"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Bio & Experience</span>
                  <span className="text-green-600">✓ Complete</span>
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
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-500" />
                  <span className="text-sm">Profile viewed 15 times today</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm">New review received</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-500" />
                  <span className="text-sm">Contact information requested 3 times</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-500" />
                  <span className="text-sm">Profile shared 2 times</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <AdvancedAnalytics profile={profile} />
      )}
    </div>
  );
};

export default ProfileAnalyticsEnhanced;
