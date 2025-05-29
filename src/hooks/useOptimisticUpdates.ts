
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface OptimisticAction<T> {
  optimisticUpdate: (currentData: T[]) => T[];
  serverAction: () => Promise<void>;
  rollbackUpdate: (currentData: T[]) => T[];
  successMessage?: string;
  errorMessage?: string;
}

export const useOptimisticUpdates = <T>(initialData: T[] = []) => {
  const [data, setData] = useState<T[]>(initialData);
  const [pendingActions, setPendingActions] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const executeOptimistic = useCallback(async <U extends T>(
    actionId: string,
    action: OptimisticAction<U>
  ) => {
    // Add to pending actions
    setPendingActions(prev => new Set([...prev, actionId]));

    // Apply optimistic update immediately
    setData(prevData => action.optimisticUpdate(prevData as U[]) as T[]);

    try {
      // Execute server action
      await action.serverAction();
      
      // Show success message
      if (action.successMessage) {
        toast({
          title: "Success",
          description: action.successMessage,
        });
      }
    } catch (error) {
      console.error('Optimistic action failed:', error);
      
      // Rollback optimistic update
      setData(prevData => action.rollbackUpdate(prevData as U[]) as T[]);
      
      // Show error message
      toast({
        title: "Error",
        description: action.errorMessage || "Action failed",
        variant: "destructive",
      });
    } finally {
      // Remove from pending actions
      setPendingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(actionId);
        return newSet;
      });
    }
  }, [toast]);

  const updateData = useCallback((newData: T[]) => {
    setData(newData);
  }, []);

  const isPending = useCallback((actionId: string) => {
    return pendingActions.has(actionId);
  }, [pendingActions]);

  return {
    data,
    updateData,
    executeOptimistic,
    isPending,
    hasPendingActions: pendingActions.size > 0
  };
};
