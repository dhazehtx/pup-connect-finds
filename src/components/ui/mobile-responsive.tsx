
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface MobileResponsiveProps {
  children: React.ReactNode;
  className?: string;
  breakpoint?: 'sm' | 'md' | 'lg';
}

export const MobileResponsive = ({ 
  children, 
  className, 
  breakpoint = 'md' 
}: MobileResponsiveProps) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      const breakpoints = {
        sm: 640,
        md: 768,
        lg: 1024
      };
      setIsMobile(window.innerWidth < breakpoints[breakpoint]);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, [breakpoint]);

  return (
    <div className={cn(
      'w-full',
      isMobile ? 'px-4 py-2' : 'px-6 py-4',
      className
    )}>
      {children}
    </div>
  );
};

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

export const ResponsiveGrid = ({ 
  children, 
  className, 
  cols = { mobile: 1, tablet: 2, desktop: 3 } 
}: ResponsiveGridProps) => {
  return (
    <div className={cn(
      'grid gap-4',
      `grid-cols-${cols.mobile}`,
      `md:grid-cols-${cols.tablet}`,
      `lg:grid-cols-${cols.desktop}`,
      className
    )}>
      {children}
    </div>
  );
};

interface MobileOptimizedCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

export const MobileOptimizedCard = ({ 
  children, 
  className, 
  padding = 'md' 
}: MobileOptimizedCardProps) => {
  const paddingConfig = {
    sm: 'p-3 md:p-4',
    md: 'p-4 md:p-6',
    lg: 'p-6 md:p-8'
  };

  return (
    <div className={cn(
      'bg-white rounded-lg border shadow-sm',
      paddingConfig[padding],
      'touch-manipulation', // Improves touch responsiveness
      className
    )}>
      {children}
    </div>
  );
};
