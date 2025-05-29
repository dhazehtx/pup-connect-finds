
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface UsePollingProps {
  onPoll: () => Promise<void>;
  interval?: number;
  enabled?: boolean;
}

export const usePolling = ({ onPoll, interval = 5000, enabled = true }: UsePollingProps) => {
  const [isPolling, setIsPolling] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsPolling(false);
      return;
    }

    const startPolling = () => {
      setIsPolling(true);
      intervalRef.current = setInterval(async () => {
        try {
          await onPoll();
        } catch (error) {
          console.error('Polling error:', error);
        }
      }, interval);
    };

    startPolling();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsPolling(false);
    };
  }, [onPoll, interval, enabled, user]);

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
  };

  const startPolling = () => {
    if (!intervalRef.current && user && enabled) {
      setIsPolling(true);
      intervalRef.current = setInterval(async () => {
        try {
          await onPoll();
        } catch (error) {
          console.error('Polling error:', error);
        }
      }, interval);
    }
  };

  return { isPolling, stopPolling, startPolling };
};
