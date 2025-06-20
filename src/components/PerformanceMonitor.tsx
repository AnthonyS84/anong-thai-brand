import React from 'react';

// Lightweight performance monitor component
// Only active in development mode to avoid production overhead
const PerformanceMonitor: React.FC = () => {
  // Only run in development environment
  if (import.meta.env.VITE_ENVIRONMENT !== 'development') {
    return null;
  }

  // Simple console logging for development
  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.performance) {
      const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
      if (loadTime > 0) {
        console.log(`🚀 Page load time: ${loadTime}ms`);
      }
    }
  }, []);

  return null; // No UI component needed
};

export default PerformanceMonitor;