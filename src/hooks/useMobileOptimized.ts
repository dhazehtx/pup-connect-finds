
import { useState, useEffect } from 'react';
import { useIsMobile } from './use-mobile';

interface MobileOptimizedOptions {
  breakpoint?: number;
  orientation?: 'portrait' | 'landscape' | 'any';
}

export const useMobileOptimized = (options: MobileOptimizedOptions = {}) => {
  const { breakpoint = 768, orientation = 'any' } = options;
  const isMobile = useIsMobile();
  const [isLandscape, setIsLandscape] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [safeAreaInsets, setSafeAreaInsets] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  });

  useEffect(() => {
    const updateViewport = () => {
      setViewportHeight(window.innerHeight);
      setIsLandscape(window.innerWidth > window.innerHeight);
      
      // Get safe area insets for mobile devices
      const computedStyle = getComputedStyle(document.documentElement);
      setSafeAreaInsets({
        top: parseInt(computedStyle.getPropertyValue('--safe-area-inset-top') || '0'),
        bottom: parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0'),
        left: parseInt(computedStyle.getPropertyValue('--safe-area-inset-left') || '0'),
        right: parseInt(computedStyle.getPropertyValue('--safe-area-inset-right') || '0')
      });
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', updateViewport);

    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
    };
  }, []);

  const isOrientationMatch = orientation === 'any' || 
    (orientation === 'landscape' && isLandscape) ||
    (orientation === 'portrait' && !isLandscape);

  return {
    isMobile,
    isLandscape,
    isPortrait: !isLandscape,
    viewportHeight,
    safeAreaInsets,
    isOrientationMatch,
    // Helper functions
    getMobileClasses: (mobileClasses: string, desktopClasses: string = '') => 
      isMobile ? mobileClasses : desktopClasses,
    getResponsiveSpacing: (mobile: string, desktop: string) => 
      isMobile ? mobile : desktop
  };
};
