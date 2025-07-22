
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ErrorState {
  error: Error | null;
  isError: boolean;
  isLoading: boolean;
}

export const useErrorHandler = () => {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isError: false,
    isLoading: false
  });
  const { toast } = useToast();

  const handleError = useCallback((error: Error | string, showToast = true) => {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    
    setErrorState({
      error: errorObj,
      isError: true,
      isLoading: false
    });

    if (showToast) {
      toast({
        title: "Error",
        description: errorObj.message,
        variant: "destructive",
      });
    }

    console.error('Error handled:', errorObj);
  }, [toast]);

  const handleAsyncOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    options?: {
      loadingMessage?: string;
      successMessage?: string;
      errorMessage?: string;
      showSuccessToast?: boolean;
    }
  ): Promise<T | null> => {
    try {
      setErrorState(prev => ({ ...prev, isLoading: true, isError: false }));
      
      const result = await operation();
      
      setErrorState({
        error: null,
        isError: false,
        isLoading: false
      });

      if (options?.successMessage && options.showSuccessToast) {
        toast({
          title: "Success",
          description: options.successMessage,
        });
      }

      return result;
    } catch (error) {
      const errorMessage = options?.errorMessage || 
        (error instanceof Error ? error.message : 'An unexpected error occurred');
      
      handleError(errorMessage);
      return null;
    }
  }, [handleError, toast]);

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isError: false,
      isLoading: false
    });
  }, []);

  const retry = useCallback((operation: () => void | Promise<void>) => {
    clearError();
    if (typeof operation === 'function') {
      operation();
    }
  }, [clearError]);

  return {
    ...errorState,
    handleError,
    handleAsyncOperation,
    clearError,
    retry
  };
};
