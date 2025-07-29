import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Navigation, ArrowRight, CheckCircle, Database } from 'lucide-react';
import { logAdminAction } from '@/utils/logger';
import { logToSupabase } from '@/utils/logToSupabase';

const NavigationTestPage = () => {
  const navigate = useNavigate();

  const testRoutes = [
    { path: '/admin', label: 'Admin Dashboard', description: 'Main admin page' },
    { path: '/admin/reports', label: 'Reports Panel', description: 'User reports and moderation' },
    { path: '/admin/logs', label: 'Logs Viewer', description: 'System logs and analytics' },
    { path: '/marketplace', label: 'Marketplace', description: 'Public marketplace' },
    { path: '/profile', label: 'Profile', description: 'User profile page' }
  ];

  const handleTestNavigation = (path: string, label: string) => {
    logAdminAction(`Testing navigation to ${label}`, {
      test_navigation: true,
      target_path: path,
      target_label: label
    });
    
    navigate(path);
  };

  const testSupabaseLogging = async () => {
    try {
      const testSuccess = await logToSupabase('Navigation test performed', {
        event_type: 'TEST',
        event_detail: 'Manual test of Supabase logging from NavigationTestPage',
        test_timestamp: new Date().toISOString(),
        test_data: {
          feature: 'navigation_tracking',
          status: 'testing'
        }
      });

      if (testSuccess) {
        logAdminAction('Supabase logging test successful', { test_result: 'success' });
      } else {
        logAdminAction('Supabase logging test failed', { test_result: 'failed' });
      }
    } catch (error) {
      console.error('Supabase test error:', error);
      logAdminAction('Supabase logging test error', { error: error });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Navigation className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Navigation Tracking Test</h1>
        <Badge variant="outline" className="ml-2">Testing Environment</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Navigation Test Routes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="w-5 h-5" />
              Test Navigation Routes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground mb-4">
              Click these buttons to test navigation tracking. Each navigation will be logged to both client-side logger and Supabase.
            </p>
            {testRoutes.map((route, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{route.label}</div>
                  <div className="text-sm text-muted-foreground">{route.description}</div>
                  <div className="text-xs text-gray-500 font-mono">{route.path}</div>
                </div>
                <Button 
                  onClick={() => handleTestNavigation(route.path, route.label)}
                  size="sm"
                  variant="outline"
                >
                  Navigate
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Logging Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Supabase Logging Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Test the Supabase logging integration directly to ensure admin actions are being stored in the database.
            </p>
            
            <Button 
              onClick={testSupabaseLogging}
              className="w-full"
              variant="default"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Test Supabase Logging
            </Button>

            <div className="text-xs text-gray-600 space-y-2">
              <div><strong>What this tests:</strong></div>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Supabase connection and authentication</li>
                <li>RPC function execution (insert_admin_log)</li>
                <li>Event type and event detail logging</li>
                <li>Metadata storage in JSONB format</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Verify Navigation Tracking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">1. Client-Side Logs</h4>
              <p className="text-sm text-muted-foreground">
                Open browser dev tools and check the console. You should see navigation events logged with details.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">2. Supabase Database</h4>
              <p className="text-sm text-muted-foreground">
                Navigate to Admin Logs → Admin Actions tab to see navigation events stored in the database.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">3. Navigation Analytics</h4>
              <p className="text-sm text-muted-foreground">
                Check Admin Logs → Navigation Analytics tab to see path analysis and usage patterns.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">4. Event Types</h4>
              <p className="text-sm text-muted-foreground">
                Look for event_type: 'NAVIGATION' for route changes and 'SESSION_START' for initial loads.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NavigationTestPage;