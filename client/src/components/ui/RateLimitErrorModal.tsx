import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, Shield } from 'lucide-react';

interface RateLimitErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  error: {
    message: string;
    retryAfter?: number;
    type?: 'rate_limit' | 'locked_out' | 'abuse_detected';
  };
}

const RateLimitErrorModal = ({ isOpen, onClose, error }: RateLimitErrorModalProps) => {
  const getIcon = () => {
    switch (error.type) {
      case 'locked_out':
        return <Shield className="w-8 h-8 text-red-500" />;
      case 'abuse_detected':
        return <AlertTriangle className="w-8 h-8 text-orange-500" />;
      default:
        return <Clock className="w-8 h-8 text-blue-500" />;
    }
  };

  const getTitle = () => {
    switch (error.type) {
      case 'locked_out':
        return 'Account Temporarily Locked';
      case 'abuse_detected':
        return 'Suspicious Activity Detected';
      default:
        return 'Please Slow Down';
    }
  };

  const getDescription = () => {
    switch (error.type) {
      case 'locked_out':
        return 'Your account has been temporarily locked due to repeated policy violations. This is to protect our community and ensure fair usage.';
      case 'abuse_detected':
        return 'We\'ve detected unusual activity from your account. Please review our community guidelines and try again.';
      default:
        return 'You\'re making requests too quickly. Please take a moment before continuing.';
    }
  };

  const formatRetryTime = (seconds: number) => {
    if (seconds < 60) return `${seconds} seconds`;
    if (seconds < 3600) return `${Math.ceil(seconds / 60)} minutes`;
    return `${Math.ceil(seconds / 3600)} hours`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {getIcon()}
            <DialogTitle>{getTitle()}</DialogTitle>
          </div>
          <DialogDescription className="text-left space-y-3">
            <p>{error.message}</p>
            <p className="text-sm text-gray-600">
              {getDescription()}
            </p>
            {error.retryAfter && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    Please wait {formatRetryTime(error.retryAfter)} before trying again
                  </span>
                </div>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-4">
          <Button onClick={onClose} className="w-full">
            I Understand
          </Button>
          
          {error.type === 'locked_out' && (
            <div className="text-xs text-gray-500 text-center">
              If you believe this is an error, please contact support
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RateLimitErrorModal;