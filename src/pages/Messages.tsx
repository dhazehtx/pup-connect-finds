
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import MessageInbox from '@/components/messaging/MessageInbox';
import EnhancedChatInterface from '@/components/messaging/EnhancedChatInterface';
import { useMessaging } from '@/hooks/useMessaging';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';

const Messages = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { conversations, startConversation } = useMessaging();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isInitiatingContact, setIsInitiatingContact] = useState(false);

  const contactSellerId = searchParams.get('contact');
  const listingId = searchParams.get('listing');

  useEffect(() => {
    const initiateContact = async () => {
      if (contactSellerId && listingId && user && !isInitiatingContact) {
        setIsInitiatingContact(true);
        
        // Check if conversation already exists
        const existingConversation = conversations.find(conv => 
          (conv.seller_id === contactSellerId && conv.buyer_id === user.id) ||
          (conv.buyer_id === contactSellerId && conv.seller_id === user.id)
        );

        if (existingConversation) {
          setSelectedConversationId(existingConversation.id);
          setSelectedUser(existingConversation.other_user);
        } else {
          try {
            const newConversationId = await startConversation(contactSellerId, listingId);
            if (newConversationId) {
              setSelectedConversationId(newConversationId);
              setSelectedUser({
                id: contactSellerId,
                full_name: 'Seller',
                avatar_url: undefined
              });
            }
          } catch (error) {
            console.error('Failed to start conversation:', error);
          }
        }
        
        setIsInitiatingContact(false);
      }
    };

    initiateContact();
  }, [contactSellerId, listingId, user, conversations, startConversation, isInitiatingContact]);

  // Show chat interface if we have a selected conversation
  if (selectedConversationId && selectedUser) {
    return (
      <Layout>
        <EnhancedChatInterface
          conversationId={selectedConversationId}
          otherUser={selectedUser}
          onBack={() => {
            setSelectedConversationId(null);
            setSelectedUser(null);
          }}
        />
      </Layout>
    );
  }

  // Show loading state if we're initiating contact
  if (isInitiatingContact && contactSellerId) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Card>
            <CardContent className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-semibold mb-2">Starting conversation...</h3>
              <p className="text-gray-600">Please wait while we set up your message thread</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Default to showing the message inbox
  return (
    <Layout>
      <MessageInbox />
    </Layout>
  );
};

export default Messages;
