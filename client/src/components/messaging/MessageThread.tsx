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

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-white sticky top-0 z-10">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onClose ? onClose() : navigate('/messages')}
          className="p-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        
        <Avatar className="w-10 h-10">
          <AvatarImage src={conversation.other_user.avatar_url || undefined} />
          <AvatarFallback>
            {conversation.other_user.full_name?.[0] || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <h2 className="font-semibold text-gray-900">
            {conversation.other_user.full_name || 'Unknown User'}
          </h2>
          {conversation.listing && (
            <p className="text-sm text-gray-600">
              About {conversation.listing.dog_name} • {conversation.listing.breed}
            </p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id}
              className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender_id === user?.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-900'
              }`}>
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.sender_id === user?.id ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {new Date(message.created_at).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t bg-white">
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
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            size="sm"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessageThread;