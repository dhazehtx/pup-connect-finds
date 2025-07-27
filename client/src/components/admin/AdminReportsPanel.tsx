import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Flag, 
  RefreshCw, 
  Eye, 
  CheckCircle, 
  XCircle, 
  User, 
  Package, 
  Calendar,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { logAdminAction, logApiError, logUIAction } from '@/utils/logger';
import { logToSupabase, useAdminLogger } from '@/utils/logToSupabase';

interface Report {
  id: string;
  type: 'user' | 'listing';
  reporter_username: string;
  reported_username: string;
  listing_title?: string;
  reason: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  admin_notes?: string;
  action_taken?: string;
  created_at: string;
  updated_at: string;
}

interface ReportStats {
  totalReports: number;
  userReports: number;
  listingReports: number;
  pendingReports: number;
  highSeverityPending: number;
}

interface ReportConfig {
  actionTypes: Array<{ value: string; label: string }>;
}

const AdminReportsPanel = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [config, setConfig] = useState<ReportConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  
  // Form states for resolving reports
  const [resolveStatus, setResolveStatus] = useState<'resolved' | 'dismissed'>('resolved');
  const [actionTaken, setActionTaken] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    severity: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    logAdminAction('AdminReportsPanel mounted', { component: 'AdminReportsPanel' });
    logToSupabase('Visited Reports Dashboard', { 
      page: '/admin/reports',
      timestamp: new Date().toISOString() 
    });
    loadConfig();
    loadReports();
    loadStats();
  }, []);

  const loadConfig = async () => {
    try {
      logAdminAction('Loading report config', { endpoint: '/api/reports/config' });
      const response = await fetch('/api/reports/config');
      const data = await response.json();
      if (data.success) {
        setConfig(data.config);
        logAdminAction('Report config loaded successfully', { configKeys: Object.keys(data.config) });
      } else {
        logApiError('Failed to load config', data.error || 'Unknown error');
      }
    } catch (error) {
      logApiError('Failed to load config', error, { endpoint: '/api/reports/config' });
      console.error('Failed to load config:', error);
    }
  };

  const loadReports = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value);
        }
      });

      logAdminAction('Loading reports with filters', { 
        filters: Object.fromEntries(Object.entries(filters).filter(([_, v]) => v)),
        endpoint: '/api/reports/admin/reports'
      });

      const response = await fetch(`/api/reports/admin/reports?${queryParams}`);
      const data = await response.json();
      
      if (data.success) {
        setReports(data.reports);
        if (data.reports.length === 0) {
          logAdminAction('No reports found', { appliedFilters: filters });
        } else {
          logAdminAction('Reports loaded successfully', { 
            reportCount: data.reports.length,
            totalCount: data.totalCount 
          });
        }
      } else {
        logApiError('Failed to load reports', data.error || 'Unknown error', { filters });
        toast({
          title: "Error",
          description: "Failed to load reports",
          variant: "destructive"
        });
      }
    } catch (error) {
      logApiError('Failed to load reports', error, { 
        endpoint: '/api/reports/admin/reports',
        filters 
      });
      console.error('Failed to load reports:', error);
      toast({
        title: "Error",
        description: "Failed to load reports",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      logAdminAction('Loading report statistics', { endpoint: '/api/reports/admin/stats' });
      const response = await fetch('/api/reports/admin/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
        logAdminAction('Report statistics loaded', { 
          totalReports: data.stats.totalReports,
          pendingReports: data.stats.pendingReports,
          highSeverityPending: data.stats.highSeverityPending
        });
      } else {
        logApiError('Failed to load stats', data.error || 'Unknown error');
      }
    } catch (error) {
      logApiError('Failed to load stats', error, { endpoint: '/api/reports/admin/stats' });
      console.error('Failed to load stats:', error);
    }
  };

  const handleResolveReport = async () => {
    if (!selectedReport || !actionTaken) {
      logUIAction('Admin resolve report validation failed', { 
        reason: 'Missing required fields',
        hasReport: !!selectedReport,
        hasAction: !!actionTaken
      });
      toast({
        title: "Missing Information",
        description: "Please select an action",
        variant: "destructive"
      });
      return;
    }

    setIsResolving(true);
    
    logAdminAction('Admin resolving report', {
      reportId: selectedReport.id,
      reportType: selectedReport.type,
      status: resolveStatus,
      actionTaken,
      hasNotes: !!adminNotes.trim()
    });

    try {
      const response = await fetch('/api/reports/admin/resolve', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: selectedReport.id,
          status: resolveStatus,
          actionTaken,
          adminNotes: adminNotes.trim() || undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        logAdminAction('Admin resolved report successfully', {
          reportId: selectedReport.id,
          finalStatus: resolveStatus,
          actionTaken
        });
        
        logToSupabase(`Performed ${actionTaken} on report`, { 
          reportId: selectedReport.id,
          action: actionTaken,
          status: resolveStatus
        });
        
        toast({
          title: "Success",
          description: `Report ${resolveStatus} successfully`
        });
        
        // Reset form and close modal
        setResolveModalOpen(false);
        setSelectedReport(null);
        setResolveStatus('resolved');
        setActionTaken('');
        setAdminNotes('');
        
        // Reload data
        loadReports();
        loadStats();
      } else {
        logApiError('Failed to resolve report', data.error || 'Unknown error', {
          reportId: selectedReport.id,
          status: resolveStatus
        });
        toast({
          title: "Error",
          description: data.error || `Failed to ${resolveStatus} report`,
          variant: "destructive"
        });
      }
    } catch (error) {
      logApiError('Failed to resolve report', error, {
        reportId: selectedReport.id,
        endpoint: '/api/reports/admin/resolve'
      });
      console.error('Failed to resolve report:', error);
      toast({
        title: "Error",
        description: `Failed to ${resolveStatus} report`,
        variant: "destructive"
      });
    } finally {
      setIsResolving(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'investigating': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'dismissed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatReason = (reason: string) => {
    return reason.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ShieldCheck className="w-8 h-8 text-blue-600" />
          Reports & Moderation
        </h1>
        <Button onClick={() => {
          logUIAction('Admin clicked refresh reports button');
          loadReports();
        }} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Reports</p>
                  <p className="text-2xl font-bold">{stats.totalReports}</p>
                </div>
                <Flag className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">User Reports</p>
                  <p className="text-2xl font-bold">{stats.userReports}</p>
                </div>
                <User className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Listing Reports</p>
                  <p className="text-2xl font-bold">{stats.listingReports}</p>
                </div>
                <Package className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingReports}</p>
                </div>
                <Calendar className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">High Priority</p>
                  <p className="text-2xl font-bold text-red-600">{stats.highSeverityPending}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Select value={filters.type || "all"} onValueChange={(value) => setFilters({...filters, type: value === "all" ? "" : value})}>
              <SelectTrigger>
                <SelectValue placeholder="Report Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="user">User Reports</SelectItem>
                <SelectItem value="listing">Listing Reports</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.status || "all"} onValueChange={(value) => setFilters({...filters, status: value === "all" ? "" : value})}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.severity || "all"} onValueChange={(value) => setFilters({...filters, severity: value === "all" ? "" : value})}>
              <SelectTrigger>
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              placeholder="Start Date"
            />

            <Button onClick={() => {
              const appliedFilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v));
              logAdminAction('Admin applied report filters', { appliedFilters });
              logToSupabase('Applied filters', {
                type: filters.type || 'all',
                status: filters.status || 'all',
                severity: filters.severity || 'all',
                date: filters.startDate || 'none'
              });
              loadReports();
            }} className="w-full">
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Reports ({reports.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin" />
                <span className="ml-2">Loading reports...</span>
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No reports found
              </div>
            ) : (
              reports.map((report) => (
                <div
                  key={report.id}
                  className="border rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {report.type === 'user' ? (
                        <User className="w-5 h-5 text-purple-600" />
                      ) : (
                        <Package className="w-5 h-5 text-green-600" />
                      )}
                      <div>
                        <h3 className="font-medium">
                          {report.type === 'user' ? 'User' : 'Listing'} Report
                        </h3>
                        <p className="text-sm text-gray-600">
                          Reporter: <strong>{report.reporter_username}</strong> → 
                          Target: <strong>
                            {report.type === 'user' 
                              ? report.reported_username 
                              : `${report.listing_title} (by ${report.reported_username})`
                            }
                          </strong>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityColor(report.severity)}>
                        {report.severity.toUpperCase()}
                      </Badge>
                      <Badge className={getStatusColor(report.status)}>
                        {report.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm">
                      <strong>Reason:</strong> {formatReason(report.reason)}
                    </p>
                    <p className="text-sm">
                      <strong>Details:</strong> {report.message}
                    </p>
                    {report.admin_notes && (
                      <p className="text-sm">
                        <strong>Admin Notes:</strong> {report.admin_notes}
                      </p>
                    )}
                    {report.action_taken && (
                      <p className="text-sm">
                        <strong>Action Taken:</strong> {formatReason(report.action_taken)}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t">
                    <p className="text-xs text-gray-500">
                      Submitted: {new Date(report.created_at).toLocaleString()}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedReport(report)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                      {report.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => {
                            logAdminAction('Admin opened report for resolution', {
                              reportId: report.id,
                              reportType: report.type,
                              reportSeverity: report.severity
                            });
                            logToSupabase(`Opened ${report.type} report for resolution`, { 
                              reportId: report.id,
                              severity: report.severity 
                            });
                            setSelectedReport(report);
                            setResolveModalOpen(true);
                          }}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resolve Report Modal */}
      <Dialog open={resolveModalOpen} onOpenChange={setResolveModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Resolve Report
            </DialogTitle>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Report Summary</h4>
                <p className="text-sm">
                  <strong>Type:</strong> {selectedReport.type} report
                </p>
                <p className="text-sm">
                  <strong>Reason:</strong> {formatReason(selectedReport.reason)}
                </p>
                <p className="text-sm">
                  <strong>Severity:</strong> {selectedReport.severity}
                </p>
                <p className="text-sm mt-2">
                  <strong>Details:</strong> {selectedReport.message}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Resolution Status</Label>
                  <Select value={resolveStatus} onValueChange={(value: 'resolved' | 'dismissed') => setResolveStatus(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="resolved">Resolved (Valid report)</SelectItem>
                      <SelectItem value="dismissed">Dismissed (Invalid report)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Action Taken *</Label>
                  <Select value={actionTaken} onValueChange={setActionTaken} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select action taken" />
                    </SelectTrigger>
                    <SelectContent>
                      {config?.actionTypes.map((action) => (
                        <SelectItem key={action.value} value={action.value}>
                          {action.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Admin Notes</Label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Optional notes about this resolution..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setResolveModalOpen(false)}
                  className="flex-1"
                  disabled={isResolving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleResolveReport}
                  className="flex-1"
                  disabled={isResolving || !actionTaken}
                >
                  {isResolving ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Resolving...
                    </>
                  ) : (
                    `${resolveStatus === 'resolved' ? 'Resolve' : 'Dismiss'} Report`
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminReportsPanel;