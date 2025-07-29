import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Navigation, 
  Clock, 
  MousePointer, 
  Eye,
  BarChart3,
  Timer,
  Route,
  Monitor
} from 'lucide-react';
import { 
  logAdminPageView,
  logAdminSectionSwitch,
  logAdminMetricsAccess,
  getSectionFromRoute,
  getSubsectionFromRoute,
  getAdminSessionId,
  AdminPageTimeTracker
} from '@/utils/adminPageTracker';
import { useAdminPageTracking } from '@/hooks/useAdminPageTracking';
import { toast } from '@/hooks/use-toast';

const AdminPageTrackingTestPage = () => {
  const [testResults, setTestResults] = useState<Array<{id: string, type: string, status: 'success' | 'error', message: string}>>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const { getCurrentTimeSpent } = useAdminPageTracking('Page Tracking Test');
  const timeTracker = AdminPageTimeTracker.getInstance();

  // Update current time spent every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTimeSpent());
    }, 1000);

    return () => clearInterval(interval);
  }, [getCurrentTimeSpent]);

  const addTestResult = (type: string, status: 'success' | 'error', message: string) => {
    const result = {
      id: Date.now().toString(),
      type,
      status,
      message
    };
    setTestResults(prev => [result, ...prev]);
  };

  const testPageView = async () => {
    try {
      await logAdminPageView({
        route: '/admin/test-navigation',
        section: 'Test Navigation Section',
        subsection: 'Page View Testing',
        previousRoute: '/admin/dashboard'
      });
      
      addTestResult('Page View', 'success', 'Successfully logged admin page view with metadata');
      toast({ title: "Page View Logged", description: "Navigation event recorded" });
    } catch (error) {
      addTestResult('Page View', 'error', `Failed: ${error}`);
    }
  };

  const testSectionSwitch = async () => {
    try {
      await logAdminSectionSwitch(
        '/admin/reports',
        '/admin/logs',
        45 // 45 seconds spent on reports
      );
      
      addTestResult('Section Switch', 'success', 'Successfully logged admin section switch');
      toast({ title: "Section Switch Logged", description: "Navigation change recorded" });
    } catch (error) {
      addTestResult('Section Switch', 'error', `Failed: ${error}`);
    }
  };

  const testMetricsAccess = async () => {
    try {
      await logAdminMetricsAccess(
        'user_activity_reports',
        { dateRange: 'last_30_days', category: 'moderation' },
        'Last 30 Days'
      );
      
      addTestResult('Metrics Access', 'success', 'Successfully logged admin metrics access');
      toast({ title: "Metrics Access Logged", description: "Dashboard interaction recorded" });
    } catch (error) {
      addTestResult('Metrics Access', 'error', `Failed: ${error}`);
    }
  };

  const testSectionDetection = () => {
    const testRoutes = [
      '/admin',
      '/admin/reports',
      '/admin/reports/user',
      '/admin/logs',
      '/admin/logs/system',
      '/admin/settings',
      '/admin/unknown-route'
    ];

    testRoutes.forEach(route => {
      const section = getSectionFromRoute(route);
      const subsection = getSubsectionFromRoute(route);
      
      addTestResult('Route Detection', 'success', 
        `${route} → ${section}${subsection ? ` → ${subsection}` : ''}`);
    });

    toast({ title: "Route Detection Test", description: "All route mappings tested" });
  };

  const runAllTests = async () => {
    setTestResults([]);
    await testPageView();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testSectionSwitch();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testMetricsAccess();
    await new Promise(resolve => setTimeout(resolve, 500));
    testSectionDetection();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Navigation className="w-8 h-8 text-indigo-600" />
        <h1 className="text-3xl font-bold">Admin Page Tracking Test</h1>
        <Badge variant="outline" className="ml-2">Testing Environment</Badge>
      </div>

      {/* Current Session Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="w-5 h-5" />
            Current Session Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{currentTime}s</div>
            <p className="text-sm text-muted-foreground">Time on Page</p>
          </div>
          <div className="text-center">
            <div className="text-lg font-mono text-green-600">{getAdminSessionId().slice(-8)}</div>
            <p className="text-sm text-muted-foreground">Session ID</p>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-purple-600">Page Tracking Test</div>
            <p className="text-sm text-muted-foreground">Current Section</p>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-orange-600">{window.innerWidth}x{window.innerHeight}</div>
            <p className="text-sm text-muted-foreground">Viewport</p>
          </div>
        </CardContent>
      </Card>

      {/* Individual Test Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Eye className="w-5 h-5 text-blue-600" />
              Page View Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Test logging of admin page views with comprehensive metadata.
            </p>
            <Button onClick={testPageView} variant="outline" className="w-full">
              Test Page View
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Route className="w-5 h-5 text-green-600" />
              Section Switching
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Test logging of navigation between admin sections with time tracking.
            </p>
            <Button onClick={testSectionSwitch} variant="outline" className="w-full">
              Test Section Switch
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Metrics Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Test logging of admin dashboard and metrics access patterns.
            </p>
            <Button onClick={testMetricsAccess} variant="outline" className="w-full">
              Test Metrics Access
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Monitor className="w-5 h-5 text-orange-600" />
              Route Detection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Test automatic section and subsection detection from routes.
            </p>
            <Button onClick={testSectionDetection} variant="outline" className="w-full">
              Test Route Detection
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Run All Tests */}
      <Card>
        <CardContent className="p-6">
          <Button onClick={runAllTests} className="w-full" size="lg">
            <Navigation className="w-5 h-5 mr-2" />
            Run All Navigation Tests
          </Button>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {testResults.map((result) => (
              <div key={result.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={result.status === 'success' ? 'default' : 'destructive'}
                    className="min-w-fit"
                  >
                    {result.status === 'success' ? '✓' : '✗'} {result.status}
                  </Badge>
                  <span className="font-medium">{result.type}</span>
                </div>
                <span className="text-sm text-muted-foreground">{result.message}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Navigation Tracking Features */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Navigation Tracking Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Page View Tracking
              </h4>
              <p className="text-sm text-muted-foreground">
                ADMIN_PAGE_VIEW events with route, section, subsection, viewport, and session metadata.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Route className="w-4 h-4" />
                Section Switching
              </h4>
              <p className="text-sm text-muted-foreground">
                ADMIN_SECTION_SWITCH events tracking navigation patterns and time spent per section.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Time Tracking
              </h4>
              <p className="text-sm text-muted-foreground">
                Automatic time tracking per page with session-based time spent calculations.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Metrics Access
              </h4>
              <p className="text-sm text-muted-foreground">
                ADMIN_METRICS_ACCESS events for dashboard interactions, filters, and data access patterns.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Verify Admin Page Tracking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">1. Supabase Database</h4>
              <p className="text-sm text-muted-foreground">
                Check admin_logs table for ADMIN_PAGE_VIEW, ADMIN_SECTION_SWITCH, and ADMIN_METRICS_ACCESS events.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">2. Navigation Patterns</h4>
              <p className="text-sm text-muted-foreground">
                View admin navigation flow, section popularity, and time spent analytics.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">3. Session Tracking</h4>
              <p className="text-sm text-muted-foreground">
                Session IDs link navigation events for comprehensive admin workflow analysis.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">4. Automatic Integration</h4>
              <p className="text-sm text-muted-foreground">
                useAdminPageTracking hook automatically logs all admin page interactions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPageTrackingTestPage;