
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useConversationsManager } from '@/hooks/messaging/useConversationsManager';
import { formatDistanceToNow } from 'date-fns';

interface MessageInboxProps {
  onConversationSelect?: (conversation: any) => void;
  loading?: boolean;
}

const MessageInbox = ({ onConversationSelect, loading }: MessageInboxProps) => {
  const { user } = useAuth();
  const { conversations, loading: conversationsLoading } = useConversationsManager();

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">Stay connected with other pet lovers</p>
        </div>

        <Card>
          <CardContent className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sign in to view messages</h3>
            <p className="text-gray-600">Connect with breeders and other dog lovers</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isLoading = loading || conversationsLoading;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
        <p className="text-gray-600">Stay connected with other pet lovers</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Conversations
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent ml-2"></div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-2"></div>
              <p className="text-gray-600">Loading conversations...</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
              <p className="text-gray-600">Start browsing puppies to connect with breeders</p>
            </div>
          ) : (
            <div className="space-y-4">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => onConversationSelect?.(conversation)}
                  className="flex items-center space-x-4 p-4 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {conversation.other_user?.avatar_url ? (
                      <img 
                        src={conversation.other_user.avatar_url} 
                        alt={conversation.other_user.full_name || 'User'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-500 font-semibold">
                        {conversation.other_user?.full_name?.charAt(0) || '?'}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-gray-900 truncate">
                        {conversation.other_user?.full_name || conversation.other_user?.username || 'Unknown User'}
                      </h4>
                      {conversation.last_message_at && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    
                    {conversation.listing && (
                      <p className="text-sm text-gray-600 truncate">
                        About: {conversation.listing.dog_name} ({conversation.listing.breed})
                      </p>
                    )}
                    
                    {conversation.unread_count > 0 && (
                      <div className="flex items-center mt-2">
                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                          {conversation.unread_count} new
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {conversation.listing?.image_url && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                      <img 
                        src={conversation.listing.image_url} 
                        alt={conversation.listing.dog_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MessageInbox;
