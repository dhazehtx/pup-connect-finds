import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Send, Smile, Check, CheckCheck, MoreVertical, Moon, Sun } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';
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
  const { theme, toggleTheme } = useTheme();
  
  // Use prop conversationId if provided, otherwise use URL param
  const activeConversationId = propConversationId || paramConversationId;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversation, setConversation] = useState<ConversationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState<string | null>(null);
  const [messageStatuses, setMessageStatuses] = useState<Record<string, 'sent' | 'delivered' | 'read'>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
        const senderIds = Array.from(new Set(messagesData.map(msg => msg.sender_id)));
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
          content: msg.content || '',
          sender_profile: profilesData?.find(p => p.id === msg.sender_id) || null
        })) as Message[];

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

    // Set up real-time subscriptions
    const messageChannel = supabase
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
            content: newMessage.content || '',
            sender_profile: senderProfile || null
          } as Message;

          setMessages(prev => [...prev, messageWithProfile]);
          
          // Update message status to delivered for others' messages
          if (newMessage.sender_id !== user.id) {
            updateMessageStatus(newMessage.id, 'delivered');
          }
        }
      )
      .subscribe();

    // Typing indicator subscription
    const typingChannel = supabase
      .channel(`typing-${activeConversationId}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { user_id, user_name, is_typing } = payload.payload;
        if (user_id !== user.id) {
          if (is_typing) {
            setTyping(user_name);
          } else {
            setTyping(null);
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(typingChannel);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
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
      
      // Update message status to sent
      if (data) {
        updateMessageStatus(data.id, 'sent');
        
        // Simulate delivery after a short delay
        setTimeout(() => {
          updateMessageStatus(data.id, 'delivered');
        }, 1000);
      }
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

  // Handle typing indicators
  const handleTyping = () => {
    if (!activeConversationId || !user) return;

    // Send typing event
    supabase.channel(`typing-${activeConversationId}`)
      .send({
        type: 'broadcast',
        event: 'typing',
        payload: { 
          user_id: user.id, 
          user_name: user.user_metadata?.full_name || 'Someone',
          is_typing: true 
        }
      });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      supabase.channel(`typing-${activeConversationId}`)
        .send({
          type: 'broadcast',
          event: 'typing',
          payload: { 
            user_id: user.id, 
            is_typing: false 
          }
        });
    }, 2000);
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle profile navigation
  const handleProfileClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  // Message status update
  const updateMessageStatus = (messageId: string, status: 'sent' | 'delivered' | 'read') => {
    setMessageStatuses(prev => ({
      ...prev,
      [messageId]: status
    }));
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
    <div className={`flex flex-col h-screen transition-colors duration-200 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
        : 'bg-gradient-to-br from-blue-50/30 to-purple-50/30'
    }`}>
      {/* Modern Header */}
      <div className={`flex items-center gap-3 px-4 py-3 backdrop-blur-sm border-b sticky top-0 z-10 shadow-sm ${
        theme === 'dark'
          ? 'bg-gray-800/90 border-gray-700/60'
          : 'bg-white/80 border-gray-200/60'
      }`}>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onClose ? onClose() : navigate('/messages')}
          className={`p-2 rounded-full transition-colors ${
            theme === 'dark' 
              ? 'hover:bg-gray-700 text-gray-300' 
              : 'hover:bg-gray-100 text-gray-600'
          }`}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <Avatar 
          className="w-11 h-11 ring-2 ring-white dark:ring-gray-600 shadow-sm cursor-pointer hover:scale-105 transition-transform"
          onClick={() => handleProfileClick(conversation.other_user.id)}
        >
          <AvatarImage src={conversation.other_user.avatar_url || undefined} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
            {conversation.other_user.full_name?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <h2 className={`font-semibold truncate ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {conversation.other_user.full_name || 'Unknown User'}
          </h2>
          {conversation.listing && (
            <p className={`text-sm truncate ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              About {conversation.listing.dog_name} • {conversation.listing.breed}
            </p>
          )}
        </div>

        {/* Dark Mode Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className={`p-2 rounded-full transition-colors ${
            theme === 'dark' 
              ? 'hover:bg-gray-700 text-gray-300' 
              : 'hover:bg-gray-100 text-gray-600'
          }`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <div className={`backdrop-blur-sm rounded-2xl p-6 mx-auto max-w-sm shadow-sm ${
                theme === 'dark' ? 'bg-gray-800/60' : 'bg-white/60'
              }`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                  theme === 'dark' 
                    ? 'bg-gradient-to-br from-blue-900/50 to-purple-900/50' 
                    : 'bg-gradient-to-br from-blue-100 to-purple-100'
                }`}>
                  <Send className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Start the conversation
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Send your first message to begin chatting!
                </p>
              </div>
            </div>
          ) : (
            messageGroups.map((group, groupIndex) => {
              const isOwnMessage = group.sender_id === user?.id;
              return (
                <div key={groupIndex} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                {/* Avatar for received messages */}
                {!isOwnMessage && (
                  <Avatar 
                    className="w-8 h-8 mb-1 ring-2 ring-white dark:ring-gray-600 shadow-sm flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => handleProfileClick(group.sender_id)}
                  >
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
                    <div key={message.id} className="relative">
                      <div
                        className={`mb-1 px-4 py-2.5 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${
                          isOwnMessage
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
                            : theme === 'dark'
                            ? 'bg-gray-700 text-gray-100 rounded-bl-md border border-gray-600'
                            : 'bg-white text-gray-900 rounded-bl-md border border-gray-100'
                        } ${messageIndex === 0 ? (isOwnMessage ? 'rounded-tr-2xl' : 'rounded-tl-2xl') : ''} ${
                          messageIndex === group.messages.length - 1 ? (isOwnMessage ? 'rounded-br-md' : 'rounded-bl-md') : ''
                        }`}
                      >
                        <p className="text-sm leading-relaxed break-words">{message.content}</p>
                      </div>
                      
                      {/* Message Status for own messages */}
                      {isOwnMessage && messageIndex === group.messages.length - 1 && (
                        <div className="flex items-center justify-end mt-1 px-2">
                          {messageStatuses[message.id] === 'read' ? (
                            <CheckCheck className="w-3 h-3 text-blue-500" />
                          ) : messageStatuses[message.id] === 'delivered' ? (
                            <CheckCheck className={`w-3 h-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                          ) : (
                            <Check className={`w-3 h-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Timestamp */}
                  <div className={`mt-1 px-2 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
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
          
          {/* Typing Indicator */}
          {typing && (
            <div className="flex justify-start items-end gap-2 animate-pulse">
              <Avatar className="w-8 h-8 ring-2 ring-white dark:ring-gray-600 shadow-sm flex-shrink-0">
                <AvatarFallback className="bg-gradient-to-br from-gray-400 to-gray-600 text-white text-xs font-semibold">
                  {typing[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className={`px-4 py-2.5 rounded-2xl rounded-bl-md shadow-sm ${
                theme === 'dark' 
                  ? 'bg-gray-700 border border-gray-600' 
                  : 'bg-white border border-gray-100'
              }`}>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full animate-bounce ${
                    theme === 'dark' ? 'bg-gray-400' : 'bg-gray-500'
                  }`} style={{ animationDelay: '0ms' }}></div>
                  <div className={`w-2 h-2 rounded-full animate-bounce ${
                    theme === 'dark' ? 'bg-gray-400' : 'bg-gray-500'
                  }`} style={{ animationDelay: '150ms' }}></div>
                  <div className={`w-2 h-2 rounded-full animate-bounce ${
                    theme === 'dark' ? 'bg-gray-400' : 'bg-gray-500'
                  }`} style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div ref={messagesEndRef} />
      </div>

      {/* Modern Message Input */}
      <div className={`flex-shrink-0 px-4 py-3 backdrop-blur-sm border-t ${
        theme === 'dark'
          ? 'bg-gray-800/95 border-gray-700/60'
          : 'bg-white/95 border-gray-200/60'
      }`}>
        {/* Typing Indicator Above Input */}
        {typing && (
          <div className={`text-xs mb-2 px-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {typing} is typing...
          </div>
        )}
        
        <div className="flex items-end gap-2">
          <div className={`flex-1 rounded-2xl border shadow-sm hover:shadow-md transition-shadow ${
            theme === 'dark'
              ? 'bg-gray-700 border-gray-600/80'
              : 'bg-white border-gray-200/80'
          }`}>
            <Input
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className={`border-0 rounded-2xl py-2.5 px-4 focus:ring-2 focus:ring-blue-500/20 resize-none text-sm bg-transparent ${
                theme === 'dark' 
                  ? 'text-white placeholder-gray-400' 
                  : 'text-gray-900 placeholder-gray-500'
              }`}
              disabled={sending}
            />
          </div>
          
          <Button 
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className="rounded-full w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:hover:shadow-lg disabled:opacity-50"
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