import { useEffect, useRef, useState } from 'react';
import { performanceUtils } from '@/utils/performanceOptimizations';

interface LazyImageOptions {
  threshold?: number;
  rootMargin?: string;
  fallbackSrc?: string;
}

export const useImageLazyLoading = (
  src: string,
  options: LazyImageOptions = {}
) => {
  const {
    threshold = 0.1,
    rootMargin = '50px 0px',
    fallbackSrc = '/placeholder-image.jpg'
  } = options;

  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(fallbackSrc);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = performanceUtils.createImageObserver((entry) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        observer.unobserve(entry.target);
      }
    });

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isInView && !isLoaded && !hasError) {
      const img = new Image();
      
      img.onload = () => {
        setCurrentSrc(src);
        setIsLoaded(true);
      };
      
      img.onerror = () => {
        setHasError(true);
        setCurrentSrc(fallbackSrc);
      };
      
      img.src = src;
    }
  }, [isInView, src, isLoaded, hasError, fallbackSrc]);

  return {
    imgRef,
    src: currentSrc,
    isLoaded,
    isInView,
    hasError
  };
};