
import React from 'react';
import { Check, AlertCircle, Info, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const getToastIcon = (type: ToastType) => {
  switch (type) {
    case 'success':
      return <Check className="w-5 h-5 text-green-600" />;
    case 'error':
      return <X className="w-5 h-5 text-red-600" />;
    case 'warning':
      return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    case 'info':
    default:
      return <Info className="w-5 h-5 text-blue-600" />;
  }
};

const getToastStyles = (type: ToastType) => {
  switch (type) {
    case 'success':
      return 'border-green-200 bg-green-50';
    case 'error':
      return 'border-red-200 bg-red-50';
    case 'warning':
      return 'border-yellow-200 bg-yellow-50';
    case 'info':
    default:
      return 'border-blue-200 bg-blue-50';
  }
};

export const showToast = (type: ToastType, options: ToastOptions) => {
  const icon = getToastIcon(type);
  const styles = getToastStyles(type);

  return toast({
    title: (
      <div className="flex items-center gap-2">
        {icon}
        <span>{options.title}</span>
      </div>
    ),
    description: options.description,
    duration: options.duration || 4000,
    className: cn('border-l-4', styles),
    action: options.action ? (
      <button
        onClick={options.action.onClick}
        className="text-sm font-medium text-royal-blue hover:text-blue-600 underline"
      >
        {options.action.label}
      </button>
    ) : undefined,
  });
};

// Convenience functions
export const showSuccessToast = (options: ToastOptions) => showToast('success', options);
export const showErrorToast = (options: ToastOptions) => showToast('error', options);
export const showInfoToast = (options: ToastOptions) => showToast('info', options);
export const showWarningToast = (options: ToastOptions) => showToast('warning', options);

// Common toast messages
export const commonToasts = {
  saveSuccess: () => showSuccessToast({
    title: 'Saved successfully',
    description: 'Your changes have been saved.'
  }),
  
  deleteSuccess: () => showSuccessToast({
    title: 'Deleted successfully',
    description: 'The item has been removed.'
  }),
  
  copySuccess: () => showSuccessToast({
    title: 'Copied to clipboard',
    description: 'The content has been copied to your clipboard.'
  }),
  
  networkError: () => showErrorToast({
    title: 'Network error',
    description: 'Please check your connection and try again.'
  }),
  
  unauthorizedError: () => showErrorToast({
    title: 'Access denied',
    description: 'You need to sign in to perform this action.'
  }),
  
  validationError: (message: string) => showErrorToast({
    title: 'Validation error',
    description: message
  }),
  
  featureComingSoon: () => showInfoToast({
    title: 'Coming soon',
    description: 'This feature is currently in development.'
  })
};
