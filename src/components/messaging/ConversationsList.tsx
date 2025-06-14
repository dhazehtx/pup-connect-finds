
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, User } from 'lucide-react';

interface Conversation {
  id: string;
  buyer_id: string;
  seller_id: string;
  last_message_at?: string;
  buyer_profile?: any;
  seller_profile?: any;
  listing?: {
    dog_name: string;
    breed: string;
  };
}

interface ConversationsListProps {
  conversations: Conversation[];
  selectedConversationId?: string;
  onConversationSelect?: (conversationId: string) => void;
  getOtherUser: (conversation: Conversation) => any;
}

const ConversationsList = ({ 
  conversations, 
  selectedConversationId, 
  onConversationSelect, 
  getOtherUser 
}: ConversationsListProps) => {
  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Conversations
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No conversations yet
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map((conversation) => {
                const otherUser = getOtherUser(conversation);
                const isSelected = conversation.id === selectedConversationId;
                
                return (
                  <div
                    key={conversation.id}
                    className={`p-4 cursor-pointer border-b hover:bg-gray-50 ${
                      isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                    onClick={() => onConversationSelect?.(conversation.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        {otherUser?.avatar_url ? (
                          <img 
                            src={otherUser.avatar_url} 
                            alt="Avatar" 
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm truncate">
                            {otherUser?.full_name || otherUser?.username || 'Unknown User'}
                          </p>
                          {conversation.last_message_at && (
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                        {conversation.listing && (
                          <p className="text-xs text-gray-600 truncate">
                            {conversation.listing.dog_name} - {conversation.listing.breed}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ConversationsList;
