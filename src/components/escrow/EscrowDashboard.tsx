import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useEscrowTransactions } from '@/hooks/useEscrowTransactions';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, CheckCircle, AlertTriangle, DollarSign, Eye } from 'lucide-react';
import EscrowTransactionStatus from '@/components/payments/EscrowTransactionStatus';

const EscrowDashboard = () => {
  const { user } = useAuth();
  const { transactions, loading, getTransactionStats } = useEscrowTransactions(user?.id);
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const stats = getTransactionStats();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="text-green-600" size={16} />;
      case 'disputed': return <AlertTriangle className="text-red-600" size={16} />;
      default: return <Clock className="text-yellow-600" size={16} />;
    }
  };

  const getProgressValue = (status: string) => {
    switch (status) {
      case 'pending': return 25;
      case 'funds_held': return 50;
      case 'buyer_confirmed': return 75;
      case 'seller_confirmed': return 75;
      case 'completed': return 100;
      case 'disputed': return 40;
      default: return 0;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'disputed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="text-blue-600" size={20} />
              <div>
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="text-yellow-600" size={20} />
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="text-green-600" size={20} />
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-red-600" size={20} />
              <div>
                <p className="text-sm text-gray-600">Disputed</p>
                <p className="text-2xl font-bold">{stats.disputed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Details */}
      {selectedTransaction ? (
        <div className="space-y-4">
          <Button 
            variant="outline" 
            onClick={() => setSelectedTransaction(null)}
          >
            ← Back to Dashboard
          </Button>
          <EscrowTransactionStatus 
            escrowTransactionId={selectedTransaction}
            userRole={transactions.find(t => t.id === selectedTransaction)?.buyer_id === user?.id ? 'buyer' : 'seller'}
          />
        </div>
      ) : (
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Transactions</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="disputed">Disputed</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {transactions.map((transaction) => (
              <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(transaction.status)}
                        <h3 className="font-semibold">
                          {transaction.dog_listings?.dog_name} - {transaction.dog_listings?.breed}
                        </h3>
                        <Badge className={getStatusColor(transaction.status)}>
                          {transaction.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>Amount: ${transaction.amount}</div>
                        <div>Role: {transaction.buyer_id === user?.id ? 'Buyer' : 'Seller'}</div>
                        <div>Created: {new Date(transaction.created_at).toLocaleDateString()}</div>
                        <div>
                          {transaction.meeting_scheduled_at && (
                            <>Meeting: {new Date(transaction.meeting_scheduled_at).toLocaleDateString()}</>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedTransaction(transaction.id)}
                    >
                      <Eye size={16} className="mr-2" />
                      View Details
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{getProgressValue(transaction.status)}%</span>
                    </div>
                    <Progress value={getProgressValue(transaction.status)} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {transactions.filter(t => ['pending', 'funds_held', 'buyer_confirmed', 'seller_confirmed'].includes(t.status)).map((transaction) => (
              <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(transaction.status)}
                        <h3 className="font-semibold">
                          {transaction.dog_listings?.dog_name} - {transaction.dog_listings?.breed}
                        </h3>
                        <Badge className={getStatusColor(transaction.status)}>
                          {transaction.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>Amount: ${transaction.amount}</div>
                        <div>Role: {transaction.buyer_id === user?.id ? 'Buyer' : 'Seller'}</div>
                        <div>Created: {new Date(transaction.created_at).toLocaleDateString()}</div>
                        <div>
                          {transaction.meeting_scheduled_at && (
                            <>Meeting: {new Date(transaction.meeting_scheduled_at).toLocaleDateString()}</>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedTransaction(transaction.id)}
                    >
                      <Eye size={16} className="mr-2" />
                      View Details
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{getProgressValue(transaction.status)}%</span>
                    </div>
                    <Progress value={getProgressValue(transaction.status)} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {transactions.filter(t => t.status === 'completed').map((transaction) => (
              <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(transaction.status)}
                        <h3 className="font-semibold">
                          {transaction.dog_listings?.dog_name} - {transaction.dog_listings?.breed}
                        </h3>
                        <Badge className={getStatusColor(transaction.status)}>
                          {transaction.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>Amount: ${transaction.amount}</div>
                        <div>Role: {transaction.buyer_id === user?.id ? 'Buyer' : 'Seller'}</div>
                        <div>Created: {new Date(transaction.created_at).toLocaleDateString()}</div>
                        <div>
                          {transaction.meeting_scheduled_at && (
                            <>Meeting: {new Date(transaction.meeting_scheduled_at).toLocaleDateString()}</>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedTransaction(transaction.id)}
                    >
                      <Eye size={16} className="mr-2" />
                      View Details
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{getProgressValue(transaction.status)}%</span>
                    </div>
                    <Progress value={getProgressValue(transaction.status)} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="disputed" className="space-y-4">
            {transactions.filter(t => t.status === 'disputed').map((transaction) => (
              <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(transaction.status)}
                        <h3 className="font-semibold">
                          {transaction.dog_listings?.dog_name} - {transaction.dog_listings?.breed}
                        </h3>
                        <Badge className={getStatusColor(transaction.status)}>
                          {transaction.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>Amount: ${transaction.amount}</div>
                        <div>Role: {transaction.buyer_id === user?.id ? 'Buyer' : 'Seller'}</div>
                        <div>Created: {new Date(transaction.created_at).toLocaleDateString()}</div>
                        <div>
                          {transaction.meeting_scheduled_at && (
                            <>Meeting: {new Date(transaction.meeting_scheduled_at).toLocaleDateString()}</>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedTransaction(transaction.id)}
                    >
                      <Eye size={16} className="mr-2" />
                      View Details
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{getProgressValue(transaction.status)}%</span>
                    </div>
                    <Progress value={getProgressValue(transaction.status)} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default EscrowDashboard;
