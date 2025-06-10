
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { ExtendedConversation } from '@/types/messaging';

interface ConversationListProps {
  conversations: ExtendedConversation[];
  selectedConversationId: string;
  onSelectConversation: (conversationId: string) => void;
  loading: boolean;
  isUserOnline?: (userId: string) => boolean;
}

const ConversationList = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  loading,
  isUserOnline
}: ConversationListProps) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <LoadingSkeleton key={i} viewMode="list" count={1} />
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No conversations yet</p>
        <p className="text-sm text-muted-foreground">Start browsing listings to begin chatting</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => {
        const isSelected = conversation.id === selectedConversationId;
        const otherUser = conversation.other_user || {};
        const isOnline = isUserOnline && otherUser && typeof otherUser === 'object' && 'id' in otherUser 
          ? isUserOnline(otherUser.id as string) 
          : false;

        return (
          <Card
            key={conversation.id}
            className={`cursor-pointer transition-colors hover:bg-muted/50 ${
              isSelected ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onSelectConversation(conversation.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={
                      otherUser && typeof otherUser === 'object' && 'avatar_url' in otherUser 
                        ? otherUser.avatar_url as string || '' 
                        : ''
                    } />
                    <AvatarFallback>
                      {otherUser && typeof otherUser === 'object' && 'full_name' in otherUser
                        ? (otherUser.full_name as string || 'U').charAt(0)
                        : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm truncate">
                      {otherUser && typeof otherUser === 'object' && 'full_name' in otherUser
                        ? otherUser.full_name as string ||
                          ('username' in otherUser ? otherUser.username as string : 'Anonymous User')
                        : 'Anonymous User'}
                    </h3>
                    {conversation.last_message_at && (
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(conversation.last_message_at), { 
                          addSuffix: true 
                        })}
                      </span>
                    )}
                  </div>

                  {conversation.listing && (
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {conversation.listing.dog_name}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {conversation.listing.breed}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm text-muted-foreground truncate">
                      {otherUser && typeof otherUser === 'object' && 'bio' in otherUser
                        ? otherUser.bio as string || 'No bio available'
                        : 'No bio available'}
                    </p>
                    {conversation.unread_count && conversation.unread_count > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {conversation.unread_count}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ConversationList;
