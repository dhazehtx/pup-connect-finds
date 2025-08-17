import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bug, Clock, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { QaBugReport } from '@shared/schema';

interface BugReportWithUser extends QaBugReport {
  user: {
    id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
  };
}

function BugReports() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const { data: bugReports = [], isLoading } = useQuery({
    queryKey: ['/api/qa/bug-reports', statusFilter, severityFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (severityFilter !== 'all') params.append('severity', severityFilter);
      
      const response = await apiRequest(`/api/qa/bug-reports?${params.toString()}`);
      return response.data as BugReportWithUser[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest(`/api/qa/bug-report/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/qa/bug-reports'] });
      toast({
        title: "Status Updated",
        description: "Bug report status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update bug report status.",
        variant: "destructive",
      });
    },
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Bug className="h-4 w-4 text-red-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'fixed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'wont_fix':
        return <XCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'fixed':
        return 'bg-green-100 text-green-800';
      case 'wont_fix':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const groupedReports = {
    open: bugReports.filter(report => report.status === 'open'),
    in_progress: bugReports.filter(report => report.status === 'in_progress'),
    fixed: bugReports.filter(report => report.status === 'fixed'),
    wont_fix: bugReports.filter(report => report.status === 'wont_fix'),
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bug Reports</h1>
          <p className="text-muted-foreground">Manage and track reported bugs</p>
        </div>
        
        <div className="flex gap-3">
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Severities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="fixed">Fixed</SelectItem>
              <SelectItem value="wont_fix">Won't Fix</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="open" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="open" className="relative">
            Open
            {groupedReports.open.length > 0 && (
              <Badge variant="destructive" className="ml-2 px-1.5 py-0.5 text-xs">
                {groupedReports.open.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="in_progress" className="relative">
            In Progress
            {groupedReports.in_progress.length > 0 && (
              <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
                {groupedReports.in_progress.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="fixed" className="relative">
            Fixed
            {groupedReports.fixed.length > 0 && (
              <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
                {groupedReports.fixed.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="wont_fix" className="relative">
            Won't Fix
            {groupedReports.wont_fix.length > 0 && (
              <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
                {groupedReports.wont_fix.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {Object.entries(groupedReports).map(([status, reports]) => (
          <TabsContent key={status} value={status} className="space-y-4">
            {isLoading ? (
              <div className="grid gap-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                      <div className="h-20 bg-muted rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : reports.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Bug className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Reports</h3>
                  <p className="text-muted-foreground">
                    No bug reports with status "{status.replace('_', ' ')}" found.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {reports.map((report) => (
                  <Card key={report.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(report.status)}
                          <div>
                            <CardTitle className="text-lg">{report.route}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getSeverityColor(report.severity)}>
                                {report.severity}
                              </Badge>
                              <Badge className={getStatusColor(report.status)}>
                                {report.status.replace('_', ' ')}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                by {report.user?.full_name || report.user?.username || 'Unknown'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <Select
                          value={report.status}
                          onValueChange={(newStatus) => updateStatus.mutate({ id: report.id, status: newStatus })}
                          disabled={updateStatus.isPending}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="fixed">Fixed</SelectItem>
                            <SelectItem value="wont_fix">Won't Fix</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        <p className="whitespace-pre-wrap">{report.description}</p>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                          Reported {new Date(report.created_at).toLocaleDateString()} at{' '}
                          {new Date(report.created_at).toLocaleTimeString()}
                        </span>
                        {report.updated_at !== report.created_at && (
                          <span>
                            Updated {new Date(report.updated_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

export default BugReports;