import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import AdminReportsPanel from '@/components/admin/AdminReportsPanel';
import { logAdminAction } from '@/utils/logger';
import { Shield, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const AdminReportsPage = () => {
  const { user, loading, profile } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Check if user is not authenticated or not an admin
    if (!loading && (!user || !profile?.is_admin)) {
      console.log('Unauthorized access attempt to admin reports page');
      setLocation('/'); // Redirect to home page
    }
  }, [user, loading, profile, setLocation]);

  useEffect(() => {
    // Log page access for monitoring (only if admin)
    if (!loading && user && profile?.is_admin) {
      logAdminAction('Admin accessed reports panel', {
        page: '/admin/reports',
        timestamp: new Date().toISOString(),
        adminUser: user.id
      });
    }
  }, [user, loading, profile]);

  // Show loading while authentication is being checked
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

  // Show unauthorized message if user is not admin (this should rarely show due to redirect)
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

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminReportsPanel />
    </div>
  );
};

export default AdminReportsPage;