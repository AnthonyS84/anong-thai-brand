
import { useState, useRef, useEffect, memo } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
  eager?: boolean;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  loading?: 'lazy' | 'eager';
  style?: React.CSSProperties;
}

export const OptimizedImage = memo(({ 
  src, 
  alt, 
  className, 
  containerClassName,
  priority = false,
  eager = false,
  onError,
  loading = 'lazy',
  style
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority || eager);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || eager) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, eager]);

  // Preload critical images
  useEffect(() => {
    if (priority && src) {
      const img = new Image();
      img.src = src;
      img.onload = () => setIsLoaded(true);
      img.onerror = () => setHasError(true);
    }
  }, [src, priority]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setHasError(true);
    setIsLoaded(true);
    if (onError) {
      onError(e);
    }
  };

  return (
    <div ref={imgRef} className={containerClassName}>
      {isInView && (
        <>
          <img
            src={hasError ? "/placeholder.svg" : src}
            alt={alt}
            className={`${className} transition-opacity duration-200 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={style}
            onLoad={handleLoad}
            onError={handleError}
            loading={priority || eager ? "eager" : loading}
            decoding="async"
            fetchPriority={priority ? "high" : "auto"}
          />
          {!isLoaded && !hasError && (
            <div className={`${className} bg-gray-100 absolute inset-0 animate-pulse`} />
          )}
        </>
      )}
      {!isInView && !priority && !eager && (
        <div className={`${className} bg-gray-100 animate-pulse`} />
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';
