import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  Filter, 
  Calendar, 
  User, 
  Search,
  FileText,
  BarChart3,
  RefreshCw,
  Archive
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { logAdminAction } from '@/utils/logger';

interface AdminLog {
  id: string;
  timestamp: string;
  admin_id: string;
  action: string;
  metadata?: any;
  event_type?: string;
  event_detail?: string;
  category?: string;
  level?: string;
}

interface FilterOptions {
  eventType: string;
  category: string;
  level: string;
  dateRange: string;
  adminId: string;
  searchTerm: string;
  startDate: string;
  endDate: string;
}

const AdminLogFilterPanel = () => {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    eventType: 'ALL',
    category: 'ALL',
    level: 'ALL',
    dateRange: '24h',
    adminId: '',
    searchTerm: '',
    startDate: '',
    endDate: ''
  });

  // Event type options with descriptions
  const eventTypes = [
    { value: 'ALL', label: 'All Event Types', count: 0 },
    { value: 'ADMIN_PAGE_VIEW', label: 'Page Views', count: 0 },
    { value: 'ADMIN_SECTION_SWITCH', label: 'Section Navigation', count: 0 },
    { value: 'ADMIN_METRICS_ACCESS', label: 'Metrics Access', count: 0 },
    { value: 'REPORT_VIEW', label: 'Report Views', count: 0 },
    { value: 'REPORT_RESOLUTION', label: 'Report Resolutions', count: 0 },
    { value: 'MODERATION_ACTION', label: 'Moderation Actions', count: 0 },
    { value: 'ADMIN_NAVIGATION', label: 'General Navigation', count: 0 },
    { value: 'DATA_OPERATION', label: 'Data Operations', count: 0 },
    { value: 'BULK_ACTION', label: 'Bulk Operations', count: 0 }
  ];

  const categories = [
    { value: 'ALL', label: 'All Categories' },
    { value: 'navigation', label: 'Navigation' },
    { value: 'moderation', label: 'Moderation' },
    { value: 'reports', label: 'Reports' },
    { value: 'data', label: 'Data Operations' },
    { value: 'analytics', label: 'Analytics' },
    { value: 'security', label: 'Security' }
  ];

  const levels = [
    { value: 'ALL', label: 'All Levels' },
    { value: 'info', label: 'Info' },
    { value: 'warn', label: 'Warning' },
    { value: 'error', label: 'Error' },
    { value: 'critical', label: 'Critical' }
  ];

  // Fetch logs from Supabase
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admin_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1000);

      if (error) {
        console.error('Error fetching admin logs:', error);
        toast({
          title: "Error Loading Logs",
          description: "Failed to fetch admin logs from database",
          variant: "destructive"
        });
        return;
      }

      setLogs(data || []);
      
      // Log filter panel access
      logAdminAction('Accessed admin log filter panel', {
        totalLogs: data?.length || 0,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in fetchLogs:', error);
      toast({
        title: "Database Error",
        description: "Failed to connect to admin logs database",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter logs based on current filter options
  const filteredLogs = useMemo(() => {
    let filtered = [...logs];

    // Filter by event type
    if (filters.eventType !== 'ALL') {
      filtered = filtered.filter(log => 
        log.event_type === filters.eventType || 
        log.action?.includes(filters.eventType)
      );
    }

    // Filter by category
    if (filters.category !== 'ALL') {
      filtered = filtered.filter(log => 
        log.category === filters.category ||
        log.metadata?.category === filters.category
      );
    }

    // Filter by level
    if (filters.level !== 'ALL') {
      filtered = filtered.filter(log => 
        log.level === filters.level ||
        log.metadata?.level === filters.level
      );
    }

    // Filter by admin ID
    if (filters.adminId) {
      filtered = filtered.filter(log => 
        log.admin_id?.includes(filters.adminId)
      );
    }

    // Filter by search term
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(log => 
        log.action?.toLowerCase().includes(searchLower) ||
        log.event_detail?.toLowerCase().includes(searchLower) ||
        JSON.stringify(log.metadata || {}).toLowerCase().includes(searchLower)
      );
    }

    // Filter by date range
    const now = new Date();
    let startDate: Date;

    switch (filters.dateRange) {
      case '1h':
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'custom':
        if (filters.startDate) {
          startDate = new Date(filters.startDate);
          if (filters.endDate) {
            const endDate = new Date(filters.endDate);
            filtered = filtered.filter(log => {
              const logDate = new Date(log.timestamp);
              return logDate >= startDate && logDate <= endDate;
            });
          } else {
            filtered = filtered.filter(log => new Date(log.timestamp) >= startDate);
          }
        }
        return filtered;
      default:
        return filtered;
    }

    if (startDate) {
      filtered = filtered.filter(log => new Date(log.timestamp) >= startDate);
    }

    return filtered;
  }, [logs, filters]);

  // Generate CSV export data
  const generateCSVData = () => {
    return filteredLogs.map(log => ({
      timestamp: new Date(log.timestamp).toISOString(),
      admin_id: log.admin_id || 'Unknown',
      event_type: log.event_type || 'N/A',
      action: log.action || 'N/A',
      event_detail: log.event_detail || 'N/A',
      category: log.category || log.metadata?.category || 'N/A',
      level: log.level || log.metadata?.level || 'info',
      metadata: JSON.stringify(log.metadata || {})
    }));
  };

  // Export logs to CSV
  const exportToCSV = async () => {
    try {
      setExporting(true);
      const csvData = generateCSVData();
      
      if (csvData.length === 0) {
        toast({
          title: "No Data to Export",
          description: "No logs match the current filter criteria",
          variant: "destructive"
        });
        return;
      }

      const headers = [
        'Timestamp',
        'Admin ID',
        'Event Type',
        'Action',
        'Event Detail',
        'Category',
        'Level',
        'Metadata'
      ];

      const csvContent = [
        headers.join(','),
        ...csvData.map(row => [
          `"${row.timestamp}"`,
          `"${row.admin_id}"`,
          `"${row.event_type}"`,
          `"${row.action}"`,
          `"${row.event_detail}"`,
          `"${row.category}"`,
          `"${row.level}"`,
          `"${row.metadata.replace(/"/g, '""')}"`
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `admin-logs-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Log export action
      logAdminAction('Exported admin logs to CSV', {
        exportedCount: csvData.length,
        filters: filters,
        timestamp: new Date().toISOString()
      });

      toast({
        title: "Export Successful",
        description: `Exported ${csvData.length} admin logs to CSV file`
      });

    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export admin logs",
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  // Apply filters and log the action
  const applyFilters = (newFilters: Partial<FilterOptions>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    logAdminAction('Applied admin log filters', {
      filters: updatedFilters,
      resultCount: filteredLogs.length,
      timestamp: new Date().toISOString()
    });
  };

  // Clear all filters
  const clearFilters = () => {
    const defaultFilters: FilterOptions = {
      eventType: 'ALL',
      category: 'ALL',
      level: 'ALL',
      dateRange: '24h',
      adminId: '',
      searchTerm: '',
      startDate: '',
      endDate: ''
    };
    
    setFilters(defaultFilters);
    
    logAdminAction('Cleared all admin log filters', {
      timestamp: new Date().toISOString()
    });
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Admin Log Filters & Export
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Primary Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="eventType">Event Type</Label>
              <Select value={filters.eventType} onValueChange={(value) => applyFilters({ eventType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={filters.category} onValueChange={(value) => applyFilters({ category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="level">Level</Label>
              <Select value={filters.level} onValueChange={(value) => applyFilters({ level: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map(level => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dateRange">Date Range</Label>
              <Select value={filters.dateRange} onValueChange={(value) => applyFilters({ dateRange: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Secondary Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="adminId">Admin ID</Label>
              <Input
                id="adminId"
                placeholder="Filter by admin ID..."
                value={filters.adminId}
                onChange={(e) => applyFilters({ adminId: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="searchTerm">Search Logs</Label>
              <Input
                id="searchTerm"
                placeholder="Search in actions, details..."
                value={filters.searchTerm}
                onChange={(e) => applyFilters({ searchTerm: e.target.value })}
              />
            </div>
          </div>

          {/* Custom Date Range */}
          {filters.dateRange === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={filters.startDate}
                  onChange={(e) => applyFilters({ startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={filters.endDate}
                  onChange={(e) => applyFilters({ endDate: e.target.value })}
                />
              </div>
            </div>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                {filteredLogs.length} logs found
              </Badge>
              <Badge variant="secondary" className="text-sm">
                {logs.length} total logs
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={exportToCSV}
                disabled={exporting || filteredLogs.length === 0}
              >
                {exporting ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Export CSV
              </Button>

              <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
                {loading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Filtered Admin Logs
            <Badge className="ml-2">{filteredLogs.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              Loading admin logs...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Archive className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No admin logs match the current filter criteria</p>
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="overflow-auto max-h-[600px] border rounded-lg">
              <table className="min-w-full text-sm">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="p-3 text-left font-medium">Timestamp</th>
                    <th className="p-3 text-left font-medium">Admin</th>
                    <th className="p-3 text-left font-medium">Type</th>
                    <th className="p-3 text-left font-medium">Action</th>
                    <th className="p-3 text-left font-medium">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log, index) => (
                    <tr key={log.id || index} className="border-t hover:bg-muted/50">
                      <td className="p-3">
                        <div className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="text-xs">
                          {log.admin_id || 'Unknown'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge 
                          variant={log.event_type?.includes('ERROR') ? 'destructive' : 'default'}
                          className="text-xs"
                        >
                          {log.event_type || 'N/A'}
                        </Badge>
                      </td>
                      <td className="p-3 max-w-xs">
                        <div className="truncate" title={log.action}>
                          {log.action || 'N/A'}
                        </div>
                      </td>
                      <td className="p-3 max-w-md">
                        <div className="truncate text-muted-foreground" title={log.event_detail}>
                          {log.event_detail || JSON.stringify(log.metadata || {})}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogFilterPanel;