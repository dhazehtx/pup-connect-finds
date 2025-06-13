
import React, { useRef, useEffect } from 'react';
import { CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Check, CheckCheck, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Message } from '@/types/chat';

interface MessageListProps {
  messages: Message[];
  currentUserId?: string;
  otherUserAvatar?: string;
  currentUserAvatar?: string;
  otherUserTyping: boolean;
}

const MessageList = ({ 
  messages, 
  currentUserId, 
  otherUserAvatar, 
  currentUserAvatar,
  otherUserTyping 
}: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getMessageStatusIcon = (message: Message) => {
    if (message.sender_id !== currentUserId) return null;
    
    if (message.read_at) {
      return <CheckCheck size={14} className="text-blue-500" />;
    }
    if (message.created_at) {
      return <Check size={14} className="text-gray-400" />;
    }
    return null;
  };

  // Type-safe message filtering
  const typedMessages = messages.filter((msg): msg is Message => {
    const validTypes: Array<Message['message_type']> = ['image', 'text', 'file', 'voice'];
    return (
      typeof msg.id === 'string' &&
      typeof msg.sender_id === 'string' &&
      typeof msg.content === 'string' &&
      typeof msg.created_at === 'string' &&
      validTypes.includes(msg.message_type as Message['message_type'])
    );
  });

  return (
    <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
      {typedMessages.map((message) => {
        const isOwn = message.sender_id === currentUserId;
        const messageTime = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });

        return (
          <div
            key={message.id}
            className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <Avatar className="w-8 h-8">
              <AvatarImage src={isOwn ? currentUserAvatar : otherUserAvatar} />
              <AvatarFallback>
                <User className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>

            <div className={`max-w-xs lg:max-w-md ${isOwn ? 'text-right' : 'text-left'}`}>
              {/* Media Messages */}
              {(message.message_type === 'image' || message.message_type === 'file') && message.image_url && (
                <div className="mb-2">
                  <img
                    src={message.image_url}
                    alt="Shared content"
                    className="max-w-full h-auto rounded"
                  />
                </div>
              )}
              
              {/* Text Messages */}
              {message.message_type === 'text' && (
                <div
                  className={`rounded-lg px-3 py-2 relative ${
                    isOwn
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm break-words">{message.content}</p>
                </div>
              )}
              
              <div className="flex items-center justify-between mt-1 gap-2">
                <span className="text-xs text-gray-500">{messageTime}</span>
                {getMessageStatusIcon(message)}
              </div>
            </div>
          </div>
        );
      })}
      
      {otherUserTyping && (
        <div className="flex justify-start">
          <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
            <div className="flex items-center gap-1">
              <div className="flex space-x-1">
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
              <span className="text-xs ml-2">typing...</span>
            </div>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </CardContent>
  );
};

export default MessageList;
