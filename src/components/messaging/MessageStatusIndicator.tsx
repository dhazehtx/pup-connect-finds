
import React from 'react';
import { Check, CheckCheck, Clock, AlertCircle } from 'lucide-react';

interface MessageStatusIndicatorProps {
  status: 'sent' | 'delivered' | 'read' | 'failed';
  size?: number;
}

const MessageStatusIndicator = ({ status, size = 16 }: MessageStatusIndicatorProps) => {
  switch (status) {
    case 'sent':
      return <Clock size={size} className="text-gray-400" />;
    case 'delivered':
      return <Check size={size} className="text-gray-400" />;
    case 'read':
      return <CheckCheck size={size} className="text-blue-500" />;
    case 'failed':
      return <AlertCircle size={size} className="text-red-500" />;
    default:
      return null;
  }
};

export default MessageStatusIndicator;
