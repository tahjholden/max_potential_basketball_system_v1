'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

interface PerformanceOptimizerProps {
  children: ReactNode;
  threshold?: number;
  rootMargin?: string;
  fallback?: ReactNode;
}

export function LazyLoad({ 
  children, 
  threshold = 0.1, 
  rootMargin = '50px',
  fallback = <div className="animate-pulse bg-gray-200 h-32 rounded" />
}: PerformanceOptimizerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return (
    <div ref={ref}>
      {isVisible ? children : fallback}
    </div>
  );
}

interface ImageOptimizerProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export function OptimizedImage({ 
  src, 
  alt, 
  width, 
  height, 
  className,
  priority = false 
}: ImageOptimizerProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
    />
  );
}

// Hook for performance monitoring
export function usePerformanceMonitor(componentName: string) {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.performance) {
      const startTime = performance.now();
      
      return () => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        if (duration > 16) { // Log if render takes longer than 16ms (60fps)
          console.warn(`${componentName} render took ${duration.toFixed(2)}ms`);
        }
      };
    }
  }, [componentName]);
}

// Hook for debouncing
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
} 