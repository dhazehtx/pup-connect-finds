import React, { useState, useRef, useEffect } from 'react';
import { LazyImage } from './LazyImage';
import { imageOptimization } from '@/utils/imageOptimization';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  className?: string;
  containerClassName?: string;
  sizes?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  quality = 80,
  className,
  containerClassName,
  sizes,
  priority = false,
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Generate optimized URLs
  const optimizedSrc = imageOptimization.getOptimizedUrl(src, {
    width,
    height,
    quality,
    format: 'webp'
  });

  const srcSet = imageOptimization.generateSrcSet(src);
  const imageSizes = sizes || imageOptimization.generateSizes();

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // For priority images, preload immediately
  useEffect(() => {
    if (priority) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = optimizedSrc;
      document.head.appendChild(link);

      return () => {
        document.head.removeChild(link);
      };
    }
  }, [priority, optimizedSrc]);

  if (hasError) {
    return (
      <div className={cn(
        'bg-gray-200 flex items-center justify-center text-gray-400',
        className
      )}>
        <span className="text-sm">Image unavailable</span>
      </div>
    );
  }

  return (
    <LazyImage
      src={optimizedSrc}
      alt={alt}
      className={cn(
        'transition-opacity duration-300',
        isLoaded ? 'opacity-100' : 'opacity-0',
        className
      )}
      containerClassName={containerClassName}
      onLoad={handleLoad}
      onError={handleError}
      sizes={imageSizes}
      loading={priority ? 'eager' : 'lazy'}
    />
  );
};