import { ReactNode } from 'react';
import { CartContext, useCartProvider } from '@/hooks/use-cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const cartValue = useCartProvider();
  return (
    <CartContext.Provider value={cartValue}>
      {children}
    </CartContext.Provider>
  );
}
