
import React from 'react';
import { Check, CheckCheck, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageDeliveryStatusProps {
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  timestamp?: string;
  size?: 'sm' | 'md';
}

const MessageDeliveryStatus = ({ 
  status, 
  timestamp, 
  size = 'sm' 
}: MessageDeliveryStatusProps) => {
  const iconSize = size === 'sm' ? 12 : 16;

  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return <Clock size={iconSize} className="text-gray-400 animate-pulse" />;
      case 'sent':
        return <Check size={iconSize} className="text-gray-400" />;
      case 'delivered':
        return <CheckCheck size={iconSize} className="text-gray-400" />;
      case 'read':
        return <CheckCheck size={iconSize} className="text-blue-500" />;
      case 'failed':
        return <AlertCircle size={iconSize} className="text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'sending':
        return 'Sending...';
      case 'sent':
        return 'Sent';
      case 'delivered':
        return 'Delivered';
      case 'read':
        return 'Read';
      case 'failed':
        return 'Failed to send';
      default:
        return '';
    }
  };

  return (
    <div className={cn(
      'flex items-center gap-1',
      size === 'sm' ? 'text-xs' : 'text-sm'
    )}>
      {getStatusIcon()}
      <span className="text-muted-foreground">{getStatusText()}</span>
      {timestamp && (
        <span className="text-muted-foreground">
          • {new Date(timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </span>
      )}
    </div>
  );
};

export default MessageDeliveryStatus;
