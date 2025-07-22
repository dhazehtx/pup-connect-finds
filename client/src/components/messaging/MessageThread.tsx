
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Send } from 'lucide-react';
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

    const loadConversation = async () => {
      try {
        // Load conversation details
        const { data: convData, error: convError } = await supabase
          .from('conversations')
          .select(`
            *,
            listing:dog_listings!conversations_listing_id_dog_listings_id_fkey (
              id,
              dog_name,
              breed,
              image_url
            )
          `)
          .eq('id', activeConversationId)
          .single();

        if (convError) throw convError;

        // Get the other user's profile
        const otherUserId = convData.buyer_id === user.id ? convData.seller_id : convData.buyer_id;
        
        const { data: otherUserData } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', otherUserId)
          .single();

        setConversation({
          id: convData.id,
          other_user: otherUserData || { id: otherUserId, full_name: null, avatar_url: null },
          listing: Array.isArray(convData.listing) ? convData.listing[0] : convData.listing
        });

        // Load messages with proper error handling for sender_profile
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select(`
            *,
            sender_profile:profiles!messages_sender_id_fkey (
              full_name,
              avatar_url
            )
          `)
          .eq('conversation_id', activeConversationId)
          .order('created_at', { ascending: true });

        if (messagesError) throw messagesError;

        // Process messages to handle sender_profile properly
        const processedMessages = (messagesData || []).map(msg => ({
          ...msg,
          sender_profile: Array.isArray(msg.sender_profile) ? msg.sender_profile[0] : msg.sender_profile
        })) as Message[];

        setMessages(processedMessages);
      } catch (error) {
        console.error('Error loading conversation:', error);
        toast({
          title: "Error",
          description: "Failed to load conversation",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadConversation();

    // Set up real-time subscription
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
          
          // Fetch sender profile for the new message
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', newMessage.sender_id)
            .single();
          
          setMessages(prev => [...prev, {
            ...newMessage,
            sender_profile: senderProfile
          }]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversationId, user, toast]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !activeConversationId) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: activeConversationId,
          sender_id: user.id,
          content: newMessage.trim(),
          message_type: 'text'
        });

      if (error) throw error;

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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleBack = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/messages');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p>Conversation not found</p>
          <Button onClick={handleBack} className="mt-2">
            Back to Messages
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto">
      {/* Header */}
      <Card className="rounded-none border-b">
        <CardHeader className="p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <Avatar className="h-10 w-10">
              <AvatarImage src={conversation.other_user.avatar_url || undefined} />
              <AvatarFallback>
                {conversation.other_user.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h2 className="font-semibold text-lg">
                {conversation.other_user.full_name || 'User'}
              </h2>
              {conversation.listing && (
                <p className="text-sm text-muted-foreground">
                  About {conversation.listing.dog_name} ({conversation.listing.breed})
                </p>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.sender_id === user?.id;
            
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2 max-w-[70%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                  {!isOwnMessage && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={message.sender_profile?.avatar_url || undefined} />
                      <AvatarFallback>
                        {message.sender_profile?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div
                    className={`px-4 py-2 rounded-lg ${
                      isOwnMessage
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p>{message.content}</p>
                    <p className={`text-xs mt-1 ${isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {new Date(message.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <Card className="rounded-none border-t">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1"
              disabled={sending}
            />
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MessageThread;
