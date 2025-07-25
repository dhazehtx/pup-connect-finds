import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Shield, Clock, RefreshCw, Eye, Ban } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AbuseAttempt {
  ip: string;
  userId?: string;
  endpoint: string;
  timestamp: Date;
  userAgent: string;
  attempts: number;
}

interface Lockout {
  key: string;
  until: Date;
}

interface AbuseStats {
  attempts: AbuseAttempt[];
  lockouts: Lockout[];
}

const AbuseMonitoringPanel = () => {
  const [stats, setStats] = useState<AbuseStats>({ attempts: [], lockouts: [] });
  const [loading, setLoading] = useState(true);
  const [selectedAttempt, setSelectedAttempt] = useState<AbuseAttempt | null>(null);
  const { toast } = useToast();

  const fetchAbuseStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/abuse-stats', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else if (response.status === 403) {
        toast({
          title: "Access Denied",
          description: "Admin access required to view abuse statistics",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch abuse statistics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbuseStats();
    // Refresh every 30 seconds
    const interval = setInterval(fetchAbuseStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (attempts: number) => {
    if (attempts >= 10) return 'destructive';
    if (attempts >= 5) return 'secondary';
    return 'outline';
  };

  const getEndpointIcon = (endpoint: string) => {
    if (endpoint.includes('auth')) return <Shield className="w-4 h-4" />;
    if (endpoint.includes('message')) return <AlertTriangle className="w-4 h-4" />;
    return <Eye className="w-4 h-4" />;
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const formatTimeUntil = (until: Date) => {
    const now = new Date();
    const diff = new Date(until).getTime() - now.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Expiring now';
    if (minutes < 60) return `${minutes}m remaining`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h remaining`;
    const days = Math.floor(hours / 24);
    return `${days}d remaining`;
  };

  const topAbusers = stats.attempts
    .sort((a, b) => b.attempts - a.attempts)
    .slice(0, 10);

  const recentAttempts = stats.attempts
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 20);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Abuse Monitoring</h2>
          <p className="text-gray-600">Monitor rate limiting and suspicious activity</p>
        </div>
        <Button onClick={fetchAbuseStats} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Total Attempts</p>
                <p className="text-2xl font-bold">{stats.attempts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Ban className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Active Lockouts</p>
                <p className="text-2xl font-bold">{stats.lockouts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">High Risk IPs</p>
                <p className="text-2xl font-bold">
                  {stats.attempts.filter(a => a.attempts >= 10).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Recent (1h)</p>
                <p className="text-2xl font-bold">
                  {stats.attempts.filter(a => 
                    new Date().getTime() - new Date(a.timestamp).getTime() < 3600000
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Abusers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Top Abusers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topAbusers.map((attempt, index) => (
                <div key={`${attempt.ip}-${attempt.endpoint}`} 
                     className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                     onClick={() => setSelectedAttempt(attempt)}>
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{attempt.ip}</p>
                      <p className="text-sm text-gray-600">
                        {attempt.userId ? `User: ${attempt.userId}` : 'Anonymous'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={getSeverityColor(attempt.attempts)}>
                      {attempt.attempts} attempts
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTimeAgo(attempt.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Lockouts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ban className="w-5 h-5" />
              Active Lockouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.lockouts.map((lockout, index) => (
                <div key={lockout.key} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{lockout.key}</p>
                    <p className="text-sm text-gray-600">
                      {lockout.key.startsWith('user:') ? 'User Account' : 'IP Address'}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="destructive">Locked</Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTimeUntil(lockout.until)}
                    </p>
                  </div>
                </div>
              ))}
              {stats.lockouts.length === 0 && (
                <p className="text-gray-500 text-center py-4">No active lockouts</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Attempts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Abuse Attempts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Time</th>
                  <th className="text-left p-2">IP / User</th>
                  <th className="text-left p-2">Endpoint</th>
                  <th className="text-left p-2">Attempts</th>
                  <th className="text-left p-2">User Agent</th>
                </tr>
              </thead>
              <tbody>
                {recentAttempts.map((attempt, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2">{formatTimeAgo(attempt.timestamp)}</td>
                    <td className="p-2">
                      <div>
                        <div className="font-mono text-xs">{attempt.ip}</div>
                        {attempt.userId && (
                          <div className="text-xs text-gray-600">User: {attempt.userId}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        {getEndpointIcon(attempt.endpoint)}
                        <span>{attempt.endpoint}</span>
                      </div>
                    </td>
                    <td className="p-2">
                      <Badge variant={getSeverityColor(attempt.attempts)}>
                        {attempt.attempts}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <div className="max-w-xs truncate text-xs text-gray-600">
                        {attempt.userAgent}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AbuseMonitoringPanel;