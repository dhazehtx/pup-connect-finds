
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Check, CheckCheck, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface EnhancedMessageBubbleProps {
  message: {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
    message_type?: string;
    image_url?: string;
    read_at?: string;
  };
  isOwn: boolean;
  senderName?: string;
  senderAvatar?: string;
  showAvatar?: boolean;
  showReadReceipt?: boolean;
}

const EnhancedMessageBubble = ({ 
  message, 
  isOwn, 
  senderName, 
  senderAvatar, 
  showAvatar = true,
  showReadReceipt = true 
}: EnhancedMessageBubbleProps) => {
  const timeAgo = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });

  const getReadReceiptIcon = () => {
    if (!isOwn || !showReadReceipt) return null;
    
    if (message.read_at) {
      return <CheckCheck className="w-3 h-3 text-blue-500" />;
    }
    return <Check className="w-3 h-3 text-gray-400" />;
  };

  return (
    <div className={`flex gap-3 mb-4 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {showAvatar && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={senderAvatar} />
          <AvatarFallback>
            {senderName?.charAt(0) || (isOwn ? 'Y' : 'U')}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'text-right' : 'text-left'}`}>
        <div
          className={`rounded-lg px-3 py-2 relative ${
            isOwn
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          {message.message_type === 'image' && message.image_url && (
            <img
              src={message.image_url}
              alt="Shared image"
              className="rounded mb-2 max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(message.image_url, '_blank')}
            />
          )}
          
          {message.message_type === 'file' && (
            <div className="flex items-center gap-2 p-2 bg-white bg-opacity-20 rounded">
              <div className="w-8 h-8 bg-white bg-opacity-30 rounded flex items-center justify-center">
                📎
              </div>
              <span className="text-sm">{message.content}</span>
            </div>
          )}
          
          {message.content && message.message_type !== 'file' && (
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          )}
        </div>
        
        <div className={`flex items-center gap-2 mt-1 text-xs text-gray-500 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span>{timeAgo}</span>
          {getReadReceiptIcon()}
        </div>
      </div>
    </div>
  );
};

export default EnhancedMessageBubble;
