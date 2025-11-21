
import React, { useState } from 'react';
import AdminNavigation from './AdminNavigation';
import UserManagement from './UserManagement';
import ContentModeration from './ContentModeration';
import AdminAnalyticsDashboard from './AdminAnalyticsDashboard';
import TrustSafetyTools from './TrustSafetyTools';
import MessagingOversight from './MessagingOversight';
import PlatformSettings from './PlatformSettings';
import MonetizationDashboard from '@/components/monetization/MonetizationDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  MessageSquare, 
  Shield, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

import { useQuery } from '@tanstack/react-query';

interface AdminStats {
  activeUsers: number;
  totalUsers: number;
  pendingReports: number;
  totalReports: number;
  activeListings: number;
  totalListings: number;
  totalProducts: number;
  totalOrders: number;
  monthlyOrders: number;
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Fetch real dashboard metrics from API
  const { data: metricsData, isLoading } = useQuery<{ ok: boolean; data: AdminStats }>({
    queryKey: ['/api/admin/dashboard/metrics'],
  });
  
  const stats = metricsData?.data;

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagement />;
      case 'content':
        return <ContentModeration />;
      case 'payments':
        return <MonetizationDashboard />;
      case 'analytics':
        return <AdminAnalyticsDashboard />;
      case 'safety':
        return <TrustSafetyTools />;
      case 'messaging':
        return <MessagingOversight />;
      case 'settings':
        return <PlatformSettings />;
      default:
        return (
          <div className="space-y-6">
            {/* Stats Overview */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="animate-pulse space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="h-8 bg-gray-200 rounded w-16"></div>
                        <div className="h-3 bg-gray-200 rounded w-32"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : stats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Users</p>
                        <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                      </div>
                      <Users className="w-8 h-8 text-blue-500" />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {stats.activeUsers} new in last 30 days
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Active Listings</p>
                        <p className="text-2xl font-bold">{stats.activeListings}</p>
                      </div>
                      <MessageSquare className="w-8 h-8 text-green-500" />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {stats.totalListings} total listings
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Store Orders</p>
                        <p className="text-2xl font-bold">{stats.monthlyOrders}</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {stats.totalOrders} total orders
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Pending Reports</p>
                        <p className="text-2xl font-bold">{stats.pendingReports}</p>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-orange-500" />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {stats.totalReports} total reports
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : null}

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      <Users className="w-4 h-4 text-blue-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">New user registration: john@example.com</p>
                        <p className="text-xs text-gray-500">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      <MessageSquare className="w-4 h-4 text-green-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">New listing: Golden Retriever Puppy</p>
                        <p className="text-xs text-gray-500">5 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      <Shield className="w-4 h-4 text-orange-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Verification request from Sarah Wilson</p>
                        <p className="text-xs text-gray-500">10 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Payment completed: $1,200</p>
                        <p className="text-xs text-gray-500">15 minutes ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pending Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex-1">
                        <p className="text-sm font-medium">Review breeder verification documents</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">8 items</Badge>
                          <Badge className="bg-red-100 text-red-800">high priority</Badge>
                        </div>
                      </div>
                      <Clock className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex-1">
                        <p className="text-sm font-medium">Moderate flagged listings</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">3 items</Badge>
                          <Badge className="bg-orange-100 text-orange-800">medium priority</Badge>
                        </div>
                      </div>
                      <Clock className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex-1">
                        <p className="text-sm font-medium">Respond to support tickets</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">12 items</Badge>
                          <Badge className="bg-orange-100 text-orange-800">medium priority</Badge>
                        </div>
                      </div>
                      <Clock className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminNavigation />
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {activeTab === 'overview' && 'Dashboard Overview'}
            {activeTab === 'users' && 'User Management'}
            {activeTab === 'content' && 'Content Moderation'}
            {activeTab === 'payments' && 'Revenue Dashboard'}
            {activeTab === 'analytics' && 'Analytics Dashboard'}
            {activeTab === 'safety' && 'Trust & Safety'}
            {activeTab === 'messaging' && 'Messaging Oversight'}
            {activeTab === 'settings' && 'Platform Settings'}
          </h1>
          <p className="text-gray-600">
            {activeTab === 'overview' && 'Monitor your platform performance and manage critical tasks'}
            {activeTab === 'users' && 'Manage users, verify accounts, and handle user-related issues'}
            {activeTab === 'content' && 'Review reported content and moderate platform activity'}
            {activeTab === 'payments' && 'Track revenue streams and financial performance'}
            {activeTab === 'analytics' && 'View detailed analytics and performance metrics'}
            {activeTab === 'safety' && 'Monitor platform safety and security incidents'}
            {activeTab === 'messaging' && 'Oversee messaging activity and moderation'}
            {activeTab === 'settings' && 'Configure platform settings and preferences'}
          </p>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
