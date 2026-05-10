import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, Activity, Clock, User, Database } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingSkeleton from '@/components/LoadingSkeleton';

interface AdminLog {
  id: string;
  admin_id: string;
  action: string;
  metadata: any;
  created_at: string;
}

const AdminLogsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // You'll need to check if user has admin privileges
    // This should match your auth system
    const checkAdminStatus = async () => {
      try {
        const response = await fetch(`/api/admin/logs?userId=${user.id}`);
        if (response.status === 403) {
          navigate('/');
          return;
        }
        if (response.ok) {
          setIsAuthorized(true);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        navigate('/');
      }
    };

    checkAdminStatus();
  }, [user, navigate]);

  const { data: logs, isLoading, error } = useQuery({
    queryKey: ['admin-logs'],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const response = await fetch(`/api/admin/logs?userId=${user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch admin logs');
      }
      return response.json() as Promise<AdminLog[]>;
    },
    enabled: isAuthorized && !!user?.id,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getActionBadgeVariant = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return 'default';
      case 'update':
        return 'secondary';
      case 'delete':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getEntityIcon = (entity: string) => {
    if (!entity) return '📄';
    switch (entity.toLowerCase()) {
      case 'post':
        return '📝';
      case 'comment':
        return '💬';
      case 'subscription':
        return '💳';
      case 'listing':
        return '🐕';
      case 'user':
        return '👤';
      default:
        return '📄';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const truncateId = (id: string) => {
    return id.length > 8 ? `${id.substring(0, 8)}...` : id;
  };

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Checking Authorization...</h2>
          <p className="text-gray-500">Verifying admin access</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSkeleton viewMode="list" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <Database className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Error Loading Logs</h2>
            <p className="text-gray-500">Failed to fetch admin logs. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-600" />
          Admin Logs
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Monitor all CRUD operations and system activities
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{logs?.length || 0}</p>
                <p className="text-sm text-gray-600">Total Logs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-2xl font-bold">Live</p>
                <p className="text-sm text-gray-600">Real-time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <User className="w-8 h-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-2xl font-bold">
                  {new Set(logs?.map(log => log.admin_id)).size || 0}
                </p>
                <p className="text-sm text-gray-600">Active Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Database className="w-8 h-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-2xl font-bold">
                  {new Set(logs?.map(log => log.metadata?.entity || 'unknown')).size || 0}
                </p>
                <p className="text-sm text-gray-600">Entity Types</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-600" />
            Recent Activity (Last 100 entries)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!logs || logs.length === 0 ? (
            <div className="text-center py-8">
              <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Logs Found</h3>
              <p className="text-gray-500">No admin activity has been logged yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Admin ID</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Entity ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        {formatTimestamp(log.created_at)}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {truncateId(log.admin_id)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getActionBadgeVariant(log.action)}>
                          {log.action.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{getEntityIcon(log.metadata?.entity)}</span>
                          <span className="capitalize">{log.metadata?.entity || 'system'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {log.metadata?.entity_id ? truncateId(log.metadata.entity_id) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogsPage;