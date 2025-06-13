
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Clock, CheckCircle, AlertTriangle, DollarSign, Calendar } from 'lucide-react';
import { useEscrowTransaction } from '@/hooks/useEscrowTransaction';
import { formatDistanceToNow } from 'date-fns';

const EscrowDashboard = () => {
  const { transactions, loading, loadUserTransactions, confirmMeeting, disputeTransaction } = useEscrowTransaction();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'disputed'>('all');

  useEffect(() => {
    loadUserTransactions();
  }, [loadUserTransactions]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'funded':
        return <Shield className="w-4 h-4 text-blue-600" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'released':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'disputed':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'funded':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'released':
        return 'bg-green-100 text-green-800';
      case 'disputed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['pending', 'funded', 'confirmed'].includes(transaction.status);
    if (filter === 'completed') return transaction.status === 'released';
    if (filter === 'disputed') return transaction.status === 'disputed';
    return true;
  });

  const stats = {
    total: transactions.length,
    active: transactions.filter(t => ['pending', 'funded', 'confirmed'].includes(t.status)).length,
    completed: transactions.filter(t => t.status === 'released').length,
    totalValue: transactions.reduce((sum, t) => sum + t.amount, 0)
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Escrow Transactions</h2>
        <p className="text-muted-foreground">Secure payments and transaction history</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Shield className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">${stats.totalValue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="disputed">Disputed</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Transactions</h3>
              <p className="text-muted-foreground">
                Your secure transactions will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <Card key={transaction.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(transaction.status)}
                          <span className="font-semibold">
                            Transaction #{transaction.id.slice(0, 8)}...
                          </span>
                          <Badge className={getStatusColor(transaction.status)}>
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          <p>Amount: ${transaction.amount.toLocaleString()}</p>
                          <p>Created: {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}</p>
                          {transaction.meeting_scheduled_at && (
                            <p className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Meeting: {new Date(transaction.meeting_scheduled_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {transaction.status === 'funded' && (
                          <Button 
                            size="sm"
                            onClick={() => confirmMeeting(transaction.id, 'buyer')}
                          >
                            Confirm Meeting
                          </Button>
                        )}
                        
                        {['funded', 'confirmed'].includes(transaction.status) && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => disputeTransaction(transaction.id, 'Quality issue')}
                          >
                            Dispute
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EscrowDashboard;
