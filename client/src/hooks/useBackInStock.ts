import { useState, useCallback, useEffect } from 'react';

const BACK_IN_STOCK_ALERTS_KEY = 'back-in-stock-alert-ids';

export function useBackInStock() {
  const [alertIds, setAlertIds] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const raw = localStorage.getItem(BACK_IN_STOCK_ALERTS_KEY);
      const arr = raw ? (JSON.parse(raw) as string[]) : [];
      return new Set(Array.isArray(arr) ? arr : []);
    } catch {
      return new Set();
    }
  });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(BACK_IN_STOCK_ALERTS_KEY, JSON.stringify(Array.from(alertIds)));
    } catch {
      // ignore
    }
  }, [alertIds]);

  const hasAlert = useCallback(
    (productId: string) => alertIds.has(productId),
    [alertIds]
  );

  const addAlert = useCallback(async (productId: string) => {
    setIsAdding(true);
    try {
      setAlertIds((prev) => {
        if (prev.has(productId)) return prev;
        return new Set(prev).add(productId);
      });
      // Optional: call API when backend exists
      // await apiRequest('POST', `/api/store/products/${productId}/back-in-stock`);
    } finally {
      setIsAdding(false);
    }
  }, []);

  return { hasAlert, addAlert, isAdding };
}
