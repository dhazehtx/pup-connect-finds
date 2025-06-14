
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MessagingInterface from '@/components/messaging/MessagingInterface';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

const Messages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedConversationId, setSelectedConversationId] = useState<string>();

  React.useEffect(() => {
    document.title = 'Messages - My Pup';
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="border-blue-200 shadow-sm max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <MessageCircle className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h1>
            <p className="text-gray-600 mb-6">Please sign in to access your messages</p>
            <Button onClick={() => navigate('/auth')} className="bg-blue-600 hover:bg-blue-700">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">Stay connected with other pet lovers</p>
        </div>

        <MessagingInterface
          selectedConversationId={selectedConversationId}
          onConversationSelect={setSelectedConversationId}
        />
      </div>
    </div>
  );
};

export default Messages;
