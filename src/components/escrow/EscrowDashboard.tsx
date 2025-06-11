
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, CreditCard, AlertTriangle, BarChart3 } from 'lucide-react';
import EscrowTransactionsList from './EscrowTransactionsList';
import EscrowAnalytics from './EscrowAnalytics';
import DisputeManagementDashboard from '@/components/payments/DisputeManagementDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { useEscrowTransactions } from '@/hooks/useEscrowTransactions';

const EscrowDashboard = () => {
  const { user } = useAuth();
  const { transactions, getTransactionStats } = useEscrowTransactions(user?.id);
  const [activeTab, setActiveTab] = useState('overview');

  const stats = getTransactionStats();

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <CreditCard className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <Shield className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
              <Shield className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Disputes</p>
                <p className="text-2xl font-bold">{stats.disputed}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="disputes">Disputes</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <EscrowTransactionsList limit={5} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium">How Escrow Works</h4>
                  <p className="text-sm text-gray-600">
                    Funds are held securely until both parties confirm the transaction
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium">Need Help?</h4>
                  <p className="text-sm text-gray-600">
                    Contact support if you have issues with any transaction
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <EscrowTransactionsList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="disputes">
          <DisputeManagementDashboard />
        </TabsContent>

        <TabsContent value="analytics">
          <EscrowAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EscrowDashboard;
