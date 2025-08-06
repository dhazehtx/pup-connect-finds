import React from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminPageTracking } from '@/hooks/useAdminPageTracking';
import { Shield, FileText, Users, BarChart3, Settings, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const AdminDashboard = () => {
  const { user, loading, profile } = useAuth();
  const [, setLocation] = useLocation();
  
  // Track admin page navigation and time spent
  useAdminPageTracking('Admin Dashboard');

  // Redirect if not admin
  React.useEffect(() => {
    if (!loading && (!user || !profile?.is_admin)) {
      console.log('Unauthorized access attempt to admin dashboard');
      setLocation('/');
    }
  }, [user, loading, profile, setLocation]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Redirect unauthorized users
  if (!user || !profile?.is_admin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-800 mb-2">Access Denied</h1>
            <p className="text-red-600 mb-4">
              You don't have administrator privileges to access this page.
            </p>
            <p className="text-sm text-gray-600">
              Redirecting to home page...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const adminModules = [
    {
      title: 'User Reports & Moderation',
      description: 'Review and moderate user reports, manage user accounts, and handle safety issues',
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      path: '/admin/reports',
      color: 'border-blue-200 hover:border-blue-400 bg-blue-50 hover:bg-blue-100'
    },
    {
      title: 'System Logs',
      description: 'Monitor application logs, track errors, and analyze system performance',
      icon: <FileText className="w-8 h-8 text-green-600" />,
      path: '/admin/logs',
      color: 'border-green-200 hover:border-green-400 bg-green-50 hover:bg-green-100'
    },
    {
      title: 'User Management',
      description: 'Manage user accounts, permissions, and profile verification',
      icon: <Users className="w-8 h-8 text-purple-600" />,
      path: '/admin/users',
      color: 'border-purple-200 hover:border-purple-400 bg-purple-50 hover:bg-purple-100'
    },
    {
      title: 'Analytics Dashboard',
      description: 'View platform statistics, user metrics, and performance insights',
      icon: <BarChart3 className="w-8 h-8 text-orange-600" />,
      path: '/admin/analytics',
      color: 'border-orange-200 hover:border-orange-400 bg-orange-50 hover:bg-orange-100'
    },
    {
      title: 'Store Management',
      description: 'Manage products, inventory, pricing, and monitor store performance',
      icon: <BarChart3 className="w-8 h-8 text-indigo-600" />,
      path: '/admin/store',
      color: 'border-indigo-200 hover:border-indigo-400 bg-indigo-50 hover:bg-indigo-100'
    },
    {
      title: 'Platform Settings',
      description: 'Configure system settings, rate limits, and platform parameters',
      icon: <Settings className="w-8 h-8 text-gray-600" />,
      path: '/admin/settings',
      color: 'border-gray-200 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-10 h-10 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {profile?.full_name || profile?.username}</p>
            </div>
          </div>
          <div className="bg-blue-100 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              <strong>Security Notice:</strong> You have administrative privileges. Please use these tools responsibly.
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">1,234</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Reports</p>
                  <p className="text-2xl font-bold text-yellow-600">0</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">System Health</p>
                  <p className="text-2xl font-bold text-green-600">Healthy</p>
                </div>
                <BarChart3 className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Listings</p>
                  <p className="text-2xl font-bold text-gray-900">456</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminModules.map((module, index) => (
            <Link key={index} href={module.path}>
              <Card className={`cursor-pointer transition-all duration-200 ${module.color} border-2`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    {module.icon}
                    <span className="text-gray-900">{module.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {module.description}
                  </p>
                  <div className="mt-4">
                    <Button variant="outline" size="sm" className="w-full">
                      Access Module
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            MY PUP Admin Dashboard • Last updated: {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;