
import React from 'react';
import { useMobileOptimized } from '@/hooks/useMobileOptimized';
import { cn } from '@/lib/utils';

interface MobileOptimizedLayoutProps {
  children: React.ReactNode;
  className?: string;
  enableSafeArea?: boolean;
  enableSwipeNavigation?: boolean;
}

const MobileOptimizedLayout = ({ 
  children, 
  className,
  enableSafeArea = true,
  enableSwipeNavigation = false
}: MobileOptimizedLayoutProps) => {
  const { isMobile, safeAreaInsets, getMobileClasses } = useMobileOptimized();

  return (
    <div 
      className={cn(
        'w-full min-h-screen',
        getMobileClasses(
          'touch-manipulation overscroll-behavior-contain',
          'cursor-default'
        ),
        enableSafeArea && isMobile && 'pb-safe-bottom pt-safe-top',
        className
      )}
      style={enableSafeArea && isMobile ? {
        paddingTop: safeAreaInsets.top,
        paddingBottom: safeAreaInsets.bottom,
        paddingLeft: safeAreaInsets.left,
        paddingRight: safeAreaInsets.right
      } : undefined}
    >
      <div className={cn(
        'w-full',
        enableSwipeNavigation && 'touch-pan-x'
      )}>
        {children}
      </div>
    </div>
  );
};

export default MobileOptimizedLayout;
