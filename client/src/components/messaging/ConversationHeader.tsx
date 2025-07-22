
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { ChatUser } from '@/types/chat';

interface ConversationHeaderProps {
  onBack: () => void;
  otherUser: ChatUser | null;
  isUserOnline: boolean;
  activeConversations: number;
}

const ConversationHeader = ({ 
  onBack, 
  otherUser, 
  isUserOnline, 
  activeConversations 
}: ConversationHeaderProps) => {
  return (
    <CardHeader className="border-b bg-white sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <MessageCircle className="w-6 h-6 text-blue-600" />
          <div>
            <CardTitle className="text-lg">Messages</CardTitle>
            <p className="text-sm text-gray-500">
              {activeConversations} active conversations
            </p>
          </div>
        </div>
      </div>
    </CardHeader>
  );
};

export default ConversationHeader;
