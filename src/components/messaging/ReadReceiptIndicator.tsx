
import React from 'react';
import { Check, CheckCheck, Clock } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface ReadReceiptIndicatorProps {
  messageId: string;
  senderId: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  readBy?: Array<{
    user_id: string;
    username: string;
    avatar_url?: string;
    read_at: string;
  }>;
}

const ReadReceiptIndicator = ({ messageId, senderId, status, readBy = [] }: ReadReceiptIndicatorProps) => {
  console.log('📖 ReadReceiptIndicator - Status:', {
    messageId,
    status,
    readByCount: readBy.length
  });

  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return <Clock size={12} className="text-muted-foreground animate-pulse" />;
      case 'sent':
        return <Check size={12} className="text-muted-foreground" />;
      case 'delivered':
        return <CheckCheck size={12} className="text-muted-foreground" />;
      case 'read':
        return <CheckCheck size={12} className="text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center gap-1">
      {getStatusIcon()}
      
      {/* Show avatars of users who read the message */}
      {readBy.length > 0 && status === 'read' && (
        <div className="flex -space-x-1 ml-1">
          {readBy.slice(0, 3).map((reader) => (
            <Avatar key={reader.user_id} className="w-4 h-4 border border-background">
              <AvatarImage src={reader.avatar_url} />
              <AvatarFallback className="text-xs">
                {reader.username?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          ))}
          {readBy.length > 3 && (
            <div className="w-4 h-4 bg-muted rounded-full border border-background flex items-center justify-center">
              <span className="text-xs">+{readBy.length - 3}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReadReceiptIndicator;
