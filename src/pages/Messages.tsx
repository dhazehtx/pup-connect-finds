
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import MessageInbox from '@/components/messaging/MessageInbox';
import { useConversationsManager } from '@/hooks/messaging/useConversationsManager';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Messages = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const { conversations, createConversation, fetchConversations } = useConversationsManager();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const contactUserId = searchParams.get('contact');
  const listingId = searchParams.get('listing');

  useEffect(() => {
    if (contactUserId && listingId && user) {
      handleContactFlow();
    }
  }, [contactUserId, listingId, user]);

  const handleContactFlow = async () => {
    if (!user || !contactUserId || !listingId) return;
    
    setLoading(true);
    
    try {
      // Check if conversation already exists
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .eq('listing_id', listingId)
        .eq('buyer_id', user.id)
        .eq('seller_id', contactUserId)
        .single();

      if (existingConversation) {
        // Navigate to existing conversation
        navigate(`/messages/${existingConversation.id}`);
        return;
      }

      // Create new conversation
      const conversationId = await createConversation(listingId, contactUserId);
      if (conversationId) {
        // Navigate to new conversation
        navigate(`/messages/${conversationId}`);
      }
    } catch (error) {
      console.error('Error handling contact flow:', error);
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      // Clear URL parameters
      setSearchParams({});
    }
  };

  const handleConversationSelect = (conversation: any) => {
    navigate(`/messages/${conversation.id}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <MessageInbox 
        onConversationSelect={handleConversationSelect}
        loading={loading}
      />
    </div>
  );
};

export default Messages;
