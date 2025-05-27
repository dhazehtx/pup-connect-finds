
import React, { useEffect, useState } from 'react';
import { Check, AlertCircle, X, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusMessageProps {
  type: 'success' | 'error' | 'warning' | 'info' | 'loading';
  message: string;
  show: boolean;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

const StatusMessage = ({ 
  type, 
  message, 
  show, 
  onClose, 
  autoClose = true, 
  duration = 3000 
}: StatusMessageProps) => {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);
    
    if (show && autoClose && type !== 'loading') {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, autoClose, duration, type, onClose]);

  if (!isVisible) return null;

  const icons = {
    success: <Check size={20} className="text-green-600" />,
    error: <X size={20} className="text-red-600" />,
    warning: <AlertCircle size={20} className="text-orange-600" />,
    info: <Info size={20} className="text-blue-600" />,
    loading: (
      <div className="w-5 h-5 animate-spin rounded-full border-2 border-gray-300 border-t-royal-blue" />
    ),
  };

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-orange-50 border-orange-200',
    info: 'bg-blue-50 border-blue-200',
    loading: 'bg-gray-50 border-gray-200',
  };

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
      <div className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg max-w-sm',
        bgColors[type]
      )}>
        {icons[type]}
        <p className="text-sm font-medium text-gray-900">{message}</p>
        {onClose && type !== 'loading' && (
          <button
            onClick={() => {
              setIsVisible(false);
              onClose();
            }}
            className="ml-2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default StatusMessage;
