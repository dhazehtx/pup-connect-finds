import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Activity, 
  RefreshCw, 
  Download, 
  Filter, 
  Search,
  AlertTriangle,
  Info,
  AlertCircle,
  Bug
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { logger, type LogEvent } from '@/utils/logger';
import { logAdminAction, logUIAction } from '@/utils/logger';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Navigation } from 'lucide-react';
import SupabaseLogViewer from './SupabaseLogViewer';
import NavigationAnalytics from './NavigationAnalytics';

const LoggingDashboard = () => {
  const [logs, setLogs] = useState<LogEvent[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    level: '',
    search: '',
    limit: '100'
  });

  useEffect(() => {
    logAdminAction('LoggingDashboard mounted', { component: 'LoggingDashboard' });
    loadLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, filters]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      // Get logs from client-side logger
      const clientLogs = logger.getRecentLogs(parseInt(filters.limit) || 100);
      
      // Try to get backend logs if available
      try {
        logAdminAction('Fetching backend logs', { endpoint: '/api/logs/recent' });
        const response = await fetch(`/api/logs/recent?limit=${filters.limit}&category=${filters.category}&level=${filters.level}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // Combine client and backend logs
            const allLogs = [...clientLogs, ...data.logs].sort((a, b) => 
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
            setLogs(allLogs);
            logAdminAction('Backend logs loaded successfully', { 
              clientLogs: clientLogs.length,
              backendLogs: data.logs.length,
              totalLogs: allLogs.length
            });
          } else {
            setLogs(clientLogs);
            logAdminAction('Using client-side logs only', { reason: 'Backend logs unavailable' });
          }
        } else {
          setLogs(clientLogs);
          logAdminAction('Using client-side logs only', { reason: 'Backend not accessible' });
        }
      } catch (backendError) {
        setLogs(clientLogs);
        logAdminAction('Using client-side logs only', { reason: 'Backend error' });
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

  const applyFilters = () => {
    let filtered = [...logs];

    if (filters.category) {
      filtered = filtered.filter(log => log.category === filters.category);
    }

    if (filters.level) {
      filtered = filtered.filter(log => log.level === filters.level);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(log => 
        log.action.toLowerCase().includes(searchLower) ||
        JSON.stringify(log.metadata || {}).toLowerCase().includes(searchLower)
      );
    }

    setFilteredLogs(filtered.slice(0, parseInt(filters.limit) || 100));
    
    logUIAction('Applied log filters', { 
      originalCount: logs.length,
      filteredCount: filtered.length,
      filters: Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
    });
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      level: '',
      search: '',
      limit: '100'
    });
    logUIAction('Cleared log filters');
  };

  const exportLogs = () => {
    try {
      const exportData = filteredLogs.map(log => ({
        timestamp: log.timestamp,
        level: log.level,
        category: log.category,
        action: log.action,
        userId: log.userId,
        metadata: log.metadata
      }));

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `logs-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      logAdminAction('Admin exported logs', { 
        exportedCount: exportData.length,
        exportFormat: 'JSON'
      });

      toast({
        title: "Success",
        description: `Exported ${exportData.length} log entries`,
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

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warn': return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'debug': return <Bug className="w-4 h-4 text-gray-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'warn': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'debug': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'api': return 'bg-green-100 text-green-800';
      case 'auth': return 'bg-orange-100 text-orange-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Activity className="w-8 h-8 text-blue-600" />
          Admin Monitoring & Logging
        </h1>
        <div className="flex gap-2">
          <Button onClick={exportLogs} variant="outline" disabled={filteredLogs.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={loadLogs} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="client-logs" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="client-logs" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Client Logs
          </TabsTrigger>
          <TabsTrigger value="supabase-logs" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Admin Actions
          </TabsTrigger>
          <TabsTrigger value="navigation" className="flex items-center gap-2">
            <Navigation className="w-4 h-4" />
            Navigation Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="client-logs" className="space-y-6">

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
            <label className="text-sm font-medium mb-2 block">Category</label>
            <Select value={filters.category} onValueChange={(value) => 
              setFilters(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="api">API</SelectItem>
                <SelectItem value="ui">UI</SelectItem>
                <SelectItem value="auth">Auth</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Level</label>
            <Select value={filters.level} onValueChange={(value) => 
              setFilters(prev => ({ ...prev, level: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="All levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Levels</SelectItem>
                <SelectItem value="debug">Debug</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warn">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Search</label>
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
            <label className="text-sm font-medium mb-2 block">Limit</label>
            <Select value={filters.limit} onValueChange={(value) => 
              setFilters(prev => ({ ...prev, limit: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="50">50 entries</SelectItem>
                <SelectItem value="100">100 entries</SelectItem>
                <SelectItem value="200">200 entries</SelectItem>
                <SelectItem value="500">500 entries</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button onClick={clearFilters} variant="outline" className="w-full">
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Log Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{filteredLogs.length}</div>
            <p className="text-sm text-muted-foreground">Total Logs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {filteredLogs.filter(log => log.level === 'error').length}
            </div>
            <p className="text-sm text-muted-foreground">Errors</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {filteredLogs.filter(log => log.category === 'admin').length}
            </div>
            <p className="text-sm text-muted-foreground">Admin Actions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {filteredLogs.filter(log => log.category === 'api').length}
            </div>
            <p className="text-sm text-muted-foreground">API Calls</p>
          </CardContent>
        </Card>
      </div>

      {/* Logs List */}
      <Card>
        <CardHeader>
          <CardTitle>Log Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-muted-foreground">Loading logs...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No logs found matching your criteria</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredLogs.map((log, index) => (
                <div key={index} className="border rounded-lg p-3 hover:bg-muted/50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      {getLevelIcon(log.level)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{log.action}</span>
                          <Badge className={getLevelColor(log.level)}>
                            {log.level.toUpperCase()}
                          </Badge>
                          <Badge className={getCategoryColor(log.category)}>
                            {log.category.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                          {log.userId && (
                            <span className="ml-2">• User: {log.userId}</span>
                          )}
                        </div>
                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                          <div className="mt-2 text-xs bg-muted p-2 rounded">
                            <pre className="whitespace-pre-wrap">
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
        </TabsContent>

        <TabsContent value="supabase-logs" className="space-y-6">
          <SupabaseLogViewer />
        </TabsContent>

        <TabsContent value="navigation" className="space-y-6">
          <NavigationAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LoggingDashboard;