/**
 * Web Vitals Tracker
 * Lightweight script to measure and report Core Web Vitals (CLS, FID, LCP, FCP, TTFB, INP)
 * Zero dependencies, using only native browser APIs
 */

(function() {
  'use strict';

  // Store vitals data
  const vitals = {
    url: window.location.href,
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
    metrics: {}
  };

  // Report metric to console and optionally to analytics endpoint
  function reportMetric(name, value, rating) {
    vitals.metrics[name] = { value, rating };
    
    console.log(`[Web Vitals] ${name}: ${value.toFixed(2)}ms (${rating})`);
    
    // Optional: Send to analytics endpoint
    // if (window.gtag) {
    //   gtag('event', name, {
    //     event_category: 'Web Vitals',
    //     value: Math.round(value),
    //     event_label: rating,
    //     non_interaction: true
    //   });
    // }
  }

  // Get rating based on thresholds
  function getRating(name, value) {
    const thresholds = {
      CLS: { good: 0.1, poor: 0.25 },
      FID: { good: 100, poor: 300 },
      LCP: { good: 2500, poor: 4000 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 800, poor: 1800 },
      INP: { good: 200, poor: 500 }
    };

    const threshold = thresholds[name];
    if (!threshold) return 'unknown';
    
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  // Largest Contentful Paint (LCP)
  function measureLCP() {
    if (!window.PerformanceObserver) return;
    
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        const value = lastEntry.renderTime || lastEntry.loadTime;
        reportMetric('LCP', value, getRating('LCP', value));
      });
      
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
      console.warn('[Web Vitals] LCP not supported', e);
    }
  }

  // First Input Delay (FID)
  function measureFID() {
    if (!window.PerformanceObserver) return;
    
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const value = entry.processingStart - entry.startTime;
          reportMetric('FID', value, getRating('FID', value));
        });
      });
      
      observer.observe({ type: 'first-input', buffered: true });
    } catch (e) {
      console.warn('[Web Vitals] FID not supported', e);
    }
  }

  // Interaction to Next Paint (INP) - replaces FID
  function measureINP() {
    if (!window.PerformanceObserver) return;
    
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const value = entry.duration;
          reportMetric('INP', value, getRating('INP', value));
        });
      });
      
      observer.observe({ type: 'event', buffered: true, durationThreshold: 40 });
    } catch (e) {
      // INP is newer, might not be supported everywhere
      console.debug('[Web Vitals] INP not supported');
    }
  }

  // Cumulative Layout Shift (CLS)
  function measureCLS() {
    if (!window.PerformanceObserver) return;
    
    let clsValue = 0;
    
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        reportMetric('CLS', clsValue, getRating('CLS', clsValue));
      });
      
      observer.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      console.warn('[Web Vitals] CLS not supported', e);
    }
  }

  // First Contentful Paint (FCP)
  function measureFCP() {
    if (!window.PerformanceObserver) return;
    
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            reportMetric('FCP', entry.startTime, getRating('FCP', entry.startTime));
          }
        });
      });
      
      observer.observe({ type: 'paint', buffered: true });
    } catch (e) {
      console.warn('[Web Vitals] FCP not supported', e);
    }
  }

  // Time to First Byte (TTFB)
  function measureTTFB() {
    try {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        const value = navigation.responseStart - navigation.requestStart;
        reportMetric('TTFB', value, getRating('TTFB', value));
      }
    } catch (e) {
      console.warn('[Web Vitals] TTFB not supported', e);
    }
  }

  // Initialize all measurements
  function init() {
    if ('PerformanceObserver' in window) {
      measureLCP();
      measureFID();
      measureINP();
      measureCLS();
      measureFCP();
    }
    
    // TTFB can be measured immediately
    if (document.readyState === 'complete') {
      measureTTFB();
    } else {
      window.addEventListener('load', measureTTFB);
    }

    // Report summary after page is fully loaded
    window.addEventListener('load', () => {
      setTimeout(() => {
        console.log('[Web Vitals] Summary:', vitals);
      }, 1000);
    });

    // Report when page is about to unload
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        console.log('[Web Vitals] Page hidden, final metrics:', vitals);
      }
    });
  }

  // Start tracking when DOM is ready
  if (document.readyState !== 'loading') {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }

  // Expose vitals data globally for debugging
  window.__webVitals = vitals;
})();
