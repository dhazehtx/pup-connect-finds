
import React from 'react';
import { Check, CheckCheck, Clock } from 'lucide-react';

interface MessageStatusIndicatorProps {
  status: 'sending' | 'sent' | 'delivered' | 'read';
  size?: number;
  className?: string;
}

const MessageStatusIndicator = ({ 
  status, 
  size = 16, 
  className = '' 
}: MessageStatusIndicatorProps) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return <Clock size={size} className={`text-muted-foreground ${className}`} />;
      case 'sent':
        return <Check size={size} className={`text-muted-foreground ${className}`} />;
      case 'delivered':
        return <CheckCheck size={size} className={`text-muted-foreground ${className}`} />;
      case 'read':
        return <CheckCheck size={size} className={`text-primary ${className}`} />;
      default:
        return null;
    }
  };

  return (
    <span className="inline-flex items-center" title={`Message ${status}`}>
      {getStatusIcon()}
    </span>
  );
};

export default MessageStatusIndicator;
