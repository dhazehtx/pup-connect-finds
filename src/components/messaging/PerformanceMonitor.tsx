
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Zap, Clock, Database, Wifi, RefreshCw } from 'lucide-react';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  threshold: { warning: number; critical: number };
}

interface MemoryUsage {
  used: number;
  total: number;
  percentage: number;
}

const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [memoryUsage, setMemoryUsage] = useState<MemoryUsage>({ used: 0, total: 0, percentage: 0 });
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline'>('online');
  const intervalRef = useRef<NodeJS.Timeout>();

  // Performance thresholds
  const thresholds = {
    renderTime: { warning: 16, critical: 32 }, // 60fps = 16ms per frame
    messageLoad: { warning: 500, critical: 1000 },
    memoryUsage: { warning: 70, critical: 90 },
    networkLatency: { warning: 200, critical: 500 }
  };

  const measurePerformance = () => {
    const newMetrics: PerformanceMetric[] = [];

    // Render performance
    const renderStart = performance.now();
    // Simulate DOM operations
    document.querySelectorAll('.message-item').length;
    const renderTime = performance.now() - renderStart;

    newMetrics.push({
      name: 'Render Time',
      value: renderTime,
      unit: 'ms',
      status: renderTime > thresholds.renderTime.critical ? 'critical' : 
              renderTime > thresholds.renderTime.warning ? 'warning' : 'good',
      threshold: thresholds.renderTime
    });

    // Memory usage (if available)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memUsed = memory.usedJSHeapSize / 1024 / 1024; // MB
      const memTotal = memory.totalJSHeapSize / 1024 / 1024; // MB
      const memPercentage = (memUsed / memTotal) * 100;

      setMemoryUsage({
        used: memUsed,
        total: memTotal,
        percentage: memPercentage
      });

      newMetrics.push({
        name: 'Memory Usage',
        value: memPercentage,
        unit: '%',
        status: memPercentage > thresholds.memoryUsage.critical ? 'critical' : 
                memPercentage > thresholds.memoryUsage.warning ? 'warning' : 'good',
        threshold: thresholds.memoryUsage
      });
    }

    // Network latency simulation
    const networkStart = Date.now();
    fetch('/api/ping', { method: 'HEAD' }).then(() => {
      const latency = Date.now() - networkStart;
      
      setMetrics(prev => [
        ...prev.filter(m => m.name !== 'Network Latency'),
        {
          name: 'Network Latency',
          value: latency,
          unit: 'ms',
          status: latency > thresholds.networkLatency.critical ? 'critical' : 
                  latency > thresholds.networkLatency.warning ? 'warning' : 'good',
          threshold: thresholds.networkLatency
        }
      ]);
    }).catch(() => {
      setConnectionStatus('offline');
    });

    // Message processing time
    const messageCount = document.querySelectorAll('.message-item').length;
    const processTime = messageCount * 0.5; // Simulated processing time

    newMetrics.push({
      name: 'Message Processing',
      value: processTime,
      unit: 'ms',
      status: processTime > thresholds.messageLoad.critical ? 'critical' : 
              processTime > thresholds.messageLoad.warning ? 'warning' : 'good',
      threshold: thresholds.messageLoad
    });

    setMetrics(prev => [
      ...prev.filter(m => m.name !== 'Render Time' && m.name !== 'Memory Usage' && m.name !== 'Message Processing'),
      ...newMetrics.filter(m => m.name !== 'Network Latency')
    ]);
  };

  useEffect(() => {
    if (isMonitoring) {
      measurePerformance();
      intervalRef.current = setInterval(measurePerformance, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isMonitoring]);

  const getStatusColor = (status: PerformanceMetric['status']) => {
    switch (status) {
      case 'good': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: PerformanceMetric['status']) => {
    switch (status) {
      case 'good': return <Badge className="bg-green-500">Good</Badge>;
      case 'warning': return <Badge variant="secondary" className="bg-yellow-500">Warning</Badge>;
      case 'critical': return <Badge variant="destructive">Critical</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Performance Monitor
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Wifi className={`w-4 h-4 ${connectionStatus === 'online' ? 'text-green-500' : 'text-red-500'}`} />
                <span className="text-sm capitalize">{connectionStatus}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMonitoring(!isMonitoring)}
                className="flex items-center gap-1"
              >
                {isMonitoring ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                {isMonitoring ? 'Stop' : 'Start'} Monitoring
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Detailed Metrics</TabsTrigger>
          <TabsTrigger value="memory">Memory Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <Card key={metric.name}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-2">
                      {metric.name === 'Render Time' && <Zap className="w-4 h-4" />}
                      {metric.name === 'Memory Usage' && <Database className="w-4 h-4" />}
                      {metric.name === 'Network Latency' && <Wifi className="w-4 h-4" />}
                      {metric.name === 'Message Processing' && <Clock className="w-4 h-4" />}
                      <span className="text-sm font-medium">{metric.name}</span>
                    </div>
                    {getStatusBadge(metric.status)}
                  </div>
                  <div className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                    {metric.value.toFixed(1)}{metric.unit}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Warning: {metric.threshold.warning}{metric.unit} | 
                    Critical: {metric.threshold.critical}{metric.unit}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {metrics.map((metric) => (
                  <div key={metric.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{metric.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${getStatusColor(metric.status)}`}>
                          {metric.value.toFixed(1)}{metric.unit}
                        </span>
                        {getStatusBadge(metric.status)}
                      </div>
                    </div>
                    <Progress 
                      value={Math.min((metric.value / metric.threshold.critical) * 100, 100)} 
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0{metric.unit}</span>
                      <span>{metric.threshold.warning}{metric.unit}</span>
                      <span>{metric.threshold.critical}{metric.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="memory">
          <Card>
            <CardContent className="pt-6">
              {memoryUsage.total > 0 ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {memoryUsage.percentage.toFixed(1)}%
                    </div>
                    <p className="text-sm text-muted-foreground">Memory Usage</p>
                  </div>
                  
                  <Progress value={memoryUsage.percentage} className="w-full" />
                  
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center">
                      <div className="text-lg font-semibold">
                        {memoryUsage.used.toFixed(1)} MB
                      </div>
                      <p className="text-sm text-muted-foreground">Used</p>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">
                        {(memoryUsage.total - memoryUsage.used).toFixed(1)} MB
                      </div>
                      <p className="text-sm text-muted-foreground">Available</p>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">
                        {memoryUsage.total.toFixed(1)} MB
                      </div>
                      <p className="text-sm text-muted-foreground">Total</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Memory information not available in this browser</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceMonitor;
