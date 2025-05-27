
import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SuccessIndicatorProps {
  show: boolean;
  message: string;
  onComplete?: () => void;
  icon?: 'check' | 'paw';
}

const PawIcon = ({ size = 24, className }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12 2C12.5523 2 13 2.44772 13 3V4C13 4.55228 12.5523 5 12 5C11.4477 5 11 4.55228 11 4V3C11 2.44772 11.4477 2 12 2Z" />
    <path d="M8.5 3.5C9.05228 3.5 9.5 3.94772 9.5 4.5V6C9.5 6.55228 9.05228 7 8.5 7C7.94772 7 7.5 6.55228 7.5 6V4.5C7.5 3.94772 7.94772 3.5 8.5 3.5Z" />
    <path d="M15.5 3.5C16.0523 3.5 16.5 3.94772 16.5 4.5V6C16.5 6.55228 16.0523 7 15.5 7C14.9477 7 14.5 6.55228 14.5 6V4.5C14.5 3.94772 14.9477 3.5 15.5 3.5Z" />
    <path d="M6 7.5C6.55228 7.5 7 7.94772 7 8.5V10C7 10.5523 6.55228 11 6 11C5.44772 11 5 10.5523 5 10V8.5C5 7.94772 5.44772 7.5 6 7.5Z" />
    <path d="M18 7.5C18.5523 7.5 19 7.94772 19 8.5V10C19 10.5523 18.5523 11 18 11C17.4477 11 17 10.5523 17 10V8.5C17 7.94772 17.4477 7.5 18 7.5Z" />
    <path d="M12 9C15.866 9 19 11.134 19 14V18C19 19.6569 17.6569 21 16 21H8C6.34315 21 5 19.6569 5 18V14C5 11.134 8.13401 9 12 9Z" />
  </svg>
);

const SuccessIndicator = ({ show, message, onComplete, icon = 'check' }: SuccessIndicatorProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6 animate-scale-in">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-16 h-16 bg-mint-green rounded-full flex items-center justify-center animate-bounce">
            {icon === 'check' ? (
              <Check size={32} className="text-deep-navy" />
            ) : (
              <PawIcon size={32} className="text-deep-navy" />
            )}
          </div>
          <p className="text-deep-navy font-medium text-center">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default SuccessIndicator;
