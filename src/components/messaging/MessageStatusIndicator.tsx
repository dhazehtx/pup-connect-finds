
import React from 'react';
import { Check, CheckCheck, Clock, AlertCircle } from 'lucide-react';

interface MessageStatusIndicatorProps {
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  size?: number;
}

const MessageStatusIndicator = ({ status, size = 14 }: MessageStatusIndicatorProps) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return <Clock size={size} className="text-gray-400" />;
      case 'sent':
        return <Check size={size} className="text-gray-400" />;
      case 'delivered':
        return <CheckCheck size={size} className="text-gray-400" />;
      case 'read':
        return <CheckCheck size={size} className="text-blue-500" />;
      case 'failed':
        return <AlertCircle size={size} className="text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center">
      {getStatusIcon()}
    </div>
  );
};

export default MessageStatusIndicator;
