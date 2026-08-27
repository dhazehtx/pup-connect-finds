import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Send, Smile, Check, CheckCheck, MoreVertical, Moon, Sun, Reply, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';
import { apiRequest } from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  reply_to_message_id?: string | null;
  content: string;
  created_at: string;
  message_type?: string | null;
  read?: boolean;
  sender_profile?: {
    full_name: string | null;
    username: string | null;
    email: string | null;
    avatar_url: string | null;
  } | null;
  replies?: Message[];
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
  const [messageStatuses, setMessageStatuses] = useState<Record<string, 'sent' | 'delivered' | 'read'>>({});
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [hoveredMessage, setHoveredMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { joinConversation, leaveConversation, onEvent, emitNewMessage } = useSocket();
  const { otherUserTyping, startTyping, stopTyping } = useTypingIndicator(activeConversationId || '');

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

        const convData = await apiRequest(`/messaging/conversations/${activeConversationId}`);

        const getDisplayName = (profile: any) => {
          if (profile?.full_name) return profile.full_name;
          if (profile?.username) return profile.username;
          if (profile?.email) return profile.email.split('@')[0];
          return 'Unknown User';
        };

        setConversation({
          id: convData.id,
          other_user: {
            id: convData.other_user?.id || '',
            full_name: getDisplayName(convData.other_user),
            avatar_url: convData.other_user?.avatar_url || null
          },
          listing: convData.listing ? {
            id: convData.listing.id,
            dog_name: convData.listing.dog_name,
            breed: convData.listing.breed,
            image_url: convData.listing.image_url
          } : undefined
        });

        const messagesData = await apiRequest(`/messaging/conversations/${activeConversationId}/messages`);

        const messagesWithProfiles = (Array.isArray(messagesData) ? messagesData : []).map((msg: any) => ({
          ...msg,
          content: msg.content || '',
          sender_profile: msg.sender_profile || null,
          replies: []
        })) as Message[];

        const organizedMessages = organizeThreadedMessages(messagesWithProfiles);
        setMessages(organizedMessages);
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

    if (activeConversationId) {
      joinConversation(activeConversationId);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (activeConversationId) {
        leaveConversation(activeConversationId);
      }
    };
  }, [activeConversationId, user, toast, joinConversation, leaveConversation]);

  useEffect(() => {
    if (!activeConversationId || !user) return;

    const cleanup = onEvent('message:new', (message: any) => {
      if (message.sender_id !== user.id && message.conversation_id === activeConversationId) {
        setMessages(prev => {
          const newMsg: Message = {
            ...message,
            content: message.content || '',
            sender_profile: message.sender_profile || null,
            replies: []
          };
          return organizeThreadedMessages([...flattenMessages(prev), newMsg]);
        });
      }
    });

    return cleanup;
  }, [activeConversationId, user, onEvent]);

  const flattenMessages = (msgs: Message[]): Message[] => {
    const flat: Message[] = [];
    msgs.forEach(msg => {
      flat.push({ ...msg, replies: [] });
      if (msg.replies) {
        msg.replies.forEach(reply => flat.push({ ...reply, replies: [] }));
      }
    });
    return flat;
  };

  // Organize messages into threaded structure
  const organizeThreadedMessages = (allMessages: Message[]): Message[] => {
    const messageMap = new Map<string, Message>();
    const rootMessages: Message[] = [];

    // Create a map of all messages and initialize replies arrays
    allMessages.forEach(msg => {
      messageMap.set(msg.id, { ...msg, replies: [] });
    });

    // Organize into threads
    allMessages.forEach(msg => {
      const message = messageMap.get(msg.id)!;
      
      if (msg.reply_to_message_id) {
        // This is a reply, add it to parent's replies
        const parentMessage = messageMap.get(msg.reply_to_message_id);
        if (parentMessage) {
          parentMessage.replies!.push(message);
        }
      } else {
        // This is a root message
        rootMessages.push(message);
      }
    });

    // Sort replies by creation date
    messageMap.forEach(msg => {
      if (msg.replies) {
        msg.replies.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      }
    });

    // Sort root messages by creation date
    return rootMessages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  };

  // Send message function
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversationId || !user || sending) return;

    setSending(true);
    try {
      const data = await apiRequest('/messaging/messages', {
        method: 'POST',
        body: {
          conversation_id: activeConversationId,
          content: newMessage.trim(),
          ...(replyingTo && { reply_to_message_id: replyingTo.id })
        }
      });

      setNewMessage('');
      setReplyingTo(null);
      stopTyping();

      if (data?.id) {
        updateMessageStatus(data.id, 'sent');
        emitNewMessage(activeConversationId, data);
        setTimeout(() => {
          updateMessageStatus(data.id, 'delivered');
        }, 1000);
      }

      const updatedMessages = await apiRequest(`/messaging/conversations/${activeConversationId}/messages`);
      const messagesWithProfiles = (Array.isArray(updatedMessages) ? updatedMessages : []).map((msg: any) => ({
        ...msg,
        content: msg.content || '',
        sender_profile: msg.sender_profile || null,
        replies: []
      })) as Message[];
      const organizedMessages = organizeThreadedMessages(messagesWithProfiles);
      setMessages(organizedMessages);
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

  const handleTyping = () => {
    startTyping();
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
      <div className="flex flex-col h-[100dvh]">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex flex-col h-[100dvh]">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Conversation not found</h3>
            <p className="text-gray-600">This conversation may have been deleted or you don't have access to it.</p>
          </div>
        </div>
      </div>
    );
  }

  // Render a single message with replies
  const renderMessage = (message: Message, isReply = false) => {
    const isOwnMessage = message.sender_id === user?.id;
    
    const getDisplayName = (profile: any) => {
      if (profile?.full_name) return profile.full_name;
      if (profile?.username) return profile.username;
      if (profile?.email) return profile.email.split('@')[0];
      return 'Unknown User';
    };

    const displayName = getDisplayName(message.sender_profile);
    const displayInitial = displayName?.charAt(0)?.toUpperCase() || 'U';
    
    return (
      <div 
        key={message.id} 
        className={`${isReply ? 'ml-8 mt-2' : ''}`}
        onMouseEnter={() => setHoveredMessage(message.id)}
        onMouseLeave={() => setHoveredMessage(null)}
      >
        {/* Message Bubble */}
        <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} items-end gap-2 group relative`}>
          {/* Avatar for received messages */}
          {!isOwnMessage && (
            <Avatar 
              className={`${isReply ? 'w-6 h-6' : 'w-8 h-8'} ring-2 ring-white dark:ring-gray-600 shadow-sm flex-shrink-0 cursor-pointer hover:scale-105 transition-transform`}
              onClick={() => handleProfileClick(message.sender_id)}
            >
              <AvatarImage src={message.sender_profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-gray-400 to-gray-600 text-white text-xs font-semibold">
                {displayInitial}
              </AvatarFallback>
            </Avatar>
          )}

          {/* Message Content */}
          <div className={`flex flex-col ${isReply ? 'max-w-xs' : 'max-w-xs sm:max-w-sm lg:max-w-md'} ${isOwnMessage ? 'items-end' : 'items-start'}`}>
            <div className="relative">
              <div
                className={`px-4 py-2.5 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${
                  isOwnMessage
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
                    : theme === 'dark'
                    ? `${isReply ? 'bg-gray-800' : 'bg-gray-700'} text-gray-100 rounded-bl-md border border-gray-600`
                    : `${isReply ? 'bg-gray-50' : 'bg-white'} text-gray-900 rounded-bl-md border border-gray-100`
                } ${isReply ? 'text-sm' : ''}`}
              >
                <p className={`${isReply ? 'text-xs' : 'text-sm'} leading-relaxed break-words ${isOwnMessage ? '!text-white' : theme === 'dark' ? '!text-gray-100' : '!text-slate-900'}`}>
                  {message.content}
                </p>
              </div>
              
              {/* Reply Button on Hover */}
              {!isReply && hoveredMessage === message.id && (
                <button
                  onClick={() => setReplyingTo(message)}
                  className={`absolute -right-8 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full transition-all ${
                    theme === 'dark' 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                      : 'bg-white hover:bg-gray-50 text-gray-600'
                  } shadow-lg hover:shadow-xl`}
                >
                  <Reply className="w-3 h-3" />
                </button>
              )}
              
              {/* Message Status for own messages */}
              {isOwnMessage && !isReply && (
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
            
            {/* Timestamp */}
            <div className={`mt-1 px-2 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
              <span className={`${isReply ? 'text-xs' : 'text-xs'} ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {new Date(message.created_at).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Thread Line and Replies */}
        {message.replies && message.replies.length > 0 && (
          <div className="relative">
            {/* Vertical connector line */}
            <div className={`absolute left-4 top-0 w-0.5 h-full ${
              theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
            }`} />
            
            {/* Replies */}
            <div className="space-y-2">
              {message.replies.map(reply => renderMessage(reply, true))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-[100dvh] transition-colors duration-200 ${
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
            messages.map(message => renderMessage(message))
          )}
          
          {/* Typing Indicator */}
          {otherUserTyping && (
            <div className="flex justify-start items-end gap-2 animate-pulse">
              <Avatar className="w-8 h-8 ring-2 ring-white dark:ring-gray-600 shadow-sm flex-shrink-0">
                <AvatarFallback className="bg-gradient-to-br from-gray-400 to-gray-600 text-white text-xs font-semibold">
                  {conversation?.other_user?.full_name?.[0]?.toUpperCase() || 'U'}
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

      {/* Modern Message Input — clear the app's fixed mobile bottom nav (h-16) so the
          composer isn't hidden behind it; the nav is md:hidden, so md:pb-3 on desktop. */}
      <div className={`flex-shrink-0 px-4 pt-3 pb-[calc(0.75rem+4rem+env(safe-area-inset-bottom,0px))] md:pb-3 backdrop-blur-sm border-t ${
        theme === 'dark'
          ? 'bg-gray-800/95 border-gray-700/60'
          : 'bg-white/95 border-gray-200/60'
      }`}>
        {/* Reply Context */}
        {replyingTo && (
          <div className={`mb-3 p-3 rounded-lg border-l-4 border-blue-500 ${
            theme === 'dark' ? 'bg-gray-700/50' : 'bg-blue-50'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Replying to {replyingTo.sender_profile?.full_name || 'Unknown User'}
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} truncate`}>
                  {replyingTo.content}
                </div>
              </div>
              <button
                onClick={() => setReplyingTo(null)}
                className={`p-1 rounded-full ${
                  theme === 'dark' 
                    ? 'hover:bg-gray-600 text-gray-400' 
                    : 'hover:bg-gray-200 text-gray-500'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Typing Indicator Above Input */}
        {otherUserTyping && (
          <div className={`text-xs mb-2 px-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {conversation?.other_user?.full_name || 'Someone'} is typing...
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