
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import MessageInbox from '@/components/messaging/MessageInbox';
import EnhancedChatInterface from '@/components/messaging/EnhancedChatInterface';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';

const Messages = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const contactSellerId = searchParams.get('contact');
  const listingId = searchParams.get('listing');

  useEffect(() => {
    const handleContactParams = async () => {
      if (contactSellerId && listingId && user) {
        setIsLoading(true);
        
        // For now, simulate conversation creation
        // In a real app, this would check for existing conversations or create new ones
        setTimeout(() => {
          setSelectedConversationId(`conv_${contactSellerId}_${listingId}`);
          setSelectedUser({
            id: contactSellerId,
            full_name: 'Seller',
            avatar_url: undefined
          });
          setIsLoading(false);
        }, 1000);
      }
    };

    handleContactParams();
  }, [contactSellerId, listingId, user]);

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

  // Show loading state if we're processing contact parameters
  if (isLoading && contactSellerId) {
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
