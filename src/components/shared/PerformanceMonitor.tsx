import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  domReady: number;
  firstPaint: number;
  largestContentfulPaint?: number;
  cumulativeLayoutShift?: number;
  firstInputDelay?: number;
}

export const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [showMetrics, setShowMetrics] = useState(false);

  useEffect(() => {
    // Only run in development mode
    if (process.env.NODE_ENV !== 'development') return;

    const measurePerformance = () => {
      if (!window.performance || !window.performance.timing) return;

      const timing = window.performance.timing;
      const navigation = window.performance.navigation;

      const metrics: PerformanceMetrics = {
        loadTime: timing.loadEventEnd - timing.navigationStart,
        domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
        firstPaint: timing.loadEventStart - timing.navigationStart,
      };

      // Get Web Vitals if available
      if ('PerformanceObserver' in window) {
        try {
          // Largest Contentful Paint
          new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            if (entries.length > 0) {
              const lastEntry = entries[entries.length - 1];
              setMetrics(prev => prev ? { ...prev, largestContentfulPaint: lastEntry.startTime } : null);
            }
          }).observe({ entryTypes: ['largest-contentful-paint'] });

          // Cumulative Layout Shift
          new PerformanceObserver((entryList) => {
            let cls = 0;
            for (const entry of entryList.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                cls += (entry as any).value;
              }
            }
            setMetrics(prev => prev ? { ...prev, cumulativeLayoutShift: cls } : null);
          }).observe({ entryTypes: ['layout-shift'] });

          // First Input Delay
          new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            if (entries.length > 0) {
              const firstEntry = entries[0];
              setMetrics(prev => prev ? { ...prev, firstInputDelay: (firstEntry as any).processingStart - firstEntry.startTime } : null);
            }
          }).observe({ entryTypes: ['first-input'] });
        } catch (error) {
          console.warn('Performance monitoring not supported:', error);
        }
      }

      setMetrics(metrics);
    };

    // Wait for page to load
    if (document.readyState === 'complete') {
      setTimeout(measurePerformance, 1000);
    } else {
      window.addEventListener('load', () => {
        setTimeout(measurePerformance, 1000);
      });
    }

    // Toggle metrics display with keyboard shortcut
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setShowMetrics(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (process.env.NODE_ENV !== 'development' || !showMetrics || !metrics) {
    return null;
  }

  const getScoreColor = (metric: string, value: number) => {
    const thresholds: Record<string, [number, number]> = {
      loadTime: [2000, 4000],
      domReady: [1500, 3000],
      largestContentfulPaint: [2500, 4000],
      cumulativeLayoutShift: [0.1, 0.25],
      firstInputDelay: [100, 300],
    };

    const [good, poor] = thresholds[metric] || [0, 0];
    
    if (metric === 'cumulativeLayoutShift') {
      if (value <= good) return 'text-green-600';
      if (value <= poor) return 'text-yellow-600';
      return 'text-red-600';
    } else {
      if (value <= good) return 'text-green-600';
      if (value <= poor) return 'text-yellow-600';
      return 'text-red-600';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg p-4 shadow-lg text-xs font-mono z-50 max-w-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-800">Performance Metrics</h3>
        <button 
          onClick={() => setShowMetrics(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-1">
        <div className={`flex justify-between ${getScoreColor('loadTime', metrics.loadTime)}`}>
          <span>Load Time:</span>
          <span>{metrics.loadTime}ms</span>
        </div>
        
        <div className={`flex justify-between ${getScoreColor('domReady', metrics.domReady)}`}>
          <span>DOM Ready:</span>
          <span>{metrics.domReady}ms</span>
        </div>
        
        {metrics.largestContentfulPaint && (
          <div className={`flex justify-between ${getScoreColor('largestContentfulPaint', metrics.largestContentfulPaint)}`}>
            <span>LCP:</span>
            <span>{Math.round(metrics.largestContentfulPaint)}ms</span>
          </div>
        )}
        
        {metrics.cumulativeLayoutShift !== undefined && (
          <div className={`flex justify-between ${getScoreColor('cumulativeLayoutShift', metrics.cumulativeLayoutShift)}`}>
            <span>CLS:</span>
            <span>{metrics.cumulativeLayoutShift.toFixed(3)}</span>
          </div>
        )}
        
        {metrics.firstInputDelay && (
          <div className={`flex justify-between ${getScoreColor('firstInputDelay', metrics.firstInputDelay)}`}>
            <span>FID:</span>
            <span>{Math.round(metrics.firstInputDelay)}ms</span>
          </div>
        )}
      </div>
      
      <div className="mt-2 pt-2 border-t border-gray-200 text-gray-500">
        Press Ctrl+Shift+P to toggle
      </div>
    </div>
  );
};

export default PerformanceMonitor;
