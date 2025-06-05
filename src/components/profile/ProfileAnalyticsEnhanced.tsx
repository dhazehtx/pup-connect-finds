
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, TrendingUp, Users, Calendar, Eye, Heart, MessageCircle, Share } from 'lucide-react';
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
      title: 'Profile Views',
      value: profile.stats?.totalViews?.toLocaleString() || '2,547',
      change: '+12%',
      icon: <Eye className="h-5 w-5" />,
      color: 'text-blue-600'
    },
    {
      title: 'Likes',
      value: '1,243',
      change: '+8%',
      icon: <Heart className="h-5 w-5" />,
      color: 'text-red-500'
    },
    {
      title: 'Comments',
      value: '324',
      change: '+15%',
      icon: <MessageCircle className="h-5 w-5" />,
      color: 'text-green-600'
    },
    {
      title: 'Shares',
      value: '89',
      change: '+5%',
      icon: <Share className="h-5 w-5" />,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900">Insights</h1>
            <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
              <SelectTrigger className="w-32 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">7 days</SelectItem>
                <SelectItem value="month">30 days</SelectItem>
                <SelectItem value="year">1 year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveView('overview')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all ${
                activeView === 'overview'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveView('detailed')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all ${
                activeView === 'detailed'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              Detailed
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pb-20">
        {activeView === 'overview' ? (
          <div className="space-y-6 py-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              {quickStats.map((stat, index) => (
                <Card key={index} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`${stat.color}`}>
                        {stat.icon}
                      </div>
                      <span className="text-xs text-green-600 font-medium">{stat.change}</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-xs text-gray-600">{stat.title}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Profile Performance */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Profile Performance</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Profile Visits</p>
                        <p className="text-sm text-gray-600">+12% from last week</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-gray-900">2,547</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Engagement Rate</p>
                        <p className="text-sm text-gray-600">Above average</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-gray-900">8.4%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-sm text-gray-700">Profile viewed 47 times today</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm text-gray-700">3 new followers this week</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    <span className="text-sm text-gray-700">Post shared 8 times</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-sm text-gray-700">12 new likes on recent posts</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Completion */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Profile Strength</h3>
                  <span className="text-sm font-medium text-green-600">85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Basic Info</span>
                    <span className="text-green-600">✓</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Profile Photo</span>
                    <span className="text-green-600">✓</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Verification</span>
                    <span className={profile.verified ? "text-green-600" : "text-orange-500"}>
                      {profile.verified ? "✓" : "⚠"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="py-6">
            <AdvancedAnalytics profile={profile} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileAnalyticsEnhanced;
