
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Users, DollarSign, Calendar, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsData {
  date: string;
  new_subscriptions: number;
  cancelled_subscriptions: number;
  upgrades: number;
  downgrades: number;
  total_revenue: number;
  mrr: number;
  tier_breakdown: Record<string, number>;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, trend }) => {
  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp size={16} className="text-green-600" />;
    if (trend === 'down') return <TrendingDown size={16} className="text-red-600" />;
    return null;
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change !== undefined && (
              <div className={`flex items-center gap-1 text-sm ${getTrendColor()}`}>
                {getTrendIcon()}
                <span>{change > 0 ? '+' : ''}{change}%</span>
              </div>
            )}
          </div>
          <div className="text-blue-600">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
};

const SubscriptionAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  const { toast } = useToast();

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(timeRange));

      const { data, error } = await supabase
        .from('subscription_analytics')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;
      setAnalyticsData(data || []);
    } catch (error) {
      toast({
        title: "Analytics Load Failed",
        description: "Unable to load subscription analytics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const calculateMetrics = () => {
    if (analyticsData.length === 0) {
      return {
        totalRevenue: 0,
        currentMRR: 0,
        totalSubscribers: 0,
        churnRate: 0,
        revenueChange: 0,
        subscriberChange: 0
      };
    }

    const latest = analyticsData[analyticsData.length - 1];
    const previous = analyticsData.length > 1 ? analyticsData[analyticsData.length - 2] : latest;

    const totalRevenue = analyticsData.reduce((sum, day) => sum + day.total_revenue, 0);
    const totalNewSubs = analyticsData.reduce((sum, day) => sum + day.new_subscriptions, 0);
    const totalCancelled = analyticsData.reduce((sum, day) => sum + day.cancelled_subscriptions, 0);
    
    const churnRate = totalNewSubs > 0 ? (totalCancelled / totalNewSubs) * 100 : 0;
    const revenueChange = previous.total_revenue > 0 ? 
      ((latest.total_revenue - previous.total_revenue) / previous.total_revenue) * 100 : 0;

    return {
      totalRevenue,
      currentMRR: latest.mrr,
      totalSubscribers: totalNewSubs - totalCancelled,
      churnRate,
      revenueChange,
      subscriberChange: ((latest.new_subscriptions - latest.cancelled_subscriptions) / Math.max(1, previous.new_subscriptions - previous.cancelled_subscriptions)) * 100
    };
  };

  const getTierBreakdownData = () => {
    if (analyticsData.length === 0) return [];
    
    const latest = analyticsData[analyticsData.length - 1];
    const tierData = latest.tier_breakdown || {};
    
    return Object.entries(tierData).map(([tier, count]) => ({
      name: tier,
      value: count,
      fill: tier === 'Basic' ? '#3B82F6' : tier === 'Pro' ? '#F59E0B' : '#8B5CF6'
    }));
  };

  const metrics = calculateMetrics();
  const tierData = getTierBreakdownData();

  const COLORS = ['#3B82F6', '#F59E0B', '#8B5CF6'];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Subscription Analytics</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={`$${metrics.totalRevenue.toLocaleString()}`}
          change={metrics.revenueChange}
          trend={metrics.revenueChange > 0 ? 'up' : metrics.revenueChange < 0 ? 'down' : 'neutral'}
          icon={<DollarSign size={24} />}
        />
        <MetricCard
          title="Monthly Recurring Revenue"
          value={`$${metrics.currentMRR.toLocaleString()}`}
          icon={<TrendingUp size={24} />}
        />
        <MetricCard
          title="Active Subscribers"
          value={metrics.totalSubscribers}
          change={metrics.subscriberChange}
          trend={metrics.subscriberChange > 0 ? 'up' : 'down'}
          icon={<Users size={24} />}
        />
        <MetricCard
          title="Churn Rate"
          value={`${metrics.churnRate.toFixed(1)}%`}
          trend={metrics.churnRate < 5 ? 'up' : 'down'}
          icon={<Target size={24} />}
        />
      </div>

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="tiers">Plan Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                  <Legend />
                  <Line type="monotone" dataKey="total_revenue" stroke="#3B82F6" strokeWidth={2} />
                  <Line type="monotone" dataKey="mrr" stroke="#F59E0B" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscribers">
          <Card>
            <CardHeader>
              <CardTitle>Subscriber Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="new_subscriptions" fill="#10B981" name="New Subscriptions" />
                  <Bar dataKey="cancelled_subscriptions" fill="#EF4444" name="Cancellations" />
                  <Bar dataKey="upgrades" fill="#3B82F6" name="Upgrades" />
                  <Bar dataKey="downgrades" fill="#F59E0B" name="Downgrades" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tiers">
          <Card>
            <CardHeader>
              <CardTitle>Plan Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={tierData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {tierData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SubscriptionAnalytics;
