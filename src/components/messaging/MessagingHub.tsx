
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMessaging } from '@/hooks/useMessaging';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Search, MessageCircle, User, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface MessagingHubProps {
  onSelectConversation: (conversationId: string, otherUserId: string) => void;
  onStartNewConversation?: () => void;
}

const MessagingHub = ({ onSelectConversation, onStartNewConversation }: MessagingHubProps) => {
  const { user } = useAuth();
  const { conversations, loading, fetchConversations } = useMessaging();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, fetchConversations]);

  const filteredConversations = conversations.filter(conv =>
    conv.other_user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.other_user?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.listing?.dog_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">
            Connect with breeders and buyers
          </p>
        </div>
        {onStartNewConversation && (
          <Button onClick={onStartNewConversation}>
            <Plus className="w-4 h-4 mr-2" />
            New Conversation
          </Button>
        )}
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Conversations List */}
      {filteredConversations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No conversations yet</h3>
            <p className="text-muted-foreground mb-6">
              Start browsing listings to connect with breeders and begin conversations.
            </p>
            <Button variant="outline">
              Browse Listings
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Recent Conversations
              <Badge variant="secondary">{filteredConversations.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              <div className="space-y-1">
                {filteredConversations.map((conversation) => {
                  const otherUserId = conversation.buyer_id === user?.id 
                    ? conversation.seller_id 
                    : conversation.buyer_id;

                  return (
                    <div
                      key={conversation.id}
                      className="flex items-center gap-4 p-4 hover:bg-muted/50 cursor-pointer border-b last:border-b-0 transition-colors"
                      onClick={() => onSelectConversation(conversation.id, otherUserId)}
                    >
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={conversation.other_user?.avatar_url || undefined} />
                        <AvatarFallback>
                          <User className="w-6 h-6" />
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium truncate">
                            {conversation.other_user?.full_name || 
                             conversation.other_user?.username || 
                             'Unknown User'}
                          </h4>
                          {conversation.last_message_at && (
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
                            </span>
                          )}
                        </div>

                        {conversation.listing && (
                          <p className="text-sm text-muted-foreground truncate mb-1">
                            Re: {conversation.listing.dog_name} ({conversation.listing.breed})
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Tap to open conversation
                          </span>
                          {(conversation.unread_count && conversation.unread_count > 0) && (
                            <Badge variant="default" className="text-xs">
                              {conversation.unread_count}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MessagingHub;
