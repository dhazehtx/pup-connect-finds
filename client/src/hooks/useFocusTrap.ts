import { useEffect, useRef, useCallback } from 'react';

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Trap focus inside a container and close on Escape.
 * Use for custom modal overlays that don't use Radix Dialog.
 */
export function useFocusTrap(active: boolean, onEscape: () => void) {
  const containerRef = useRef<HTMLElement | null>(null);

  const getFocusables = useCallback(() => {
    const el = containerRef.current;
    if (!el) return [];
    return Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (node) => node.getAttribute('tabindex') !== '-1' && !node.hasAttribute('disabled')
    );
  }, []);

  useEffect(() => {
    if (!active) return;

    const el = containerRef.current;
    if (!el) return;

    const focusables = getFocusables();
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (first) first.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onEscape();
        return;
      }
      if (e.key !== 'Tab' || focusables.length === 0) return;

      const target = e.target as HTMLElement;
      if (e.shiftKey) {
        if (target === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (target === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [active, onEscape, getFocusables]);

  return containerRef;
}
