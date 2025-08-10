import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Radio,
  RadioOff,
  Pause,
  Play,
  Settings,
  Bell,
  BellOff,
  ArrowDown,
  Wifi,
  WifiOff,
  Eye,
  EyeOff,
  RefreshCw,
  Activity
} from 'lucide-react';
import { useRealtimeAdminLogs } from '@/hooks/useRealtimeAdminLogs';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

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

interface RealtimeAdminLogPanelProps {
  initialLogs?: AdminLog[];
  className?: string;
  maxHeight?: string;
}

const RealtimeAdminLogPanel: React.FC<RealtimeAdminLogPanelProps> = ({
  initialLogs = [],
  className,
  maxHeight = "600px"
}) => {
  const [showSettings, setShowSettings] = useState(false);
  
  const {
    logs,
    isListening,
    isPaused,
    newLogsCount,
    recentLogIds,
    config,
    containerRef,
    togglePause,
    updateConfig,
    resumeAndRefresh,
    scrollToBottom
  } = useRealtimeAdminLogs(initialLogs);

  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  // Get badge variant based on log level
  const getLevelBadgeVariant = (level?: string) => {
    switch (level) {
      case 'critical':
        return 'destructive';
      case 'error':
        return 'destructive';
      case 'warn':
        return 'secondary';
      case 'info':
      default:
        return 'default';
    }
  };

  // Get event type badge color
  const getEventTypeBadge = (eventType?: string) => {
    const colorMap: Record<string, string> = {
      'ADMIN_PAGE_VIEW': 'bg-indigo-100 text-indigo-800',
      'ADMIN_SECTION_SWITCH': 'bg-cyan-100 text-cyan-800',
      'ADMIN_METRICS_ACCESS': 'bg-violet-100 text-violet-800',
      'REPORT_VIEW': 'bg-blue-100 text-blue-800',
      'REPORT_RESOLUTION': 'bg-green-100 text-green-800',
      'MODERATION_ACTION': 'bg-red-100 text-red-800',
      'DATA_OPERATION': 'bg-orange-100 text-orange-800',
      'BULK_ACTION': 'bg-amber-100 text-amber-800'
    };

    return colorMap[eventType || ''] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Realtime Status & Controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Real-time Admin Logs
              <Badge 
                variant={isListening ? "default" : "secondary"}
                className="flex items-center gap-1"
              >
                {isListening ? (
                  <>
                    <Wifi className="w-3 h-3" />
                    Live
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3" />
                    Offline
                  </>
                )}
              </Badge>
              {newLogsCount > 0 && (
                <Badge variant="destructive" className="animate-pulse">
                  {newLogsCount} new
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={togglePause}
                className="flex items-center gap-1"
              >
                {isPaused ? (
                  <>
                    <Play className="w-4 h-4" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        
        {/* Settings Panel */}
        {showSettings && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <Label htmlFor="autoScroll" className="flex items-center gap-2">
                  <ArrowDown className="w-4 h-4" />
                  Auto Scroll
                </Label>
                <Switch
                  id="autoScroll"
                  checked={config.autoScroll}
                  onCheckedChange={(checked) => updateConfig({ autoScroll: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications" className="flex items-center gap-2">
                  {config.showToastNotifications ? (
                    <Bell className="w-4 h-4" />
                  ) : (
                    <BellOff className="w-4 h-4" />
                  )}
                  Notifications
                </Label>
                <Switch
                  id="notifications"
                  checked={config.showToastNotifications}
                  onCheckedChange={(checked) => updateConfig({ showToastNotifications: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="highlights" className="flex items-center gap-2">
                  {config.highlightNewEntries ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                  Highlight New
                </Label>
                <Switch
                  id="highlights"
                  checked={config.highlightNewEntries}
                  onCheckedChange={(checked) => updateConfig({ highlightNewEntries: checked })}
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Pause Banner */}
      {isPaused && newLogsCount > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pause className="w-5 h-5 text-orange-600" />
                <span className="font-medium text-orange-800">
                  Updates Paused - {newLogsCount} new logs waiting
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resumeAndRefresh}
                className="text-orange-700 border-orange-300 hover:bg-orange-100"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Resume & Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Logs Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Live Admin Activity</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{logs.length} logs</Badge>
              <Button variant="outline" size="sm" onClick={scrollToBottom}>
                <ArrowDown className="w-4 h-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            ref={containerRef}
            className="space-y-2 overflow-auto border rounded-lg p-4"
            style={{ maxHeight }}
          >
            {logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No admin logs yet. Activity will appear here in real-time.</p>
              </div>
            ) : (
              logs.map((log, index) => {
                const isRecent = recentLogIds.has(log.id);
                const isFirstThree = index < 3;
                
                return (
                  <div
                    key={log.id}
                    className={cn(
                      "p-3 border rounded-lg transition-all duration-500",
                      {
                        "border-green-300 bg-green-50 animate-in fade-in slide-in-from-top-2": isRecent,
                        "border-blue-200 bg-blue-50": isFirstThree && !isRecent,
                        "hover:bg-muted/50": !isRecent && !isFirstThree
                      }
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge 
                            className={cn("text-xs", getEventTypeBadge(log.event_type))}
                          >
                            {log.event_type || 'ACTION'}
                          </Badge>
                          <Badge 
                            variant={getLevelBadgeVariant(log.level)} 
                            className="text-xs"
                          >
                            {log.level || 'info'}
                          </Badge>
                          {isRecent && (
                            <Badge variant="default" className="text-xs animate-pulse">
                              NEW
                            </Badge>
                          )}
                        </div>
                        
                        <p className="font-medium text-sm truncate" title={log.action}>
                          {log.action}
                        </p>
                        
                        {log.event_detail && (
                          <p className="text-xs text-muted-foreground mt-1 truncate" title={log.event_detail}>
                            {log.event_detail}
                          </p>
                        )}
                      </div>
                      
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs text-muted-foreground">
                          {formatTimestamp(log.timestamp)}
                        </div>
                        <div className="text-xs font-mono text-muted-foreground mt-1">
                          {log.admin_id}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status Information */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {isListening ? <Radio className="w-6 h-6 mx-auto" /> : <RadioOff className="w-6 h-6 mx-auto" />}
              </div>
              <p className="text-sm text-muted-foreground">
                {isListening ? 'Connected' : 'Disconnected'}
              </p>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{logs.length}</div>
              <p className="text-sm text-muted-foreground">Total Logs</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{recentLogIds.size}</div>
              <p className="text-sm text-muted-foreground">Recent Activity</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{newLogsCount}</div>
              <p className="text-sm text-muted-foreground">Pending Updates</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealtimeAdminLogPanel;