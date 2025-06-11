
import React from 'react';
import { MessageCircle, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface Conversation {
  id: string;
  listing_id: string | null;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
  listing?: {
    dog_name: string;
    breed: string;
    image_url: string | null;
  };
  other_user?: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
  unread_count?: number;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId: string;
  onSelectConversation: (conversationId: string) => void;
  loading: boolean;
}

const ConversationList = ({ 
  conversations, 
  selectedConversationId, 
  onSelectConversation, 
  loading 
}: ConversationListProps) => {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600">Loading conversations...</p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No conversations yet</p>
        <p className="text-sm text-gray-500 mt-1">
          Start browsing listings to connect with breeders
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => (
        <Card 
          key={conversation.id}
          className={`cursor-pointer transition-colors hover:bg-gray-50 ${
            selectedConversationId === conversation.id ? 'bg-blue-50 border-blue-200' : ''
          }`}
          onClick={() => onSelectConversation(conversation.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={conversation.other_user?.avatar_url || ''} />
                  <AvatarFallback>
                    <User className="w-6 h-6" />
                  </AvatarFallback>
                </Avatar>
                {conversation.unread_count && conversation.unread_count > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {conversation.unread_count}
                  </Badge>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {conversation.other_user?.full_name || conversation.other_user?.username || 'Anonymous'}
                  </h3>
                  {conversation.last_message_at && (
                    <span className="text-xs text-gray-500">
                      {new Date(conversation.last_message_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
                
                {conversation.listing && (
                  <p className="text-sm text-gray-600 truncate">
                    About: {conversation.listing.dog_name} ({conversation.listing.breed})
                  </p>
                )}
                
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">
                    {conversation.last_message_at ? 'Recent activity' : 'New conversation'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ConversationList;
