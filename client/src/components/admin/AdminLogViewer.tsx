import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Filter, 
  RefreshCw, 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Info, 
  Bug,
  Calendar,
  User,
  Globe,
  Clock,
  Database
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

interface LogEntry {
  id: string;
  log_id: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'critical';
  category: string;
  message: string;
  details?: Record<string, any>;
  user_id?: string;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  endpoint?: string;
  method?: string;
  status_code?: number;
  response_time?: number;
  error_stack?: string;
  resolved: boolean;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
}

interface LogStats {
  totalLogs: number;
  errorCount: number;
  criticalCount: number;
  unresolvedErrors: number;
  avgResponseTime: number;
  topCategories: Array<{ category: string; count: number }>;
  recentTrends: Array<{ hour: string; count: number; errors: number }>;
}

const AdminLogViewer = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  
  // Filters
  const [filters, setFilters] = useState({
    level: '',
    category: '',
    resolved: '',
    startDate: '',
    endDate: '',
    userId: '',
    limit: 50
  });

  const [config, setConfig] = useState<{
    levels: string[];
    categories: string[];
  }>({ levels: [], categories: [] });

  useEffect(() => {
    loadConfig();
    loadLogs();
    loadStats();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/admin/logs/config');
      const data = await response.json();
      if (data.success) {
        setConfig(data.config);
      }
    } catch (error) {
      console.error('Failed to load log config:', error);
    }
  };

  const loadLogs = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/admin/logs/logs?${queryParams}`);
      const data = await response.json();
      
      if (data.success) {
        setLogs(data.logs);
      } else {
        toast({
          title: "Error",
          description: "Failed to load logs",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to load logs:', error);
      toast({
        title: "Error",
        description: "Failed to load logs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/logs/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const resolveError = async (logId: string) => {
    try {
      const response = await fetch('/api/admin/logs/resolve', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logId })
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Error marked as resolved"
        });
        loadLogs(); // Reload logs
        loadStats(); // Reload stats
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to resolve error",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to resolve error:', error);
      toast({
        title: "Error",
        description: "Failed to resolve error",
        variant: "destructive"
      });
    }
  };

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Level', 'Category', 'Message', 'User ID', 'IP Address', 'Status Code', 'Response Time'].join(','),
      ...logs.map(log => [
        log.created_at,
        log.level,
        log.category,
        `"${log.message.replace(/"/g, '""')}"`,
        log.user_id || '',
        log.ip_address || '',
        log.status_code || '',
        log.response_time || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'debug': return <Bug className="w-4 h-4" />;
      case 'info': return <Info className="w-4 h-4" />;
      case 'warn': return <AlertTriangle className="w-4 h-4" />;
      case 'error': return <XCircle className="w-4 h-4" />;
      case 'critical': return <XCircle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'debug': return 'bg-gray-100 text-gray-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'warn': return 'bg-orange-100 text-orange-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'critical': return 'bg-red-200 text-red-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Database className="w-8 h-8" />
          System Logs & Monitoring
        </h1>
        <div className="flex gap-2">
          <Button onClick={loadLogs} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={exportLogs} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Logs</p>
                  <p className="text-2xl font-bold">{stats.totalLogs.toLocaleString()}</p>
                </div>
                <Database className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Errors</p>
                  <p className="text-2xl font-bold text-red-600">{stats.errorCount}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Critical</p>
                  <p className="text-2xl font-bold text-red-800">{stats.criticalCount}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-800" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Response</p>
                  <p className="text-2xl font-bold">{stats.avgResponseTime}ms</p>
                </div>
                <Clock className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <Select value={filters.level} onValueChange={(value) => setFilters({...filters, level: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Levels</SelectItem>
                {config.levels.map(level => (
                  <SelectItem key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {config.categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.resolved} onValueChange={(value) => setFilters({...filters, resolved: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="false">Unresolved</SelectItem>
                <SelectItem value="true">Resolved</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              placeholder="Start Date"
            />

            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              placeholder="End Date"
            />

            <Button onClick={loadLogs} className="w-full">
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Logs ({logs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  <span className="ml-2">Loading logs...</span>
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No logs found
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                      selectedLog?.id === log.id ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedLog(log)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getLevelIcon(log.level)}
                        <Badge className={getLevelColor(log.level)}>
                          {log.level.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">{log.category}</Badge>
                        {log.resolved && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(log.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium truncate">{log.message}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                      {log.user_id && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {log.user_id.slice(0, 8)}...
                        </span>
                      )}
                      {log.ip_address && (
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {log.ip_address}
                        </span>
                      )}
                      {log.response_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {log.response_time}ms
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Log Detail Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Log Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedLog ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getLevelIcon(selectedLog.level)}
                    <Badge className={getLevelColor(selectedLog.level)}>
                      {selectedLog.level.toUpperCase()}
                    </Badge>
                    <Badge variant="outline">{selectedLog.category}</Badge>
                  </div>
                  {!selectedLog.resolved && (selectedLog.level === 'error' || selectedLog.level === 'critical') && (
                    <Button
                      size="sm"
                      onClick={() => resolveError(selectedLog.log_id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Mark Resolved
                    </Button>
                  )}
                </div>

                <div>
                  <h4 className="font-medium mb-2">Message</h4>
                  <p className="text-sm bg-gray-50 p-2 rounded">{selectedLog.message}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-1">Timestamp</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(selectedLog.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Log ID</h4>
                    <p className="text-sm text-gray-600 font-mono">{selectedLog.log_id}</p>
                  </div>
                </div>

                {selectedLog.endpoint && (
                  <div>
                    <h4 className="font-medium mb-1">Endpoint</h4>
                    <p className="text-sm text-gray-600">
                      {selectedLog.method} {selectedLog.endpoint}
                      {selectedLog.status_code && ` (${selectedLog.status_code})`}
                    </p>
                  </div>
                )}

                {selectedLog.details && (
                  <div>
                    <h4 className="font-medium mb-2">Details</h4>
                    <Textarea
                      value={JSON.stringify(selectedLog.details, null, 2)}
                      readOnly
                      className="font-mono text-xs"
                      rows={6}
                    />
                  </div>
                )}

                {selectedLog.error_stack && (
                  <div>
                    <h4 className="font-medium mb-2">Stack Trace</h4>
                    <Textarea
                      value={selectedLog.error_stack}
                      readOnly
                      className="font-mono text-xs"
                      rows={8}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Select a log entry to view details
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogViewer;