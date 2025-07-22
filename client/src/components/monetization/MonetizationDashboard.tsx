
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  Star, 
  Users, 
  Heart,
  CreditCard,
  Crown,
  Zap
} from 'lucide-react';

const MonetizationDashboard = () => {
  const revenueStreams = [
    {
      title: 'Listing Fees',
      amount: '$2,450',
      growth: '+12%',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Featured Listings',
      amount: '$1,890',
      growth: '+25%',
      icon: Star,
      color: 'text-yellow-600'
    },
    {
      title: 'Subscriptions',
      amount: '$5,670',
      growth: '+18%',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Transaction Fees',
      amount: '$3,210',
      growth: '+15%',
      icon: CreditCard,
      color: 'text-purple-600'
    },
    {
      title: 'Donations',
      amount: '$890',
      growth: '+8%',
      icon: Heart,
      color: 'text-red-600'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Revenue Dashboard</h2>
        <Badge className="bg-green-100 text-green-800">
          <TrendingUp size={14} className="mr-1" />
          +16% this month
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {revenueStreams.map((stream, index) => {
          const Icon = stream.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Icon size={20} className={stream.color} />
                  <span className="text-sm text-green-600 font-medium">{stream.growth}</span>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold">{stream.amount}</div>
                  <div className="text-sm text-gray-600">{stream.title}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown size={20} className="text-yellow-600" />
              Top Revenue Sources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {revenueStreams.slice(0, 3).map((stream, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <stream.icon size={16} className={stream.color} />
                  <span className="font-medium">{stream.title}</span>
                </div>
                <span className="font-bold">{stream.amount}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap size={20} className="text-blue-600" />
              Growth Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="font-medium text-blue-900">Premium Subscriptions</div>
              <div className="text-sm text-blue-700">Target 50 new pro subscribers this month</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="font-medium text-green-900">Featured Listings</div>
              <div className="text-sm text-green-700">Increase adoption by 30%</div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="font-medium text-purple-900">Transaction Volume</div>
              <div className="text-sm text-purple-700">Boost marketplace sales</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MonetizationDashboard;
