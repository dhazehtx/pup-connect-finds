
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Clock, AlertCircle, MapPin, Calendar, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import EscrowDisputeDialog from './EscrowDisputeDialog';

interface EscrowTransactionStatusProps {
  escrowTransactionId: string;
  userRole: 'buyer' | 'seller';
}

const EscrowTransactionStatus: React.FC<EscrowTransactionStatusProps> = ({ 
  escrowTransactionId, 
  userRole 
}) => {
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [showDisputeDialog, setShowDisputeDialog] = useState(false);
  const { toast } = useToast();

  const fetchTransaction = async () => {
    try {
      const { data, error } = await supabase
        .from('escrow_transactions')
        .select(`
          *,
          dog_listings:listing_id (
            dog_name,
            breed,
            image_url
          )
        `)
        .eq('id', escrowTransactionId)
        .single();

      if (error) throw error;
      setTransaction(data);
    } catch (error: any) {
      toast({
        title: "Failed to load transaction",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransaction();
  }, [escrowTransactionId]);

  const handleConfirmTransaction = async () => {
    try {
      setConfirming(true);

      const { data, error } = await supabase.functions.invoke('confirm-escrow-transaction', {
        body: {
          escrowTransactionId,
          confirmationType: userRole
        }
      });

      if (error) throw error;

      toast({
        title: "Transaction Confirmed",
        description: data.bothConfirmed 
          ? "Both parties have confirmed. Funds will be released!" 
          : "Your confirmation has been recorded. Waiting for the other party.",
      });

      await fetchTransaction();
    } catch (error: any) {
      toast({
        title: "Confirmation Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setConfirming(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'funds_held': return 'bg-blue-100 text-blue-800';
      case 'buyer_confirmed': return 'bg-green-100 text-green-800';
      case 'seller_confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'disputed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canConfirm = () => {
    if (!transaction) return false;
    if (transaction.status === 'completed' || transaction.status === 'disputed') return false;
    
    if (userRole === 'buyer') {
      return !transaction.buyer_confirmed_at;
    } else {
      return !transaction.seller_confirmed_at;
    }
  };

  const canDispute = () => {
    return transaction && 
           transaction.status !== 'completed' && 
           transaction.status !== 'disputed';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!transaction) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">Transaction not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="text-green-600" size={24} />
              Escrow Transaction
            </CardTitle>
            <Badge className={getStatusColor(transaction.status)}>
              {transaction.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Transaction Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Puppy Details</h4>
              <p className="text-sm text-gray-600">
                {transaction.dog_listings?.dog_name} - {transaction.dog_listings?.breed}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Amount</h4>
              <p className="text-lg font-bold">${transaction.amount}</p>
              <p className="text-sm text-gray-600">
                Seller receives: ${transaction.seller_amount}
              </p>
            </div>
          </div>

          <Separator />

          {/* Meeting Information */}
          {transaction.meeting_location && (
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <MapPin size={16} />
                Meeting Details
              </h4>
              <p className="text-sm text-gray-600">{transaction.meeting_location}</p>
              {transaction.meeting_scheduled_at && (
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Calendar size={16} />
                  {new Date(transaction.meeting_scheduled_at).toLocaleDateString()} at{' '}
                  {new Date(transaction.meeting_scheduled_at).toLocaleTimeString()}
                </p>
              )}
            </div>
          )}

          <Separator />

          {/* Confirmation Status */}
          <div className="space-y-3">
            <h4 className="font-semibold">Confirmation Status</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {transaction.buyer_confirmed_at ? (
                  <CheckCircle className="text-green-600" size={16} />
                ) : (
                  <Clock className="text-yellow-600" size={16} />
                )}
                <span className="text-sm">
                  Buyer confirmation {transaction.buyer_confirmed_at ? 'completed' : 'pending'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {transaction.seller_confirmed_at ? (
                  <CheckCircle className="text-green-600" size={16} />
                ) : (
                  <Clock className="text-yellow-600" size={16} />
                )}
                <span className="text-sm">
                  Seller confirmation {transaction.seller_confirmed_at ? 'completed' : 'pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {canConfirm() && (
              <Button 
                onClick={handleConfirmTransaction}
                disabled={confirming}
                size="lg"
                className="flex-1"
              >
                {confirming ? (
                  <Clock className="animate-spin mr-2" size={16} />
                ) : (
                  <CheckCircle className="mr-2" size={16} />
                )}
                Confirm Transaction
              </Button>
            )}
            
            {canDispute() && (
              <Button 
                variant="outline"
                onClick={() => setShowDisputeDialog(true)}
                size="lg"
              >
                <AlertCircle className="mr-2" size={16} />
                Report Issue
              </Button>
            )}
          </div>

          {/* Completion Message */}
          {transaction.status === 'completed' && (
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-green-800 font-semibold">
                ✅ Transaction completed successfully!
              </p>
              <p className="text-sm text-green-700">
                Funds have been released to the seller.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dispute Dialog */}
      <EscrowDisputeDialog
        open={showDisputeDialog}
        onOpenChange={setShowDisputeDialog}
        escrowTransactionId={escrowTransactionId}
        onDisputeCreated={() => {
          setShowDisputeDialog(false);
          fetchTransaction();
        }}
      />
    </div>
  );
};

export default EscrowTransactionStatus;
