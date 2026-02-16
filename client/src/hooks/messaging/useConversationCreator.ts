
import { useCallback } from 'react';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useConversationCreator = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const createConversation = useCallback(async (listingId: string, sellerId: string) => {
    if (!user) return null;

    try {
      const data = await apiRequest('/api/messaging/conversations/find-or-create', {
        method: 'POST',
        body: { seller_id: sellerId, listing_id: listingId }
      });
      console.log('[PROOF:MSG] createConversation response', JSON.stringify(data));
      return data;
    } catch (error: any) {
      console.error('[PROOF:MSG] createConversation error', error);
      const msg = error?.message || '';
      toast({
        title: "Couldn't start conversation",
        description: msg.includes('404') ? "User profile not found" : "Failed to create conversation",
        variant: "destructive",
      });
      return null;
    }
  }, [user, toast]);

  return {
    createConversation
  };
};
