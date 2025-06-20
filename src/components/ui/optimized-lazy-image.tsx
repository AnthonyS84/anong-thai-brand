import { useState, useRef, useEffect, memo, useCallback } from 'react';

interface OptimizedLazyImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
  eager?: boolean;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: (error: Event) => void;
}

export const OptimizedLazyImage = memo(({ 
  src, 
  alt, 
  className, 
  containerClassName,
  priority = false,
  eager = false,
  fallbackSrc = "/placeholder.svg",
  onLoad,
  onError
}: OptimizedLazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority || eager);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>("");
  const imgRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

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
        rootMargin: '50px' // Reduced from 100px for more aggressive lazy loading
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, eager]);

  // Preload critical images
  useEffect(() => {
    if ((priority || isInView) && src && !hasError) {
      setImageSrc(src);
    }
  }, [src, priority, isInView, hasError]);

  // Optimized load handler
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  // Enhanced error handler with fallback
  const handleError = useCallback((event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true);
    setIsLoaded(true);
    setImageSrc(fallbackSrc);
    onError?.(event.nativeEvent);
  }, [fallbackSrc, onError]);

  // Optimize image loading with srcset for responsive images
  const optimizedSrc = hasError ? fallbackSrc : imageSrc;

  return (
    <div ref={imgRef} className={`relative ${containerClassName || ''}`}>
      {isInView && imageSrc && (
        <>
          <img
            ref={imageRef}
            src={optimizedSrc}
            alt={alt}
            className={`${className} transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleLoad}
            onError={handleError}
            loading={priority || eager ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={priority ? "high" : "auto"}
            // Add sizes for responsive images
            sizes={priority ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
          />
          {!isLoaded && (
            <div 
              className={`${className} bg-gradient-to-br from-anong-cream to-anong-ivory absolute inset-0 animate-pulse flex items-center justify-center`}
              aria-hidden="true"
            >
              <div className="w-6 h-6 border-2 border-anong-gold border-t-transparent rounded-full animate-spin opacity-50" />
            </div>
          )}
        </>
      )}
      {!isInView && !priority && !eager && (
        <div 
          className={`${className} bg-gradient-to-br from-anong-cream to-anong-ivory animate-pulse flex items-center justify-center`}
          aria-hidden="true"
        >
          <div className="w-4 h-4 bg-anong-gold/20 rounded-full" />
        </div>
      )}
    </div>
  );
});

OptimizedLazyImage.displayName = 'OptimizedLazyImage';
