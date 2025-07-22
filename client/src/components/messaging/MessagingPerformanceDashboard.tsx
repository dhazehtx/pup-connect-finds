
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Zap, Activity, Database, Wifi, TrendingUp } from 'lucide-react';
import { useMessagingPerformanceOptimized } from '@/hooks/useMessagingPerformanceOptimized';

const MessagingPerformanceDashboard = () => {
  const {
    metrics,
    isOptimizing,
    optimizePerformance,
    getOptimizationSuggestions,
  } = useMessagingPerformanceOptimized();

  const [realTimeMetrics, setRealTimeMetrics] = useState(metrics);
  const suggestions = getOptimizationSuggestions;

  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeMetrics(metrics);
    }, 1000);

    return () => clearInterval(interval);
  }, [metrics]);

  const getMetricColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMemoryUsageColor = () => getMetricColor(realTimeMetrics.memoryUsage, { good: 50, warning: 100 });
  const getLoadTimeColor = () => getMetricColor(realTimeMetrics.messageLoadTime, { good: 500, warning: 1000 });

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Performance Overview
          </CardTitle>
          <Button
            onClick={optimizePerformance}
            disabled={isOptimizing}
            size="sm"
            variant="outline"
          >
            {isOptimizing ? 'Optimizing...' : 'Optimize Now'}
          </Button>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Memory Usage</span>
              <span className={`text-sm ${getMemoryUsageColor()}`}>
                {realTimeMetrics.memoryUsage.toFixed(1)} MB
              </span>
            </div>
            <Progress 
              value={Math.min((realTimeMetrics.memoryUsage / 150) * 100, 100)} 
              className="h-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Message Load Time</span>
              <span className={`text-sm ${getLoadTimeColor()}`}>
                {realTimeMetrics.messageLoadTime.toFixed(0)}ms
              </span>
            </div>
            <Progress 
              value={Math.min((realTimeMetrics.messageLoadTime / 2000) * 100, 100)} 
              className="h-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Connections</span>
              <span className="text-sm">
                {realTimeMetrics.activeConnections}
              </span>
            </div>
            <Progress 
              value={Math.min((realTimeMetrics.activeConnections / 20) * 100, 100)} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Conversation Load</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {realTimeMetrics.conversationLoadTime.toFixed(0)}ms
            </div>
            <p className="text-xs text-muted-foreground">Average load time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium">Search Performance</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {realTimeMetrics.searchTime.toFixed(0)}ms
            </div>
            <p className="text-xs text-muted-foreground">Search response time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Cache Hit Rate</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(realTimeMetrics.cacheHitRate * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Cache efficiency</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium">Render Time</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {realTimeMetrics.renderTime.toFixed(0)}ms
            </div>
            <p className="text-xs text-muted-foreground">UI render time</p>
          </CardContent>
        </Card>
      </div>

      {/* Optimization Suggestions */}
      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Performance Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                <AlertTriangle 
                  className={`w-4 h-4 mt-0.5 ${
                    suggestion.severity === 'high' ? 'text-red-500' :
                    suggestion.severity === 'medium' ? 'text-yellow-500' :
                    'text-blue-500'
                  }`} 
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge 
                      variant={suggestion.severity === 'high' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {suggestion.severity}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {suggestion.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700">{suggestion.message}</p>
                  {suggestion.action && (
                    <Button variant="link" size="sm" className="p-0 h-auto mt-1">
                      {suggestion.action}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Real-time Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-1">
              <div className="w-3 h-3 bg-green-500 rounded-full mx-auto"></div>
              <span className="text-xs text-muted-foreground">Messaging System</span>
            </div>
            <div className="space-y-1">
              <div className={`w-3 h-3 rounded-full mx-auto ${
                realTimeMetrics.memoryUsage < 100 ? 'bg-green-500' : 'bg-yellow-500'
              }`}></div>
              <span className="text-xs text-muted-foreground">Memory</span>
            </div>
            <div className="space-y-1">
              <div className={`w-3 h-3 rounded-full mx-auto ${
                realTimeMetrics.activeConnections < 10 ? 'bg-green-500' : 'bg-yellow-500'
              }`}></div>
              <span className="text-xs text-muted-foreground">Connections</span>
            </div>
            <div className="space-y-1">
              <div className={`w-3 h-3 rounded-full mx-auto ${
                realTimeMetrics.messageLoadTime < 1000 ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="text-xs text-muted-foreground">Performance</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MessagingPerformanceDashboard;
