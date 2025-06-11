
import React from 'react';
import { Check, CheckCheck } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  image_url?: string;
  read_at?: string;
  created_at: string;
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  senderName?: string;
  senderAvatar?: string;
  showAvatar?: boolean;
}

const MessageBubble = ({ 
  message, 
  isOwn, 
  senderName, 
  senderAvatar,
  showAvatar = true 
}: MessageBubbleProps) => {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`flex items-end space-x-2 mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      {!isOwn && showAvatar && (
        <Avatar className="w-8 h-8">
          <AvatarImage src={senderAvatar} />
          <AvatarFallback>
            {senderName?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-1' : 'order-2'}`}>
        <div
          className={`px-4 py-2 rounded-2xl ${
            isOwn
              ? 'bg-blue-600 text-white rounded-br-md'
              : 'bg-gray-100 text-gray-900 rounded-bl-md'
          }`}
        >
          {message.image_url && (
            <img
              src={message.image_url}
              alt="Shared image"
              className="rounded-lg mb-2 max-w-full h-auto"
            />
          )}
          
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          
          <div className={`flex items-center justify-between mt-1 text-xs ${
            isOwn ? 'text-blue-100' : 'text-gray-500'
          }`}>
            <span>{formatTime(message.created_at)}</span>
            {isOwn && (
              <div className="ml-2">
                {message.read_at ? (
                  <CheckCheck className="w-3 h-3" />
                ) : (
                  <Check className="w-3 h-3" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {isOwn && showAvatar && (
        <Avatar className="w-8 h-8 order-2">
          <AvatarFallback>You</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default MessageBubble;
