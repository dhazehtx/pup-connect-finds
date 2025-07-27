import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Activity, 
  RefreshCw, 
  Download, 
  Filter, 
  Search,
  User,
  Clock,
  Database
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getAdminLogs, type AdminLogEntry } from '@/utils/logToSupabase';
import { logAdminAction, logUIAction } from '@/utils/logger';

const SupabaseLogViewer = () => {
  const [logs, setLogs] = useState<AdminLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    adminId: '',
    search: '',
    limit: '50',
    days: '7'
  });

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      logAdminAction('Loading Supabase admin logs', { filters });
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(filters.days));
      
      const logsData = await getAdminLogs({
        limit: parseInt(filters.limit),
        adminId: filters.adminId || undefined,
        startDate: startDate.toISOString()
      });
      
      // Apply search filter client-side
      let filteredLogs = logsData;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredLogs = logsData.filter(log => 
          log.action.toLowerCase().includes(searchLower) ||
          JSON.stringify(log.metadata || {}).toLowerCase().includes(searchLower)
        );
      }
      
      setLogs(filteredLogs);
      logAdminAction('Supabase admin logs loaded', { count: filteredLogs.length });
      
    } catch (error) {
      console.error('Failed to load Supabase logs:', error);
      toast({
        title: "Error",
        description: "Failed to load admin logs from database",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      adminId: '',
      search: '',
      limit: '50',
      days: '7'
    });
    logUIAction('Cleared Supabase log filters');
  };

  const exportLogs = () => {
    try {
      const exportData = logs.map(log => ({
        timestamp: log.created_at,
        admin_id: log.admin_id,
        action: log.action,
        metadata: log.metadata
      }));

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `admin-logs-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      logAdminAction('Admin exported Supabase logs', { 
        exportedCount: exportData.length,
        exportFormat: 'JSON'
      });

      toast({
        title: "Success",
        description: `Exported ${exportData.length} admin log entries`,
      });
    } catch (error) {
      console.error('Failed to export logs:', error);
      toast({
        title: "Error",
        description: "Failed to export logs",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Database className="w-8 h-8 text-blue-600" />
          Supabase Admin Logs
        </h1>
        <div className="flex gap-2">
          <Button onClick={exportLogs} variant="outline" disabled={logs.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={loadLogs} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Search Actions</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search actions..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Time Range</label>
            <Select value={filters.days} onValueChange={(value) => 
              setFilters(prev => ({ ...prev, days: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Last 24 hours</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Limit</label>
            <Select value={filters.limit} onValueChange={(value) => 
              setFilters(prev => ({ ...prev, limit: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25 entries</SelectItem>
                <SelectItem value="50">50 entries</SelectItem>
                <SelectItem value="100">100 entries</SelectItem>
                <SelectItem value="200">200 entries</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button onClick={loadLogs} className="w-full" disabled={loading}>
              Apply Filters
            </Button>
          </div>

          <div className="flex items-end">
            <Button onClick={clearFilters} variant="outline" className="w-full">
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{logs.length}</div>
            <p className="text-sm text-muted-foreground">Total Admin Actions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {new Set(logs.map(log => log.admin_id)).size}
            </div>
            <p className="text-sm text-muted-foreground">Unique Admins</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {logs.filter(log => log.created_at && new Date(log.created_at) > new Date(Date.now() - 24*60*60*1000)).length}
            </div>
            <p className="text-sm text-muted-foreground">Last 24 Hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Logs List */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Action Log Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-muted-foreground">Loading admin logs from Supabase...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8">
              <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No admin logs found matching your criteria</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={log.id || index} className="border rounded-lg p-4 hover:bg-muted/50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{log.action}</span>
                          <Badge variant="outline" className="text-xs">
                            <User className="w-3 h-3 mr-1" />
                            {log.admin_id?.slice(0, 8)}...
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {log.created_at ? new Date(log.created_at).toLocaleString() : 'Unknown time'}
                          </div>
                        </div>
                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                          <div className="mt-2 text-xs bg-muted p-3 rounded">
                            <strong>Metadata:</strong>
                            <pre className="whitespace-pre-wrap mt-1">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SupabaseLogViewer;