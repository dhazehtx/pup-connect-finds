
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMessagingPerformance } from '@/hooks/useMessagingPerformance';
import { 
  Activity, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Gauge
} from 'lucide-react';

const PerformanceMonitor = () => {
  const {
    metrics,
    isOptimizing,
    optimizePerformance,
    getOptimizationSuggestions
  } = useMessagingPerformance();

  const [showDetails, setShowDetails] = useState(false);

  const getPerformanceStatus = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return { status: 'good', color: 'text-green-500' };
    if (value <= thresholds.warning) return { status: 'warning', color: 'text-yellow-500' };
    return { status: 'poor', color: 'text-red-500' };
  };

  const messageLoadStatus = getPerformanceStatus(metrics.messageLoadTime, { good: 500, warning: 1000 });
  const memoryStatus = getPerformanceStatus(metrics.memoryUsage, { good: 50, warning: 100 });
  const searchStatus = getPerformanceStatus(metrics.searchTime, { good: 200, warning: 500 });

  const overallScore = Math.max(0, 100 - (
    (metrics.messageLoadTime > 500 ? 20 : 0) +
    (metrics.memoryUsage > 50 ? 20 : 0) +
    (metrics.searchTime > 200 ? 20 : 0) +
    (metrics.activeConnections > 5 ? 20 : 0)
  ));

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Performance Monitor
          <Badge variant={overallScore > 80 ? "default" : overallScore > 60 ? "secondary" : "destructive"}>
            {overallScore}/100
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Overall Performance Score */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Overall Performance</span>
            <span className="text-sm text-muted-foreground">{overallScore}%</span>
          </div>
          <Progress value={overallScore} className="w-full" />
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4" />
              <span className="text-sm">Message Load</span>
            </div>
            <div className={`text-lg font-semibold ${messageLoadStatus.color}`}>
              {metrics.messageLoadTime.toFixed(0)}ms
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">Memory Usage</span>
            </div>
            <div className={`text-lg font-semibold ${memoryStatus.color}`}>
              {metrics.memoryUsage}MB
            </div>
          </div>
        </div>

        {/* Optimization Suggestions */}
        {getOptimizationSuggestions.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium">Performance Suggestions:</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {getOptimizationSuggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Detailed Metrics */}
        {showDetails && (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-medium">Detailed Metrics</h4>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Conversation Load:</span>
                <span className="float-right">{metrics.conversationLoadTime.toFixed(0)}ms</span>
              </div>
              <div>
                <span className="text-muted-foreground">Search Time:</span>
                <span className={`float-right ${searchStatus.color}`}>
                  {metrics.searchTime.toFixed(0)}ms
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Active Connections:</span>
                <span className="float-right">{metrics.activeConnections}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Cache Size:</span>
                <span className="float-right">~{(metrics.memoryUsage * 0.3).toFixed(1)}MB</span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Hide' : 'Show'} Details
          </Button>
          
          <Button
            size="sm"
            onClick={optimizePerformance}
            disabled={isOptimizing || overallScore > 80}
          >
            {isOptimizing ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Optimizing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Optimize
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceMonitor;
