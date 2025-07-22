
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Check, CheckCheck, User, Shield } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Message } from '@/types/chat';

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
  const messageTime = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });

  const getMessageStatusIcon = () => {
    if (!isOwn) return null;
    
    if (message.read_at) {
      return <CheckCheck size={14} className="text-blue-500" />;
    }
    if (message.created_at) {
      return <Check size={14} className="text-gray-400" />;
    }
    return null;
  };

  return (
    <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {showAvatar && (
        <Avatar className="w-8 h-8">
          <AvatarImage src={senderAvatar} />
          <AvatarFallback>
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      )}

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
            {message.is_encrypted && (
              <Shield className="w-3 h-3 absolute top-1 right-1 opacity-60" />
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between mt-1 gap-2">
          <span className="text-xs text-gray-500">{messageTime}</span>
          {getMessageStatusIcon()}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
