
import React from 'react';
import { Toast } from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';

const ToastContainer = () => {
  const { toasts } = useToast();

  return (
    <div className="fixed bottom-0 right-0 z-50 w-full md:max-w-[420px] p-4 md:p-6">
      <div className="space-y-4">
        {toasts.map(({ id, title, description, action, ...props }) => (
          <Toast key={id} {...props} className="animate-in slide-in-from-bottom-full">
            <div className="grid gap-1">
              {title && <div className="text-sm font-semibold">{title}</div>}
              {description && <div className="text-sm opacity-90">{description}</div>}
            </div>
            {action}
          </Toast>
        ))}
      </div>
    </div>
  );
};

export default ToastContainer;
