
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { useEscrowTransactions } from '@/hooks/useEscrowTransactions';

const EscrowAnalytics = () => {
  const { user } = useAuth();
  const { transactions } = useEscrowTransactions(user?.id);

  // Generate mock data for demonstration
  const monthlyData = [
    { month: 'Jan', transactions: 12, volume: 15600 },
    { month: 'Feb', transactions: 18, volume: 23400 },
    { month: 'Mar', transactions: 15, volume: 19500 },
    { month: 'Apr', transactions: 22, volume: 28600 },
    { month: 'May', transactions: 28, volume: 36400 },
    { month: 'Jun', transactions: 24, volume: 31200 },
  ];

  const statusData = [
    { name: 'Completed', value: transactions.filter(t => t.status === 'completed').length, color: '#10b981' },
    { name: 'Pending', value: transactions.filter(t => t.status === 'pending' || t.status === 'funds_held').length, color: '#f59e0b' },
    { name: 'Disputed', value: transactions.filter(t => t.status === 'disputed').length, color: '#ef4444' },
  ];

  const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0);
  const avgTransactionValue = transactions.length > 0 ? totalVolume / transactions.length : 0;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Volume</p>
              <p className="text-2xl font-bold">${totalVolume.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Avg Transaction</p>
              <p className="text-2xl font-bold">${avgTransactionValue.toFixed(0)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold">
                {transactions.length > 0 
                  ? Math.round((transactions.filter(t => t.status === 'completed').length / transactions.length) * 100)
                  : 0
                }%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Transaction Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value, name) => name === 'volume' ? `$${value}` : value} />
                <Bar dataKey="volume" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {statusData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-green-800">Dispute Resolution Rate</span>
              <span className="font-bold text-green-600">95%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-blue-800">Average Resolution Time</span>
              <span className="font-bold text-blue-600">2.3 days</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-purple-800">Customer Satisfaction</span>
              <span className="font-bold text-purple-600">4.8/5</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EscrowAnalytics;
