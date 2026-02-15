
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

import MessageInbox from '@/components/messaging/MessageInbox';
import { useConversationsManager } from '@/hooks/messaging/useConversationsManager';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const DEBUG = import.meta.env.DEV && false;

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
    if (DEBUG) console.debug('[MESSAGES PAGE] Component state changed', { user: !!user, loading, conversationsCount: conversations.length });  
  }, [user, loading, conversations.length]);

  useEffect(() => {
    if (DEBUG) console.debug('[MESSAGES PAGE] Component mounted');
  }, []);

  useEffect(() => {
    if (DEBUG) console.debug('[MESSAGES PAGE] Auth state changed:', { user: !!user });
  }, [user]);

  useEffect(() => {
    if (contactUserId && listingId && user) {
      handleContactFlow();
    }
  }, [contactUserId, listingId, user]);

  const handleContactFlow = async () => {
    if (!user || !contactUserId || !listingId) return;
    
    setLoading(true);
    
    try {
      const result = await apiRequest('/messaging/conversations/find-or-create', {
        method: 'POST',
        body: {
          listing_id: listingId,
          seller_id: contactUserId
        }
      });

      if (result?.id) {
        navigate(`/messages/${result.id}`);
        return;
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
      setSearchParams({});
    }
  };

  const handleConversationSelect = (conversation: any) => {
    navigate(`/messages/${conversation.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-20">
      <div className="mb-4 sm:mb-6 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Messages</h1>
        <p className="text-sm sm:text-base text-gray-600">Stay connected with other pet lovers</p>
      </div>
      <MessageInbox 
        onConversationSelect={handleConversationSelect}
        loading={loading}
      />
    </div>
  );
};

export default Messages;
