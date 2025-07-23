import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Send, Smile } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  message_type: string;
  sender_profile?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface ConversationData {
  id: string;
  other_user: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  listing?: {
    id: string;
    dog_name: string;
    breed: string;
    image_url: string | null;
  };
}

interface MessageThreadProps {
  parentMessage?: any;
  onClose?: () => void;
  conversationId?: string;
}

const MessageThread = ({ parentMessage, onClose, conversationId: propConversationId }: MessageThreadProps) => {
  const { conversationId: paramConversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Use prop conversationId if provided, otherwise use URL param
  const activeConversationId = propConversationId || paramConversationId;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversation, setConversation] = useState<ConversationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversation and messages
  useEffect(() => {
    if (!activeConversationId || !user) return;

    const loadConversationData = async () => {
      setLoading(true);
      try {
        console.log('Loading conversation:', activeConversationId);

        // Load conversation details first
        const { data: convData, error: convError } = await supabase
          .from('conversations')
          .select(`
            id,
            buyer_id,
            seller_id,
            listing_id,
            dog_listings!conversations_listing_id_dog_listings_id_fkey (
              id,
              dog_name,
              breed,
              image_url
            )
          `)
          .eq('id', activeConversationId)
          .single();

        if (convError) {
          console.error('Error loading conversation:', convError);
          toast({
            title: "Error",
            description: "Failed to load conversation",
            variant: "destructive",
          });
          return;
        }

        // Determine the other user
        const otherUserId = convData.buyer_id === user.id ? convData.seller_id : convData.buyer_id;
        
        // Fetch other user's profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', otherUserId)
          .single();

        if (profileError) {
          console.error('Error loading profile:', profileError);
        }

        // Set conversation data
        setConversation({
          id: convData.id,
          other_user: {
            id: otherUserId,
            full_name: profileData?.full_name || 'Unknown User',
            avatar_url: profileData?.avatar_url || null
          },
          listing: convData.dog_listings ? {
            id: convData.dog_listings.id,
            dog_name: convData.dog_listings.dog_name,
            breed: convData.dog_listings.breed,
            image_url: convData.dog_listings.image_url
          } : undefined
        });

        // Load messages with profiles manually joined
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', activeConversationId)
          .order('created_at', { ascending: true });

        if (messagesError) {
          console.error('Error loading messages:', messagesError);
          toast({
            title: "Error",
            description: "Failed to load messages",
            variant: "destructive",
          });
          return;
        }

        // Fetch profiles for all unique sender IDs
        const senderIds = [...new Set(messagesData.map(msg => msg.sender_id))];
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', senderIds);

        if (profilesError) {
          console.error('Error loading sender profiles:', profilesError);
        }

        // Combine messages with profile data
        const messagesWithProfiles = messagesData.map(msg => ({
          ...msg,
          sender_profile: profilesData?.find(p => p.id === msg.sender_id) || null
        }));

        setMessages(messagesWithProfiles);
      } catch (error) {
        console.error('Error in loadConversationData:', error);
        toast({
          title: "Error",
          description: "Failed to load conversation data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadConversationData();

    // Set up real-time subscription for new messages
    const channel = supabase
      .channel(`messages-${activeConversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${activeConversationId}`
        },
        async (payload) => {
          const newMessage = payload.new as Message;
          console.log('New message received via realtime:', newMessage.id);
          
          // Fetch sender profile for the new message
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .eq('id', newMessage.sender_id)
            .single();

          const messageWithProfile = {
            ...newMessage,
            sender_profile: senderProfile || null
          };

          setMessages(prev => [...prev, messageWithProfile]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversationId, user, toast]);

  // Send message function
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversationId || !user || sending) return;

    setSending(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: activeConversationId,
          sender_id: user.id,
          content: newMessage.trim(),
          message_type: 'text'
        })
        .select()
        .single();

      if (error) throw error;

      // Update conversation last message timestamp
      await supabase
        .from('conversations')
        .update({ 
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', activeConversationId);

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex flex-col h-screen">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Conversation not found</h3>
            <p className="text-gray-600">This conversation may have been deleted or you don't have access to it.</p>
          </div>
        </div>
      </div>
    );
  }

  // Group consecutive messages from the same sender
  const groupMessages = (messages: Message[]) => {
    const groups: Array<{
      sender_id: string;
      messages: Message[];
      timestamp: string;
      sender_profile?: any;
    }> = [];

    messages.forEach((message, index) => {
      const prevMessage = messages[index - 1];
      const isSameSender = prevMessage && prevMessage.sender_id === message.sender_id;
      const timeDiff = prevMessage ? 
        new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() : 0;
      const shouldGroup = isSameSender && timeDiff < 300000; // Group within 5 minutes

      if (shouldGroup) {
        groups[groups.length - 1].messages.push(message);
      } else {
        groups.push({
          sender_id: message.sender_id,
          messages: [message],
          timestamp: message.created_at,
          sender_profile: message.sender_profile
        });
      }
    });

    return groups;
  };

  const messageGroups = groupMessages(messages);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50/30 to-purple-50/30">
      {/* Modern Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white/80 backdrop-blur-sm border-b border-gray-200/60 sticky top-0 z-10 shadow-sm">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onClose ? onClose() : navigate('/messages')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Button>
        
        <Avatar className="w-11 h-11 ring-2 ring-white shadow-sm">
          <AvatarImage src={conversation.other_user.avatar_url || undefined} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
            {conversation.other_user.full_name?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-gray-900 truncate">
            {conversation.other_user.full_name || 'Unknown User'}
          </h2>
          {conversation.listing && (
            <p className="text-sm text-gray-500 truncate">
              About {conversation.listing.dog_name} • {conversation.listing.breed}
            </p>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 mx-auto max-w-sm shadow-sm">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Start the conversation</h3>
              <p className="text-gray-600 text-sm">Send your first message to begin chatting!</p>
            </div>
          </div>
        ) : (
          messageGroups.map((group, groupIndex) => {
            const isOwnMessage = group.sender_id === user?.id;
            return (
              <div key={groupIndex} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                {/* Avatar for received messages */}
                {!isOwnMessage && (
                  <Avatar className="w-8 h-8 mb-1 ring-2 ring-white shadow-sm flex-shrink-0">
                    <AvatarImage src={group.sender_profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-gray-400 to-gray-600 text-white text-xs font-semibold">
                      {group.sender_profile?.full_name?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                )}

                {/* Message Group */}
                <div className={`flex flex-col max-w-xs sm:max-w-sm lg:max-w-md ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                  {/* Messages */}
                  {group.messages.map((message, messageIndex) => (
                    <div
                      key={message.id}
                      className={`mb-1 px-4 py-2.5 rounded-2xl shadow-sm ${
                        isOwnMessage
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
                          : 'bg-white text-gray-900 rounded-bl-md border border-gray-100'
                      } ${messageIndex === 0 ? (isOwnMessage ? 'rounded-tr-2xl' : 'rounded-tl-2xl') : ''} ${
                        messageIndex === group.messages.length - 1 ? (isOwnMessage ? 'rounded-br-md' : 'rounded-bl-md') : ''
                      }`}
                    >
                      <p className="text-sm leading-relaxed break-words">{message.content}</p>
                    </div>
                  ))}
                  
                  {/* Timestamp */}
                  <div className={`mt-1 px-2 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                    <span className="text-xs text-gray-500">
                      {new Date(group.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Modern Message Input */}
      <div className="px-4 py-4 bg-white/80 backdrop-blur-sm border-t border-gray-200/60">
        <div className="flex items-end gap-3 max-w-4xl mx-auto">
          <div className="flex-1 bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="border-0 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-blue-500/20 resize-none text-sm bg-transparent"
              disabled={sending}
            />
          </div>
          
          <Button 
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className="rounded-full w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:hover:shadow-lg"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessageThread;