
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

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
}

interface ConversationsListProps {
  conversations: Conversation[];
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversationId?: string;
}

const ConversationsList = ({ 
  conversations, 
  onSelectConversation, 
  selectedConversationId 
}: ConversationsListProps) => {
  return (
    <div className="divide-y divide-gray-100">
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          onClick={() => onSelectConversation(conversation)}
          className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
            selectedConversationId === conversation.id ? 'bg-blue-50' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="w-12 h-12">
                <img
                  src={conversation.other_user?.avatar_url || '/placeholder.svg'}
                  alt={conversation.other_user?.full_name || 'User'}
                  className="w-full h-full object-cover"
                />
              </Avatar>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-sm truncate text-black">
                  {conversation.other_user?.full_name || conversation.other_user?.username || 'Unknown User'}
                </h3>
                {conversation.last_message_at && (
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
                  </span>
                )}
              </div>
              
              {conversation.listing && (
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="text-xs">
                    {conversation.listing.breed}
                  </Badge>
                  <span className="text-xs text-gray-600 truncate">
                    {conversation.listing.dog_name}
                  </span>
                </div>
              )}
            </div>
            
            {conversation.listing?.image_url && (
              <img
                src={conversation.listing.image_url}
                alt={conversation.listing.dog_name}
                className="w-10 h-10 rounded object-cover"
              />
            )}
          </div>
        </div>
      ))}
      
      {conversations.length === 0 && (
        <div className="p-8 text-center">
          <div className="text-gray-400 mb-2">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="font-medium text-black mb-1">No conversations yet</h3>
          <p className="text-sm text-gray-500">
            Start browsing listings to connect with sellers.
          </p>
        </div>
      )}
    </div>
  );
};

export default ConversationsList;
