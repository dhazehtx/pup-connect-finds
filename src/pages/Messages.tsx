
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, User, ArrowLeft } from 'lucide-react';
import UnifiedMessagingInterface from '@/components/messaging/UnifiedMessagingInterface';
import EnhancedChatInterface from '@/components/messaging/EnhancedChatInterface';

const Messages = () => {
  const { user, isGuest } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<{
    id: string;
    otherUserId: string;
    listingId?: string;
  } | null>(null);

  if (!user && !isGuest) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <Card>
          <CardContent className="py-12 text-center">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">Connect with Breeders</h2>
            <p className="text-muted-foreground mb-6">
              Sign in to start conversations with dog breeders and find your perfect companion.
            </p>
            <Button size="lg">
              <User className="w-4 h-4 mr-2" />
              Sign In to Start Messaging
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show individual conversation interface
  if (selectedConversation) {
    return (
      <div className="h-screen bg-background">
        <div className="h-full">
          <EnhancedChatInterface
            conversationId={selectedConversation.id}
            otherUserId={selectedConversation.otherUserId}
            listingId={selectedConversation.listingId}
            onBack={() => setSelectedConversation(null)}
          />
        </div>
      </div>
    );
  }

  // Show conversations list interface
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl">
        <UnifiedMessagingInterface />
      </div>
    </div>
  );
};

export default Messages;
