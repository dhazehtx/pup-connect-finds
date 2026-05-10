import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { PawsLogoMark } from '@/components/branding/PawsLogoMark';

const LOGO_SRC = '/logo/paws-logo.png';

/** Raster logo with vector fallback; h-9 matches primary nav row. */
function NavbarLogoMark({ className }: { className?: string }) {
  const [useFallback, setUseFallback] = React.useState(false);

  if (useFallback) {
    return <PawsLogoMark className={cn('h-9 w-9 shrink-0', className)} />;
  }

  return (
    <img
      src={LOGO_SRC}
      alt="PAWS logo"
      decoding="async"
      className={cn('h-9 w-auto max-h-9 shrink-0 object-contain', className)}
      onError={() => setUseFallback(true)}
    />
  );
}

type NavbarPawsBrandProps = {
  to?: string;
  className?: string;
};

/**
 * Minimal nav brand: paw icon only (no wordmark). Primary identity + link to homepage.
 */
export function NavbarPawsBrand({ to = '/', className }: NavbarPawsBrandProps) {
  return (
    <Link
      to={to}
      className={cn(
        'inline-flex shrink-0 items-center justify-center text-left no-underline outline-none',
        'transition-[transform,opacity] duration-200 ease-out',
        'hover:scale-[1.04] hover:opacity-90 active:scale-[0.97]',
        'focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-[#2563EB]/35 focus-visible:ring-offset-2',
        className,
      )}
      aria-label="PAWS — Home"
    >
      <NavbarLogoMark />
    </Link>
  );
}
