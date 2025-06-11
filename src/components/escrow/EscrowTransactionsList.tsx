
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, User, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEscrowTransactions } from '@/hooks/useEscrowTransactions';

interface EscrowTransactionsListProps {
  limit?: number;
}

const EscrowTransactionsList: React.FC<EscrowTransactionsListProps> = ({ limit }) => {
  const { user } = useAuth();
  const { transactions, loading } = useEscrowTransactions(user?.id);

  const displayTransactions = limit ? transactions.slice(0, limit) : transactions;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'funds_held': return 'bg-blue-100 text-blue-800';
      case 'disputed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getUserRole = (transaction: any) => {
    return transaction.buyer_id === user?.id ? 'buyer' : 'seller';
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 h-20 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (displayTransactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>No transactions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {displayTransactions.map((transaction) => (
        <Card key={transaction.id} className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium">
                    {transaction.dog_listings?.dog_name || 'Unknown Dog'} - {transaction.dog_listings?.breed || 'Unknown Breed'}
                  </h4>
                  <Badge className={getStatusColor(transaction.status)}>
                    {transaction.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <Badge variant="outline">
                    {getUserRole(transaction)}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    <span>${transaction.amount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(transaction.created_at)}</span>
                  </div>
                  {transaction.meeting_location && (
                    <div className="flex items-center gap-1 col-span-2">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{transaction.meeting_location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EscrowTransactionsList;
