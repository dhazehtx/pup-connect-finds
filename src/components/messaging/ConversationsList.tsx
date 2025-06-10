
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle } from 'lucide-react';

interface Conversation {
  id: string;
  listing_id: string | null;
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

interface ConversationsListProps {
  conversations: Conversation[];
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversationId?: string;
  loading?: boolean;
}

const ConversationsList = ({ 
  conversations, 
  onSelectConversation, 
  selectedConversationId,
  loading = false
}: ConversationsListProps) => {
  console.log('ConversationsList received conversations:', conversations);
  console.log('Selected conversation ID:', selectedConversationId);

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex items-center gap-3 p-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!conversations.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <MessageCircle className="w-12 h-12 text-gray-400 mb-4" />
        <h3 className="font-medium text-gray-900 mb-2">No conversations yet</h3>
        <p className="text-sm text-gray-500">
          Start browsing listings to connect with sellers.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      <div className="divide-y divide-gray-100">
        {conversations.map((conversation) => {
          const isSelected = selectedConversationId === conversation.id;
          const displayName = conversation.other_user?.full_name || 
                             conversation.other_user?.username || 
                             'Unknown User';
          const initials = displayName.charAt(0).toUpperCase();

          return (
            <div
              key={conversation.id}
              onClick={() => {
                console.log('Selecting conversation:', conversation.id);
                onSelectConversation(conversation);
              }}
              className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <img
                      src={conversation.other_user?.avatar_url || '/placeholder.svg'}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  </Avatar>
                  {conversation.unread_count && conversation.unread_count > 0 && (
                    <div className="absolute -top-1 -right-1">
                      <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                        {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                      </Badge>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-medium text-sm truncate ${
                      isSelected ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {displayName}
                    </h3>
                    {conversation.last_message_at && (
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                  
                  {conversation.listing && (
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-800 border-blue-200">
                        {conversation.listing.breed}
                      </Badge>
                      <span className="text-xs text-gray-600 truncate">
                        {conversation.listing.dog_name}
                      </span>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500">
                    About {conversation.listing?.dog_name || 'a listing'}
                  </p>
                </div>
                
                {conversation.listing?.image_url && (
                  <img
                    src={conversation.listing.image_url}
                    alt={conversation.listing.dog_name}
                    className="w-10 h-10 rounded object-cover flex-shrink-0"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConversationsList;
