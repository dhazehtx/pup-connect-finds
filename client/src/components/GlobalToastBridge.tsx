import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export function GlobalToastBridge() {
  const { toast } = useToast();

  useEffect(() => {
    (window as any).__toastFn = toast;
    return () => {
      delete (window as any).__toastFn;
    };
  }, [toast]);

  return null;
}
