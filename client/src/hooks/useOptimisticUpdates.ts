
import { useState, useCallback } from 'react';

interface OptimisticAction<T> {
  optimisticUpdate: (data: T[]) => T[];
  operation: () => Promise<any>;
  rollback: (data: T[]) => T[];
}

export const useOptimisticUpdates = <T>(initialData: T[] = []) => {
  const [data, setData] = useState<T[]>(initialData);
  const [isOptimistic, setIsOptimistic] = useState(false);

  const executeOptimistic = useCallback(async (action: OptimisticAction<T>) => {
    // Apply optimistic update immediately
    setData(prevData => action.optimisticUpdate(prevData));
    setIsOptimistic(true);

    try {
      // Execute the actual operation
      await action.operation();
      setIsOptimistic(false);
    } catch (error) {
      // Rollback on error
      setData(prevData => action.rollback(prevData));
      setIsOptimistic(false);
      throw error;
    }
  }, []);

  const addOptimistic = useCallback((item: T, operation: () => Promise<any>) => {
    return executeOptimistic({
      optimisticUpdate: (data) => [item, ...data],
      operation,
      rollback: (data) => data.slice(1)
    });
  }, [executeOptimistic]);

  const updateOptimistic = useCallback((
    id: string | number,
    updates: Partial<T>,
    operation: () => Promise<any>,
    idKey: keyof T = 'id' as keyof T
  ) => {
    let originalItem: T | null = null;
    
    return executeOptimistic({
      optimisticUpdate: (data) => data.map(item => {
        if (item[idKey] === id) {
          originalItem = item;
          return { ...item, ...updates };
        }
        return item;
      }),
      operation,
      rollback: (data) => data.map(item => 
        item[idKey] === id && originalItem ? originalItem : item
      )
    });
  }, [executeOptimistic]);

  const removeOptimistic = useCallback((
    id: string | number,
    operation: () => Promise<any>,
    idKey: keyof T = 'id' as keyof T
  ) => {
    let originalData: T[] = [];
    
    return executeOptimistic({
      optimisticUpdate: (data) => {
        originalData = data;
        return data.filter(item => item[idKey] !== id);
      },
      operation,
      rollback: () => originalData
    });
  }, [executeOptimistic]);

  return {
    data,
    setData,
    isOptimistic,
    executeOptimistic,
    addOptimistic,
    updateOptimistic,
    removeOptimistic
  };
};
