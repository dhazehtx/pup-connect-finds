import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle, Clock, TrendingUp, RefreshCw, Filter } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface StoredError {
  id: string;
  type: 'frontend' | 'backend';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  stack?: string;
  timestamp: string;
  userId?: string;
  context?: string;
  resolved: boolean;
  errorData: any;
}

interface ErrorStats {
  total: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  resolved: number;
  unresolved: number;
}

const ErrorMonitoringPanel = () => {
  const [filters, setFilters] = useState({
    type: '',
    severity: '',
    resolved: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch error statistics
  const { data: stats, isLoading: statsLoading } = useQuery<{ success: boolean; stats: ErrorStats }>({
    queryKey: ['error-stats'],
    queryFn: async () => {
      const response = await fetch('/api/logs/stats');
      if (!response.ok) throw new Error('Failed to fetch error stats');
      return response.json();
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch error logs
  const { data: errorsData, isLoading: errorsLoading, refetch } = useQuery<{
    success: boolean;
    errors: StoredError[];
    count: number;
  }>({
    queryKey: ['error-logs', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.severity) params.append('severity', filters.severity);
      if (filters.resolved) params.append('resolved', filters.resolved);
      params.append('limit', '50');

      const response = await fetch(`/api/logs/errors?${params}`);
      if (!response.ok) throw new Error('Failed to fetch error logs');
      return response.json();
    }
  });

  // Resolve error mutation
  const resolveErrorMutation = useMutation({
    mutationFn: async (errorId: string) => {
      const response = await fetch(`/api/logs/errors/${errorId}/resolve`, {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error('Failed to resolve error');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['error-logs'] });
      queryClient.invalidateQueries({ queryKey: ['error-stats'] });
      toast({
        title: "Error Resolved",
        description: "The error has been marked as resolved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Resolve Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'frontend' ? 'default' : 'secondary';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Error Monitoring</h2>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Total Errors</p>
                <p className="text-2xl font-bold">{stats?.stats.total || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Unresolved</p>
                <p className="text-2xl font-bold text-orange-600">{stats?.stats.unresolved || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{stats?.stats.resolved || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-red-600">{stats?.stats.bySeverity.critical || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="errors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="errors">Error Logs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="errors" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    <option value="">All Types</option>
                    <option value="frontend">Frontend</option>
                    <option value="backend">Backend</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Severity</label>
                  <select
                    value={filters.severity}
                    onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    <option value="">All Severities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select
                    value={filters.resolved}
                    onChange={(e) => setFilters(prev => ({ ...prev, resolved: e.target.value }))}
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    <option value="">All Status</option>
                    <option value="false">Unresolved</option>
                    <option value="true">Resolved</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error List */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Errors ({errorsData?.count || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {errorsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : errorsData?.errors.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No errors found matching the current filters.
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {errorsData?.errors.map((error) => (
                    <div key={error.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={getSeverityColor(error.severity)}>
                              {error.severity.toUpperCase()}
                            </Badge>
                            <Badge variant={getTypeColor(error.type)}>
                              {error.type}
                            </Badge>
                            {error.resolved ? (
                              <Badge variant="default">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Resolved
                              </Badge>
                            ) : (
                              <Badge variant="outline">
                                <Clock className="w-3 h-3 mr-1" />
                                Open
                              </Badge>
                            )}
                          </div>
                          <p className="font-medium text-gray-900">{error.message}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span>{formatTimestamp(error.timestamp)}</span>
                            {error.context && <span>Context: {error.context}</span>}
                            {error.userId && <span>User: {error.userId}</span>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!error.resolved && (
                            <Button
                              onClick={() => resolveErrorMutation.mutate(error.id)}
                              disabled={resolveErrorMutation.isPending}
                              size="sm"
                              variant="outline"
                            >
                              Mark Resolved
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {error.stack && (
                        <details className="text-sm">
                          <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                            Stack Trace
                          </summary>
                          <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-x-auto">
                            {error.stack}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Error Types Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Error Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats?.stats.byType || {}).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="capitalize">{type}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${((count / (stats?.stats.total || 1)) * 100)}%`
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Severity Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Severity Levels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats?.stats.bySeverity || {}).map(([severity, count]) => (
                    <div key={severity} className="flex items-center justify-between">
                      <span className="capitalize">{severity}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              severity === 'critical' ? 'bg-red-500' :
                              severity === 'high' ? 'bg-orange-500' :
                              severity === 'medium' ? 'bg-orange-500' : 'bg-green-500'
                            }`}
                            style={{
                              width: `${((count / (stats?.stats.total || 1)) * 100)}%`
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ErrorMonitoringPanel;