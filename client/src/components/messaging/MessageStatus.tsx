
import React from 'react';
import { Check, CheckCheck, Clock, AlertCircle } from 'lucide-react';

interface MessageStatusProps {
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  timestamp?: string;
  showTimestamp?: boolean;
}

const MessageStatus = ({ status, timestamp, showTimestamp = false }: MessageStatusProps) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return <Clock size={12} className="text-gray-300 animate-pulse" />;
      case 'sent':
        return <Check size={12} className="text-gray-400" />;
      case 'delivered':
        return <CheckCheck size={12} className="text-gray-400" />;
      case 'read':
        return <CheckCheck size={12} className="text-blue-500" />;
      case 'failed':
        return <AlertCircle size={12} className="text-red-500" />;
      default:
        return <Clock size={12} className="text-gray-300" />;
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
    <div className="flex items-center gap-1">
      {getStatusIcon()}
      {showTimestamp && timestamp && (
        <span className="text-xs text-gray-500">
          {new Date(timestamp).toLocaleTimeString()}
        </span>
      )}
      <span className="sr-only">{getStatusText()}</span>
    </div>
  );
};

export default MessageStatus;
