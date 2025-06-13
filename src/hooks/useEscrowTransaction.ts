
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { EscrowTransaction } from '@/types/payment';

export const useEscrowTransaction = () => {
  const [transactions, setTransactions] = useState<EscrowTransaction[]>([]);
  const [currentTransaction, setCurrentTransaction] = useState<EscrowTransaction | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const createEscrowTransaction = useCallback(async (
    listingId: string,
    sellerId: string,
    amount: number,
    paymentMethodId: string
  ) => {
    if (!user) return null;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-escrow-transaction', {
        body: {
          listing_id: listingId,
          buyer_id: user.id,
          seller_id: sellerId,
          amount,
          payment_method_id: paymentMethodId
        }
      });

      if (error) throw error;

      setCurrentTransaction(data.transaction);
      toast({
        title: "Escrow Created",
        description: "Secure payment has been initiated",
      });

      return data;
    } catch (error) {
      console.error('Error creating escrow transaction:', error);
      toast({
        title: "Payment Error",
        description: "Failed to create secure payment",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const confirmMeeting = useCallback(async (transactionId: string, userType: 'buyer' | 'seller') => {
    if (!user) return;

    try {
      const confirmationField = userType === 'buyer' ? 'buyer_confirmed_at' : 'seller_confirmed_at';
      
      const { error } = await supabase
        .from('escrow_transactions')
        .update({ [confirmationField]: new Date().toISOString() })
        .eq('id', transactionId);

      if (error) throw error;

      // Check if both parties have confirmed
      const { data: transaction } = await supabase
        .from('escrow_transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (transaction?.buyer_confirmed_at && transaction?.seller_confirmed_at) {
        // Both confirmed, release funds
        await releaseFunds(transactionId);
      }

      toast({
        title: "Meeting Confirmed",
        description: `You have confirmed the meeting${transaction?.buyer_confirmed_at && transaction?.seller_confirmed_at ? '. Funds will be released shortly.' : '. Waiting for other party to confirm.'}`,
      });
    } catch (error) {
      console.error('Error confirming meeting:', error);
      toast({
        title: "Error",
        description: "Failed to confirm meeting",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  const releaseFunds = useCallback(async (transactionId: string) => {
    try {
      const { error } = await supabase.functions.invoke('release-escrow-funds', {
        body: { transaction_id: transactionId }
      });

      if (error) throw error;

      toast({
        title: "Funds Released",
        description: "Payment has been successfully transferred to the seller",
      });
    } catch (error) {
      console.error('Error releasing funds:', error);
      toast({
        title: "Error",
        description: "Failed to release funds",
        variant: "destructive",
      });
    }
  }, [toast]);

  const disputeTransaction = useCallback(async (transactionId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('escrow_transactions')
        .update({ 
          status: 'disputed',
          dispute_reason: reason,
          dispute_created_at: new Date().toISOString()
        })
        .eq('id', transactionId);

      if (error) throw error;

      toast({
        title: "Dispute Initiated",
        description: "Your dispute has been submitted for review",
      });
    } catch (error) {
      console.error('Error disputing transaction:', error);
      toast({
        title: "Error",
        description: "Failed to submit dispute",
        variant: "destructive",
      });
    }
  }, [toast]);

  const loadUserTransactions = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('escrow_transactions')
        .select(`
          *,
          listing:dog_listings(*),
          buyer:buyer_id(full_name, avatar_url),
          seller:seller_id(full_name, avatar_url)
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    transactions,
    currentTransaction,
    loading,
    createEscrowTransaction,
    confirmMeeting,
    releaseFunds,
    disputeTransaction,
    loadUserTransactions
  };
};
