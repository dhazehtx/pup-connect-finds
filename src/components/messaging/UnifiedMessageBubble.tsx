
import React from 'react';
import { Check, CheckCheck, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  read_at?: string;
  message_type?: string;
  image_url?: string;
}

interface UnifiedMessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showTimestamp?: boolean;
  onReactionClick?: (messageId: string) => void;
  reactions?: any[];
}

const UnifiedMessageBubble = ({
  message,
  isOwn,
  showTimestamp = false,
  onReactionClick,
  reactions = []
}: UnifiedMessageBubbleProps) => {
  const getStatusIcon = () => {
    if (!isOwn) return null;
    
    if (message.read_at) {
      return <CheckCheck size={12} className="text-blue-500" />;
    }
    return <Check size={12} className="text-gray-400" />;
  };

  const formatTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className="max-w-xs lg:max-w-md">
        <div
          className={`px-4 py-2 rounded-lg ${
            isOwn
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          {message.message_type === 'image' && message.image_url && (
            <img
              src={message.image_url}
              alt="Shared image"
              className="max-w-full h-auto rounded mb-2"
            />
          )}
          
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs opacity-70">
              {showTimestamp ? formatTime(message.created_at) : new Date(message.created_at).toLocaleTimeString()}
            </span>
            {getStatusIcon()}
          </div>
        </div>

        {reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {reactions.map((reaction, index) => (
              <span
                key={index}
                className="text-xs bg-gray-200 rounded-full px-2 py-1 cursor-pointer hover:bg-gray-300"
                onClick={() => onReactionClick?.(message.id)}
              >
                {reaction.emoji} {reaction.count}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedMessageBubble;
