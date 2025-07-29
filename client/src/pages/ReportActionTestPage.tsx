import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Eye, 
  CheckCircle, 
  AlertTriangle, 
  ShieldAlert,
  FileText,
  Users,
  ArrowUp,
  Ban
} from 'lucide-react';
import { 
  logReportView,
  logReportResolution,
  logModerationAction,
  logBulkReportAction,
  logReportEscalation
} from '@/utils/reportActionLogger';
import { toast } from '@/hooks/use-toast';

const ReportActionTestPage = () => {
  const [testResults, setTestResults] = useState<Array<{id: string, type: string, status: 'success' | 'error', message: string}>>([]);
  const [viewDuration, setViewDuration] = useState<number>(0);

  const addTestResult = (type: string, status: 'success' | 'error', message: string) => {
    const result = {
      id: Date.now().toString(),
      type,
      status,
      message
    };
    setTestResults(prev => [result, ...prev]);
  };

  const testReportView = async () => {
    try {
      await logReportView({
        reportId: 'test-report-harassment-001',
        reportType: 'user',
        reportSeverity: 'high',
        reportStatus: 'pending',
        viewDuration: viewDuration || 45,
        accessedFrom: 'ReportActionTestPage'
      });
      
      addTestResult('Report View', 'success', 'Successfully logged report viewing action');
      toast({ title: "Report View Logged", description: "Admin viewed report test-report-harassment-001" });
    } catch (error) {
      addTestResult('Report View', 'error', `Failed: ${error}`);
    }
  };

  const testReportResolution = async () => {
    try {
      await logReportResolution({
        reportId: 'test-report-scam-002',
        reportType: 'listing',
        resolutionType: 'resolved',
        actionTaken: 'removed_listing_warned_user',
        adminNotes: 'Listing contained misleading information about puppy health. User warned and listing removed.',
        previousStatus: 'investigating',
        newStatus: 'resolved',
        resolutionReason: 'Policy violation confirmed'
      });
      
      addTestResult('Report Resolution', 'success', 'Successfully logged report resolution');
      toast({ title: "Report Resolution Logged", description: "Scam listing report resolved" });
    } catch (error) {
      addTestResult('Report Resolution', 'error', `Failed: ${error}`);
    }
  };

  const testModerationAction = async () => {
    try {
      await logModerationAction({
        reportId: 'test-report-harassment-003',
        actionType: 'ban_user',
        targetType: 'user',
        targetId: 'user-bad-actor-456',
        severity: 'critical',
        duration: '30_days',
        reason: 'Repeated harassment of other users, threats of violence',
        additionalNotes: 'Third offense - escalating to 30-day ban. Previous warnings on file.',
        reversible: true
      });
      
      addTestResult('Moderation Action', 'success', 'Successfully logged user ban action');
      toast({ title: "Moderation Action Logged", description: "User ban recorded for 30 days" });
    } catch (error) {
      addTestResult('Moderation Action', 'error', `Failed: ${error}`);
    }
  };

  const testBulkReportAction = async () => {
    try {
      await logBulkReportAction(
        'bulk_dismiss_spam',
        ['report-spam-1', 'report-spam-2', 'report-spam-3', 'report-spam-4', 'report-spam-5'],
        4,
        1,
        'Dismissed clear spam reports from same IP address. One report required individual review.'
      );
      
      addTestResult('Bulk Report Action', 'success', 'Successfully logged bulk report dismissal');
      toast({ title: "Bulk Action Logged", description: "Bulk spam report dismissal recorded" });
    } catch (error) {
      addTestResult('Bulk Report Action', 'error', `Failed: ${error}`);
    }
  };

  const testReportEscalation = async () => {
    try {
      await logReportEscalation(
        'test-report-legal-004',
        'law_enforcement',
        'Credible threats of violence and doxxing',
        'critical',
        'User made specific threats against breeder including address and photos. Local authorities contacted.'
      );
      
      addTestResult('Report Escalation', 'success', 'Successfully logged report escalation to law enforcement');
      toast({ title: "Report Escalated", description: "Critical threat escalated to authorities" });
    } catch (error) {
      addTestResult('Report Escalation', 'error', `Failed: ${error}`);
    }
  };

  const runAllTests = async () => {
    setTestResults([]);
    await testReportView();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testReportResolution();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testModerationAction();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testBulkReportAction();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testReportEscalation();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <ShieldAlert className="w-8 h-8 text-red-600" />
        <h1 className="text-3xl font-bold">Report Action Logging Test</h1>
        <Badge variant="outline" className="ml-2">Testing Environment</Badge>
      </div>

      {/* Individual Test Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Eye className="w-5 h-5 text-blue-600" />
              Report Viewing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Test logging when admins view report details with duration tracking.
            </p>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="View duration (seconds)"
                value={viewDuration}
                onChange={(e) => setViewDuration(parseInt(e.target.value) || 0)}
                className="text-sm"
              />
            </div>
            <Button onClick={testReportView} variant="outline" className="w-full">
              Test Report View
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Report Resolution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Test comprehensive report resolution logging with actions and notes.
            </p>
            <Button onClick={testReportResolution} variant="outline" className="w-full">
              Test Resolution
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Ban className="w-5 h-5 text-red-600" />
              Moderation Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Test logging of moderation actions like bans, warnings, and suspensions.
            </p>
            <Button onClick={testModerationAction} variant="outline" className="w-full">
              Test Moderation
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5 text-purple-600" />
              Bulk Report Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Test logging of bulk operations on multiple reports.
            </p>
            <Button onClick={testBulkReportAction} variant="outline" className="w-full">
              Test Bulk Actions
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ArrowUp className="w-5 h-5 text-orange-600" />
              Report Escalation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Test logging of report escalations to authorities or senior admins.
            </p>
            <Button onClick={testReportEscalation} variant="outline" className="w-full">
              Test Escalation
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Run All Tests */}
      <Card>
        <CardContent className="p-6">
          <Button onClick={runAllTests} className="w-full" size="lg">
            <CheckCircle className="w-5 h-5 mr-2" />
            Run All Report Action Tests
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

      {/* Report Action Types */}
      <Card>
        <CardHeader>
          <CardTitle>Report Action Types Being Tested</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Report Views
              </h4>
              <p className="text-sm text-muted-foreground">
                REPORT_VIEW events with duration, severity, status, and access context tracking.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Report Resolutions
              </h4>
              <p className="text-sm text-muted-foreground">
                REPORT_RESOLUTION events with action taken, admin notes, and status changes.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Ban className="w-4 h-4" />
                Moderation Actions
              </h4>
              <p className="text-sm text-muted-foreground">
                MODERATION_ACTION events for bans, warnings, suspensions with duration and reversibility.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <ArrowUp className="w-4 h-4" />
                Escalations
              </h4>
              <p className="text-sm text-muted-foreground">
                REPORT_ESCALATION events for legal, senior admin, or law enforcement escalations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Verify Report Action Logging</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">1. Supabase Database</h4>
              <p className="text-sm text-muted-foreground">
                Check admin_logs table for REPORT_VIEW, REPORT_RESOLUTION, MODERATION_ACTION, and REPORT_ESCALATION events.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">2. Admin Logs Interface</h4>
              <p className="text-sm text-muted-foreground">
                Filter by "viewed", "resolved", "escalated" action types to see report-specific logging.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">3. Event Details</h4>
              <p className="text-sm text-muted-foreground">
                Each event includes report ID, action type, duration, severity, and comprehensive metadata.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">4. Audit Trail</h4>
              <p className="text-sm text-muted-foreground">
                Complete audit trail of admin decision-making process from view to resolution.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportActionTestPage;