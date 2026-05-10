import { PawPrint } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Brand paw mark — PAWS blue (#2563EB). Default 30×30px (nav 28–32px range). Override with `className` (e.g. hero). */
export function PawsLogoMark({ className }: { className?: string }) {
  return (
    <PawPrint
      className={cn('h-[30px] w-[30px] shrink-0 text-[#2563EB]', className)}
      strokeWidth={2.25}
      aria-hidden
    />
  );
}
