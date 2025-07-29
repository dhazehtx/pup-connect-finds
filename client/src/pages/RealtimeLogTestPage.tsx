import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Radio, 
  Activity, 
  Database, 
  Wifi,
  Bell,
  Play,
  Pause,
  TestTube,
  Zap,
  Eye
} from 'lucide-react';
import RealtimeAdminLogPanel from '@/components/admin/RealtimeAdminLogPanel';
import { logToSupabase } from '@/utils/logToSupabase';
import { logAdminAction } from '@/utils/logger';
import { toast } from '@/hooks/use-toast';

const RealtimeLogTestPage = () => {
  const [testResults, setTestResults] = useState<Array<{id: string, type: string, status: 'success' | 'error', message: string}>>([]);
  const [isGeneratingLogs, setIsGeneratingLogs] = useState(false);

  const addTestResult = (type: string, status: 'success' | 'error', message: string) => {
    const result = {
      id: Date.now().toString(),
      type,
      status,
      message
    };
    setTestResults(prev => [result, ...prev]);
  };

  // Generate test logs for realtime demonstration
  const generateTestLog = async (eventType: string, delay: number = 0) => {
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    const testLogs = {
      'ADMIN_PAGE_VIEW': {
        action: `Test Page View - ${new Date().toLocaleTimeString()}`,
        event_type: 'ADMIN_PAGE_VIEW',
        event_detail: 'Admin visited Reports & Moderation section',
        category: 'navigation',
        level: 'info'
      },
      'REPORT_RESOLUTION': {
        action: `Test Report Resolution - ${new Date().toLocaleTimeString()}`,
        event_type: 'REPORT_RESOLUTION',
        event_detail: 'Resolved user report #456 - Warning issued',
        category: 'moderation',
        level: 'warn'
      },
      'MODERATION_ACTION': {
        action: `Test Moderation Action - ${new Date().toLocaleTimeString()}`,
        event_type: 'MODERATION_ACTION',
        event_detail: 'User banned for policy violation',
        category: 'security',
        level: 'critical'
      },
      'DATA_OPERATION': {
        action: `Test Data Operation - ${new Date().toLocaleTimeString()}`,
        event_type: 'DATA_OPERATION',
        event_detail: 'Bulk update of 25 user records',
        category: 'data',
        level: 'info'
      },
      'ADMIN_METRICS_ACCESS': {
        action: `Test Metrics Access - ${new Date().toLocaleTimeString()}`,
        event_type: 'ADMIN_METRICS_ACCESS',
        event_detail: 'Accessed analytics dashboard - user growth metrics',
        category: 'analytics',
        level: 'info'
      }
    };

    const logData = testLogs[eventType as keyof typeof testLogs];
    
    try {
      await logToSupabase(logData.action, {
        event_type: logData.event_type,
        event_detail: logData.event_detail,
        category: logData.category,
        level: logData.level,
        realtime_test: true,
        timestamp: new Date().toISOString()
      });

      addTestResult('Log Generation', 'success', `Generated ${eventType} log`);
      return true;
    } catch (error) {
      addTestResult('Log Generation', 'error', `Failed to generate ${eventType}: ${error}`);
      return false;
    }
  };

  // Test single log generation
  const testSingleLog = async (eventType: string) => {
    await generateTestLog(eventType);
    toast({
      title: "Test Log Generated",
      description: `Created ${eventType} event for realtime testing`
    });
  };

  // Test rapid log generation
  const testRapidLogs = async () => {
    setIsGeneratingLogs(true);
    
    try {
      const eventTypes = [
        'ADMIN_PAGE_VIEW',
        'REPORT_RESOLUTION', 
        'MODERATION_ACTION',
        'DATA_OPERATION',
        'ADMIN_METRICS_ACCESS'
      ];

      addTestResult('Rapid Test', 'success', 'Starting rapid log generation sequence...');

      for (let i = 0; i < eventTypes.length; i++) {
        await generateTestLog(eventTypes[i], i * 1000); // 1 second intervals
      }

      addTestResult('Rapid Test', 'success', 'Completed rapid log generation sequence');
      toast({
        title: "Rapid Test Complete",
        description: "Generated 5 logs with 1-second intervals"
      });
    } catch (error) {
      addTestResult('Rapid Test', 'error', `Rapid test failed: ${error}`);
    } finally {
      setIsGeneratingLogs(false);
    }
  };

  // Test continuous log stream
  const testContinuousStream = async () => {
    setIsGeneratingLogs(true);
    
    try {
      const eventTypes = ['ADMIN_PAGE_VIEW', 'REPORT_RESOLUTION', 'MODERATION_ACTION'];
      
      addTestResult('Stream Test', 'success', 'Starting continuous log stream...');

      for (let i = 0; i < 10; i++) {
        const eventType = eventTypes[i % eventTypes.length];
        await generateTestLog(eventType, 500); // 500ms intervals
      }

      addTestResult('Stream Test', 'success', 'Completed continuous stream test');
      toast({
        title: "Stream Test Complete",
        description: "Generated 10 logs with 500ms intervals"
      });
    } catch (error) {
      addTestResult('Stream Test', 'error', `Stream test failed: ${error}`);
    } finally {
      setIsGeneratingLogs(false);
    }
  };

  // Test critical event
  const testCriticalEvent = async () => {
    await logToSupabase('CRITICAL: Emergency system override detected', {
      event_type: 'SECURITY_ALERT',
      event_detail: 'Unauthorized admin action attempt blocked',
      category: 'security',
      level: 'critical',
      severity: 'emergency',
      realtime_test: true,
      timestamp: new Date().toISOString()
    });

    addTestResult('Critical Alert', 'success', 'Generated critical security alert');
    toast({
      title: "Critical Alert Generated",
      description: "High-priority security event created",
      variant: "destructive"
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Radio className="w-8 h-8 text-green-600" />
        <h1 className="text-3xl font-bold">Real-time Admin Logs Test</h1>
        <Badge variant="outline" className="ml-2">Live Testing</Badge>
      </div>

      {/* Test Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="w-5 h-5 text-blue-600" />
              Single Event Tests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              onClick={() => testSingleLog('ADMIN_PAGE_VIEW')} 
              variant="outline" 
              size="sm" 
              className="w-full"
            >
              Page View
            </Button>
            <Button 
              onClick={() => testSingleLog('REPORT_RESOLUTION')} 
              variant="outline" 
              size="sm" 
              className="w-full"
            >
              Report Resolution
            </Button>
            <Button 
              onClick={() => testSingleLog('MODERATION_ACTION')} 
              variant="outline" 
              size="sm" 
              className="w-full"
            >
              Moderation Action
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="w-5 h-5 text-yellow-600" />
              Stress Tests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              onClick={testRapidLogs}
              disabled={isGeneratingLogs}
              variant="outline" 
              className="w-full"
            >
              {isGeneratingLogs ? 'Generating...' : 'Rapid Sequence'}
            </Button>
            <Button 
              onClick={testContinuousStream}
              disabled={isGeneratingLogs}
              variant="outline" 
              className="w-full"
            >
              {isGeneratingLogs ? 'Streaming...' : 'Continuous Stream'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="w-5 h-5 text-red-600" />
              Special Events
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              onClick={testCriticalEvent}
              variant="destructive"
              size="sm" 
              className="w-full"
            >
              Critical Alert
            </Button>
            <Button 
              onClick={() => testSingleLog('DATA_OPERATION')}
              variant="outline" 
              size="sm" 
              className="w-full"
            >
              Data Operation
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Realtime Panel Integration */}
      <Card>
        <CardHeader>
          <CardTitle>Live Admin Log Panel</CardTitle>
        </CardHeader>
        <CardContent>
          <RealtimeAdminLogPanel maxHeight="500px" />
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

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Real-time Admin Logging Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Wifi className="w-4 h-4" />
                Live Updates
              </h4>
              <p className="text-sm text-muted-foreground">
                Automatic real-time updates using Supabase Realtime subscriptions.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Visual Indicators
              </h4>
              <p className="text-sm text-muted-foreground">
                New entries highlighted with fade animations and visual badges.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Pause className="w-4 h-4" />
                Pause & Resume
              </h4>
              <p className="text-sm text-muted-foreground">
                Ability to pause updates for focus, with missed log counter.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Smart Notifications
              </h4>
              <p className="text-sm text-muted-foreground">
                Configurable toast notifications for new admin actions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Test Real-time Admin Logging</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">1. Single Events</h4>
              <p className="text-sm text-muted-foreground">
                Click individual event buttons to see real-time log updates with highlighting.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">2. Stress Testing</h4>
              <p className="text-sm text-muted-foreground">
                Use rapid sequence or continuous stream to test high-frequency updates.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">3. Pause/Resume</h4>
              <p className="text-sm text-muted-foreground">
                Test the pause functionality and observe missed log counting.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">4. Configuration</h4>
              <p className="text-sm text-muted-foreground">
                Toggle auto-scroll, notifications, and highlighting in the settings panel.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealtimeLogTestPage;