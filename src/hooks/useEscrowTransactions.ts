
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface EscrowTransaction {
  id: string;
  stripe_payment_intent_id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  commission_rate: number;
  commission_amount: number;
  seller_amount: number;
  status: string;
  buyer_confirmed_at?: string;
  seller_confirmed_at?: string;
  meeting_location?: string;
  meeting_scheduled_at?: string;
  dispute_reason?: string;
  dispute_created_at?: string;
  funds_released_at?: string;
  created_at: string;
  updated_at: string;
  dog_listings?: {
    dog_name: string;
    breed: string;
    image_url?: string;
  } | null;
}

export const useEscrowTransactions = (userId?: string) => {
  const [transactions, setTransactions] = useState<EscrowTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('escrow_transactions')
        .select(`
          *,
          dog_listings (
            dog_name,
            breed,
            image_url
          )
        `)
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Type assertion to handle the Supabase response structure
      const typedData = (data || []) as EscrowTransaction[];
      setTransactions(typedData);
    } catch (error: any) {
      console.error('Error fetching escrow transactions:', error);
      toast({
        title: "Failed to load transactions",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [userId]);

  const getTransactionsByStatus = (status: string) => {
    return transactions.filter(tx => tx.status === status);
  };

  const getUserRole = (transaction: EscrowTransaction, currentUserId: string) => {
    return transaction.buyer_id === currentUserId ? 'buyer' : 'seller';
  };

  const getTransactionStats = () => {
    const total = transactions.length;
    const pending = transactions.filter(tx => 
      tx.status === 'pending' || 
      tx.status === 'funds_held' || 
      tx.status === 'buyer_confirmed' || 
      tx.status === 'seller_confirmed'
    ).length;
    const completed = transactions.filter(tx => tx.status === 'completed').length;
    const disputed = transactions.filter(tx => tx.status === 'disputed').length;

    return { total, pending, completed, disputed };
  };

  return {
    transactions,
    loading,
    fetchTransactions,
    getTransactionsByStatus,
    getUserRole,
    getTransactionStats
  };
};
