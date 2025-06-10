
import React from 'react';
import { Check, CheckCheck, Clock, AlertCircle } from 'lucide-react';

interface MessageStatusIndicatorProps {
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  size?: number;
  className?: string;
}

const MessageStatusIndicator = ({ 
  status, 
  size = 16, 
  className = "" 
}: MessageStatusIndicatorProps) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return <Clock size={size} className={`text-gray-400 ${className}`} />;
      case 'sent':
        return <Check size={size} className={`text-gray-400 ${className}`} />;
      case 'delivered':
        return <CheckCheck size={size} className={`text-gray-400 ${className}`} />;
      case 'read':
        return <CheckCheck size={size} className={`text-blue-500 ${className}`} />;
      case 'failed':
        return <AlertCircle size={size} className={`text-red-500 ${className}`} />;
      default:
        return null;
    }
  };

  const getStatusLabel = () => {
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
    <div className="flex items-center" title={getStatusLabel()}>
      {getStatusIcon()}
    </div>
  );
};

export default MessageStatusIndicator;
