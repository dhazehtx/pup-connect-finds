
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
      console.log('Polling stopped - user:', !!user, 'enabled:', enabled);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsPolling(false);
      return;
    }

    const startPolling = () => {
      console.log(`Starting polling with ${interval}ms interval`);
      setIsPolling(true);
      intervalRef.current = setInterval(async () => {
        console.log('Executing poll...');
        try {
          await onPoll();
          console.log('Poll completed successfully');
        } catch (error) {
          console.error('Polling error:', error);
        }
      }, interval);
    };

    startPolling();

    return () => {
      console.log('Cleaning up polling');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsPolling(false);
    };
  }, [onPoll, interval, enabled, user]);

  const stopPolling = () => {
    console.log('Manually stopping polling');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
  };

  const startPolling = () => {
    if (!intervalRef.current && user && enabled) {
      console.log('Manually starting polling');
      setIsPolling(true);
      intervalRef.current = setInterval(async () => {
        console.log('Executing manual poll...');
        try {
          await onPoll();
          console.log('Manual poll completed successfully');
        } catch (error) {
          console.error('Manual polling error:', error);
        }
      }, interval);
    }
  };

  return { isPolling, stopPolling, startPolling };
};
