import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface RateLimitError {
  message: string;
  retryAfter?: number;
  type?: 'rate_limit' | 'locked_out' | 'abuse_detected';
}

export const useRateLimitHandler = () => {
  const [rateLimitError, setRateLimitError] = useState<RateLimitError | null>(null);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const { toast } = useToast();

  const handleRateLimitError = useCallback((error: any) => {
    // Check if it's a rate limit error
    if (error?.response?.status === 429) {
      const errorData = error.response.data;
      
      const rateLimitError: RateLimitError = {
        message: errorData.message || "You're doing that too much. Please wait a moment.",
        retryAfter: errorData.retryAfter,
        type: errorData.error?.includes('locked') ? 'locked_out' : 
              errorData.error?.includes('abuse') ? 'abuse_detected' : 'rate_limit'
      };
      
      setRateLimitError(rateLimitError);
      setIsErrorModalOpen(true);
      
      // Also show a toast for less intrusive errors
      if (rateLimitError.type === 'rate_limit') {
        toast({
          title: "Please slow down",
          description: rateLimitError.message,
          variant: "destructive",
          duration: 5000,
        });
      }
      
      return true; // Indicates this was a rate limit error
    }
    
    return false; // Not a rate limit error
  }, [toast]);

  const closeErrorModal = useCallback(() => {
    setIsErrorModalOpen(false);
    setRateLimitError(null);
  }, []);

  const withRateLimitHandling = useCallback(async <T>(
    apiCall: () => Promise<T>
  ): Promise<T | null> => {
    try {
      return await apiCall();
    } catch (error) {
      if (handleRateLimitError(error)) {
        return null; // Rate limit error was handled
      }
      throw error; // Re-throw non-rate-limit errors
    }
  }, [handleRateLimitError]);

  return {
    rateLimitError,
    isErrorModalOpen,
    handleRateLimitError,
    closeErrorModal,
    withRateLimitHandling
  };
};