
import { useState, useEffect } from 'react';

export const useMobileOptimized = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setWindowSize({ width, height });
      setIsMobile(width < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const safeAreaInsets = {
    top: 0,
    bottom: isMobile ? 16 : 0,
    left: 0,
    right: 0,
  };

  const getMobileClasses = (mobileClasses: string, desktopClasses: string = '') => {
    return isMobile ? mobileClasses : desktopClasses;
  };

  return {
    isMobile,
    windowSize,
    safeAreaInsets,
    getMobileClasses,
  };
};
