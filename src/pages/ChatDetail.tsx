
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EnhancedChatInterface from '@/components/messaging/EnhancedChatInterface';
import { useMessaging } from '@/hooks/useMessaging';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';

const ChatDetail = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { conversations, loading } = useMessaging();
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation?.other_user) {
        setSelectedUser(conversation.other_user);
      }
    }
  }, [conversationId, conversations]);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-semibold mb-2">Sign in required</h3>
            <p className="text-gray-600 mb-4">Please sign in to view messages</p>
            <Button onClick={() => navigate('/auth')}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="animate-pulse">Loading conversation...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!conversationId || !selectedUser) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/messages')}
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-xl font-semibold">Conversation Not Found</h1>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-semibold mb-2">Conversation not found</h3>
            <p className="text-gray-600 mb-4">This conversation may have been deleted or you don't have access to it.</p>
            <Button onClick={() => navigate('/messages')}>Back to Messages</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background">
      <EnhancedChatInterface
        conversationId={conversationId}
        otherUser={selectedUser}
        onBack={() => navigate('/messages')}
      />
    </div>
  );
};

export default ChatDetail;
