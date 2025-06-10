
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Wifi, 
  WifiOff, 
  Shield, 
  ShieldOff, 
  Database, 
  Users,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface MessagingStatus {
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
  encryptionEnabled: boolean;
  messageQueue: number;
  activeUsers: number;
  lastSync: Date;
  performanceScore: number;
}

const MessagingStatusIndicator = () => {
  const [status, setStatus] = useState<MessagingStatus>({
    connectionStatus: 'connected',
    encryptionEnabled: true,
    messageQueue: 0,
    activeUsers: 8,
    lastSync: new Date(),
    performanceScore: 95
  });

  useEffect(() => {
    // Simulate status updates
    const interval = setInterval(() => {
      setStatus(prev => ({
        ...prev,
        lastSync: new Date(),
        activeUsers: Math.floor(Math.random() * 20) + 1,
        performanceScore: Math.floor(Math.random() * 30) + 70
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getConnectionIcon = () => {
    switch (status.connectionStatus) {
      case 'connected':
        return <Wifi className="w-4 h-4" />;
      case 'disconnected':
        return <WifiOff className="w-4 h-4" />;
      case 'reconnecting':
        return <Clock className="w-4 h-4 animate-spin" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getConnectionColor = () => {
    switch (status.connectionStatus) {
      case 'connected':
        return 'bg-green-500';
      case 'disconnected':
        return 'bg-red-500';
      case 'reconnecting':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPerformanceColor = () => {
    if (status.performanceScore >= 90) return 'text-green-500';
    if (status.performanceScore >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">System Status</h3>
            <div className={`w-3 h-3 rounded-full ${getConnectionColor()}`} />
          </div>

          {/* Status Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              {getConnectionIcon()}
              <div>
                <p className="text-sm font-medium capitalize">{status.connectionStatus}</p>
                <p className="text-xs text-muted-foreground">Connection</p>
              </div>
            </div>

            {/* Encryption Status */}
            <div className="flex items-center gap-2">
              {status.encryptionEnabled ? (
                <Shield className="w-4 h-4 text-green-500" />
              ) : (
                <ShieldOff className="w-4 h-4 text-red-500" />
              )}
              <div>
                <p className="text-sm font-medium">
                  {status.encryptionEnabled ? 'Enabled' : 'Disabled'}
                </p>
                <p className="text-xs text-muted-foreground">Encryption</p>
              </div>
            </div>

            {/* Message Queue */}
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              <div>
                <p className="text-sm font-medium">{status.messageQueue}</p>
                <p className="text-xs text-muted-foreground">Queued</p>
              </div>
            </div>

            {/* Active Users */}
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <div>
                <p className="text-sm font-medium">{status.activeUsers}</p>
                <p className="text-xs text-muted-foreground">Online</p>
              </div>
            </div>
          </div>

          {/* Performance Score */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className={`w-4 h-4 ${getPerformanceColor()}`} />
              <span className="text-sm font-medium">Performance Score</span>
            </div>
            <Badge variant="secondary" className={getPerformanceColor()}>
              {status.performanceScore}%
            </Badge>
          </div>

          {/* Last Sync */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Last sync: {status.lastSync.toLocaleTimeString()}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Badge 
              variant={status.connectionStatus === 'connected' ? 'default' : 'destructive'}
              className="flex-1 justify-center"
            >
              {status.connectionStatus === 'connected' ? 'Online' : 'Offline'}
            </Badge>
            <Badge 
              variant={status.encryptionEnabled ? 'default' : 'secondary'}
              className="flex-1 justify-center"
            >
              {status.encryptionEnabled ? 'Secure' : 'Unsecured'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MessagingStatusIndicator;
