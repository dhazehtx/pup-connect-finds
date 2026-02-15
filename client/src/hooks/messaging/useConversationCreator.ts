
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
      const data = await apiRequest('/messaging/conversations/find-or-create', {
        method: 'POST',
        body: { seller_id: sellerId, listing_id: listingId }
      });

      return data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive",
      });
      return null;
    }
  }, [user, toast]);

  return {
    createConversation
  };
};
