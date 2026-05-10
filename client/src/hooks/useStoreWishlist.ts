import { useState, useCallback, useEffect } from 'react';

const STORE_WISHLIST_KEY = 'store-wishlist-ids';

export function useStoreWishlist() {
  const [ids, setIds] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const raw = localStorage.getItem(STORE_WISHLIST_KEY);
      const arr = raw ? (JSON.parse(raw) as string[]) : [];
      return new Set(Array.isArray(arr) ? arr : []);
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORE_WISHLIST_KEY, JSON.stringify(Array.from(ids)));
    } catch {
      // ignore
    }
  }, [ids]);

  const isInWishlist = useCallback(
    (productId: string) => ids.has(productId),
    [ids]
  );

  const toggleWishlist = useCallback((productId: string) => {
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  }, []);

  return { isInWishlist, toggleWishlist };
}
