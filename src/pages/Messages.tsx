
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import MessageInbox from '@/components/messaging/MessageInbox';
import ConversationView from '@/components/messaging/ConversationView';
import { useConversationsManager } from '@/hooks/messaging/useConversationsManager';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Messages = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const { conversations, createConversation, fetchConversations } = useConversationsManager();
  const { user } = useAuth();
  const { toast } = useToast();

  const contactUserId = searchParams.get('contact');
  const listingId = searchParams.get('listing');

  useEffect(() => {
    if (contactUserId && listingId && user) {
      handleContactFlow();
    }
  }, [contactUserId, listingId, user, conversations]);

  const handleContactFlow = async () => {
    if (!user || !contactUserId || !listingId) return;
    
    setLoading(true);
    
    try {
      // Check if conversation already exists
      const existingConversation = conversations.find(conv => 
        conv.listing_id === listingId &&
        ((conv.buyer_id === user.id && conv.seller_id === contactUserId) ||
         (conv.seller_id === user.id && conv.buyer_id === contactUserId))
      );

      if (existingConversation) {
        // Open existing conversation
        await openConversation(existingConversation);
      } else {
        // Create new conversation
        const conversationId = await createConversation(listingId, contactUserId);
        if (conversationId) {
          // Fetch updated conversations and open the new one
          await fetchConversations();
          const newConversation = conversations.find(conv => conv.id === conversationId);
          if (newConversation) {
            await openConversation(newConversation);
          }
        }
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

  const openConversation = async (conversation) => {
    // Fetch additional conversation details if needed
    try {
      const { data: listingData } = await supabase
        .from('dog_listings')
        .select('dog_name, breed, image_url, price')
        .eq('id', conversation.listing_id)
        .single();

      const { data: otherUserData } = await supabase
        .from('profiles')
        .select('full_name, username, avatar_url')
        .eq('id', conversation.buyer_id === user.id ? conversation.seller_id : conversation.buyer_id)
        .single();

      const enhancedConversation = {
        ...conversation,
        listing: listingData,
        other_user: otherUserData
      };

      setSelectedConversation(enhancedConversation);
    } catch (error) {
      console.error('Error fetching conversation details:', error);
      setSelectedConversation(conversation);
    }
  };

  const handleBackToInbox = () => {
    setSelectedConversation(null);
  };

  const handleConversationSelect = (conversation) => {
    openConversation(conversation);
  };

  if (selectedConversation) {
    return (
      <Layout>
        <ConversationView 
          conversation={selectedConversation}
          onBack={handleBackToInbox}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <MessageInbox 
        onConversationSelect={handleConversationSelect}
        loading={loading}
      />
    </Layout>
  );
};

export default Messages;
