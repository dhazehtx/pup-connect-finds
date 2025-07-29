import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Filter, 
  Shield, 
  Database, 
  Search, 
  Users, 
  FileText,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { 
  logAdminFilterAction, 
  logAdminModerationAction, 
  logAdminDataOperation,
  logAdminSearchAction,
  logAdminBulkAction,
  logAdminReportResolution
} from '@/utils/adminActionLogger';
import { toast } from '@/hooks/use-toast';

const AdminActionTestPage = () => {
  const [testResults, setTestResults] = useState<Array<{id: string, type: string, status: 'success' | 'error', message: string}>>([]);

  const addTestResult = (type: string, status: 'success' | 'error', message: string) => {
    const result = {
      id: Date.now().toString(),
      type,
      status,
      message
    };
    setTestResults(prev => [result, ...prev]);
  };

  const testFilterAction = async () => {
    try {
      await logAdminFilterAction({
        filterType: 'user_reports',
        filters: {
          status: 'pending',
          severity: 'high',
          type: 'harassment',
          dateRange: 'last_7_days'
        },
        resultCount: 15,
        appliedAt: new Date().toISOString(),
        pageContext: 'AdminActionTestPage'
      });
      
      addTestResult('Filter Action', 'success', 'Successfully logged filter action for user reports');
      toast({ title: "Filter Action Logged", description: "Check admin logs to verify" });
    } catch (error) {
      addTestResult('Filter Action', 'error', `Failed: ${error}`);
    }
  };

  const testModerationAction = async () => {
    try {
      await logAdminModerationAction({
        actionType: 'ban',
        targetType: 'user',
        targetId: 'test-user-123',
        reason: 'Repeated harassment and spam behavior',
        severity: 'high',
        additionalData: {
          banDuration: '30_days',
          previousWarnings: 3,
          reportCount: 12
        }
      });
      
      addTestResult('Moderation Action', 'success', 'Successfully logged moderation action (ban user)');
      toast({ title: "Moderation Action Logged", description: "User ban action recorded" });
    } catch (error) {
      addTestResult('Moderation Action', 'error', `Failed: ${error}`);
    }
  };

  const testDataOperation = async () => {
    try {
      await logAdminDataOperation({
        operation: 'bulk_update',
        entityType: 'listings',
        changeCount: 25,
        affectedFields: ['status', 'visibility', 'featured'],
        oldValues: { status: 'pending', visibility: 'hidden' },
        newValues: { status: 'approved', visibility: 'public' }
      });
      
      addTestResult('Data Operation', 'success', 'Successfully logged bulk update operation');
      toast({ title: "Data Operation Logged", description: "Bulk listing update recorded" });
    } catch (error) {
      addTestResult('Data Operation', 'error', `Failed: ${error}`);
    }
  };

  const testSearchAction = async () => {
    try {
      await logAdminSearchAction(
        'suspicious listing patterns',
        'fraud_detection',
        8,
        'AdminActionTestPage'
      );
      
      addTestResult('Search Action', 'success', 'Successfully logged search action');
      toast({ title: "Search Action Logged", description: "Fraud detection search recorded" });
    } catch (error) {
      addTestResult('Search Action', 'error', `Failed: ${error}`);
    }
  };

  const testBulkAction = async () => {
    try {
      await logAdminBulkAction(
        'approve',
        'reports',
        ['report-1', 'report-2', 'report-3', 'report-4', 'report-5'],
        4,
        1
      );
      
      addTestResult('Bulk Action', 'success', 'Successfully logged bulk approval action');
      toast({ title: "Bulk Action Logged", description: "Bulk report approval recorded" });
    } catch (error) {
      addTestResult('Bulk Action', 'error', `Failed: ${error}`);
    }
  };

  const testReportResolution = async () => {
    try {
      await logAdminReportResolution(
        'report-harassment-456',
        'resolved_with_action',
        'User warned and content removed. Monitoring for repeated behavior.'
      );
      
      addTestResult('Report Resolution', 'success', 'Successfully logged report resolution');
      toast({ title: "Report Resolution Logged", description: "Harassment report resolution recorded" });
    } catch (error) {
      addTestResult('Report Resolution', 'error', `Failed: ${error}`);
    }
  };

  const runAllTests = async () => {
    setTestResults([]);
    await testFilterAction();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testModerationAction();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testDataOperation();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testSearchAction();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testBulkAction();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testReportResolution();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Admin Action Logging Test</h1>
        <Badge variant="outline" className="ml-2">Testing Environment</Badge>
      </div>

      {/* Individual Test Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="w-5 h-5 text-yellow-600" />
              Filter Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Test logging of filter applications and search refinements.
            </p>
            <Button onClick={testFilterAction} variant="outline" className="w-full">
              Test Filter Logging
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Moderation Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Test logging of user bans, warnings, and content moderation.
            </p>
            <Button onClick={testModerationAction} variant="outline" className="w-full">
              Test Moderation Logging
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="w-5 h-5 text-green-600" />
              Data Operations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Test logging of database operations and bulk changes.
            </p>
            <Button onClick={testDataOperation} variant="outline" className="w-full">
              Test Data Logging
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Search className="w-5 h-5 text-indigo-600" />
              Search Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Test logging of admin searches and query operations.
            </p>
            <Button onClick={testSearchAction} variant="outline" className="w-full">
              Test Search Logging
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5 text-orange-600" />
              Bulk Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Test logging of bulk operations on multiple items.
            </p>
            <Button onClick={testBulkAction} variant="outline" className="w-full">
              Test Bulk Logging
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5 text-pink-600" />
              Report Resolutions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Test logging of report handling and resolution decisions.
            </p>
            <Button onClick={testReportResolution} variant="outline" className="w-full">
              Test Resolution Logging
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Run All Tests */}
      <Card>
        <CardContent className="p-6">
          <Button onClick={runAllTests} className="w-full" size="lg">
            <CheckCircle className="w-5 h-5 mr-2" />
            Run All Tests
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
                    {result.status === 'success' ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                    {result.status}
                  </Badge>
                  <span className="font-medium">{result.type}</span>
                </div>
                <span className="text-sm text-muted-foreground">{result.message}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Verify Admin Action Logging</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">1. Supabase Database</h4>
              <p className="text-sm text-muted-foreground">
                Check the admin_logs table for entries with event_type values: FILTER_ACTION, MODERATION_ACTION, DATA_OPERATION, etc.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">2. Admin Logs Interface</h4>
              <p className="text-sm text-muted-foreground">
                Navigate to Admin Logs → Filter by action type to see logged admin activities.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">3. Browser Console</h4>
              <p className="text-sm text-muted-foreground">
                Open dev tools console to see real-time logging with detailed metadata.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">4. Event Details</h4>
              <p className="text-sm text-muted-foreground">
                Each log entry includes comprehensive metadata about the admin action performed.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminActionTestPage;