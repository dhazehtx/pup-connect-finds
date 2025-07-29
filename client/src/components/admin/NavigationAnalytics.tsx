import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Navigation, 
  TrendingUp,
  Clock,
  MapPin,
  BarChart3,
  Activity
} from 'lucide-react';
import { getAdminLogs, type AdminLogEntry } from '@/utils/logToSupabase';
import { logAdminAction } from '@/utils/logger';

interface NavigationPath {
  from: string;
  to: string;
  count: number;
  lastVisited: string;
}

interface PageVisit {
  page: string;
  visits: number;
  uniqueAdmins: number;
  avgTimeSpent: string;
  lastVisited: string;
}

const NavigationAnalytics = () => {
  const [navigationPaths, setNavigationPaths] = useState<NavigationPath[]>([]);
  const [popularPages, setPopularPages] = useState<PageVisit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNavigationData();
  }, []);

  const loadNavigationData = async () => {
    setLoading(true);
    try {
      logAdminAction('Loading navigation analytics data');
      
      // Get last 7 days of navigation data
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      
      const logs = await getAdminLogs({
        limit: 500,
        startDate: startDate.toISOString(),
        actionType: 'Navigated'
      });

      // Also get page visits
      const visitLogs = await getAdminLogs({
        limit: 500,
        startDate: startDate.toISOString(),
        actionType: 'Visited'
      });

      // Process navigation paths
      const pathCounts: { [key: string]: { count: number; lastVisited: string } } = {};
      
      logs.forEach(log => {
        if (log.metadata?.from && log.metadata?.to) {
          const pathKey = `${log.metadata.from} → ${log.metadata.to}`;
          if (!pathCounts[pathKey]) {
            pathCounts[pathKey] = { count: 0, lastVisited: log.created_at || '' };
          }
          pathCounts[pathKey].count++;
          if (log.created_at && log.created_at > pathCounts[pathKey].lastVisited) {
            pathCounts[pathKey].lastVisited = log.created_at;
          }
        }
      });

      const sortedPaths = Object.entries(pathCounts)
        .map(([path, data]) => {
          const [from, to] = path.split(' → ');
          return {
            from,
            to,
            count: data.count,
            lastVisited: data.lastVisited
          };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      setNavigationPaths(sortedPaths);

      // Process page visits
      const allLogs = [...logs, ...visitLogs];
      const pageCounts: { [key: string]: { 
        visits: number; 
        admins: Set<string>; 
        lastVisited: string;
      } } = {};

      allLogs.forEach(log => {
        const page = log.metadata?.to || log.metadata?.page || 'Unknown';
        if (!pageCounts[page]) {
          pageCounts[page] = { 
            visits: 0, 
            admins: new Set(), 
            lastVisited: log.created_at || ''
          };
        }
        pageCounts[page].visits++;
        pageCounts[page].admins.add(log.admin_id);
        if (log.created_at && log.created_at > pageCounts[page].lastVisited) {
          pageCounts[page].lastVisited = log.created_at;
        }
      });

      const sortedPages = Object.entries(pageCounts)
        .map(([page, data]) => ({
          page,
          visits: data.visits,
          uniqueAdmins: data.admins.size,
          avgTimeSpent: '~2min', // Mock for now - would need session tracking
          lastVisited: data.lastVisited
        }))
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 10);

      setPopularPages(sortedPages);
      
    } catch (error) {
      console.error('Failed to load navigation analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-muted-foreground">Loading navigation analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Navigation className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold">Admin Navigation Analytics</h2>
        <Badge variant="outline">Last 7 Days</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Navigation Paths */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Most Common Navigation Paths
            </CardTitle>
          </CardHeader>
          <CardContent>
            {navigationPaths.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No navigation paths tracked yet
              </p>
            ) : (
              <div className="space-y-3">
                {navigationPaths.map((path, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="font-mono text-xs truncate">
                          {path.from} → {path.to}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        Last: {new Date(path.lastVisited).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      {path.count}x
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Popular Pages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Most Visited Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            {popularPages.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No page visits tracked yet
              </p>
            ) : (
              <div className="space-y-3">
                {popularPages.map((page, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Activity className="w-4 h-4 text-purple-600" />
                        <span className="truncate">{page.page}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>{page.visits} visits</span>
                        <span>{page.uniqueAdmins} admins</span>
                        <span>{page.avgTimeSpent} avg</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(page.lastVisited).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {navigationPaths.reduce((sum, path) => sum + path.count, 0)}
            </div>
            <p className="text-sm text-muted-foreground">Total Navigations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {popularPages.length}
            </div>
            <p className="text-sm text-muted-foreground">Unique Pages</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {popularPages.reduce((sum, page) => sum + page.uniqueAdmins, 0)}
            </div>
            <p className="text-sm text-muted-foreground">Admin Sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {navigationPaths.length > 0 ? 
                Math.round(navigationPaths.reduce((sum, path) => sum + path.count, 0) / navigationPaths.length) 
                : 0}
            </div>
            <p className="text-sm text-muted-foreground">Avg Path Usage</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NavigationAnalytics;