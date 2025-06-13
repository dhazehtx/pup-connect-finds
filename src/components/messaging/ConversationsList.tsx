
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, MessageCircle } from 'lucide-react';
import { useMessaging } from '@/hooks/useMessaging';
import { useAuth } from '@/contexts/AuthContext';

interface ConversationsListProps {
  onSelectConversation: (conversationId: string, otherUser: any) => void;
  selectedConversationId?: string;
}

const ConversationsList = ({ onSelectConversation, selectedConversationId }: ConversationsListProps) => {
  const { conversations } = useMessaging();
  const { user } = useAuth();

  const getOtherUser = (conversation: any) => {
    const isUserBuyer = conversation.buyer_id === user?.id;
    return isUserBuyer ? conversation.seller : conversation.buyer;
  };

  const formatLastMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Messages
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search conversations..."
            className="pl-10"
          />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="space-y-1">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No conversations yet</p>
              <p className="text-sm">Start browsing listings to connect with sellers</p>
            </div>
          ) : (
            conversations.map((conversation) => {
              const otherUser = getOtherUser(conversation);
              const isSelected = conversation.id === selectedConversationId;

              return (
                <div
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation.id, otherUser)}
                  className={`flex items-center p-4 cursor-pointer transition-colors hover:bg-gray-50 border-l-4 ${
                    isSelected 
                      ? 'bg-blue-50 border-l-blue-500' 
                      : 'border-l-transparent hover:border-l-gray-200'
                  }`}
                >
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={otherUser?.avatar_url} />
                    <AvatarFallback>
                      {otherUser?.full_name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm truncate">
                        {otherUser?.full_name || 'Unknown User'}
                      </h4>
                      <span className="text-xs text-gray-500 ml-2">
                        {formatLastMessageTime(conversation.last_message_at)}
                      </span>
                    </div>

                    {conversation.listing && (
                      <p className="text-xs text-gray-600 truncate mt-1">
                        About: {conversation.listing.title}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-gray-500 truncate">
                        Tap to continue conversation...
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        Active
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationsList;
