
import { useEffect } from 'react'
import { PerformanceMonitor } from './performance-monitor'

export function PerformanceOptimizer() {
  useEffect(() => {
    // Delay non-critical optimizations to avoid blocking initial render
    const initializeOptimizations = () => {
      // Optimize images
      const optimizeImages = () => {
        const images = document.querySelectorAll('img')
        images.forEach(img => {
          if (!img.loading) {
            img.loading = 'lazy'
          }
          if (!img.decoding) {
            img.decoding = 'async'
          }
        })
      }

      // Service Worker registration for caching
      if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('SW registered: ', registration)
          })
          .catch(registrationError => {
            console.log('SW registration failed: ', registrationError)
          })
      }

      // Run image optimization
      optimizeImages()
    }

    // Use requestIdleCallback for non-critical optimizations
    if ('requestIdleCallback' in window) {
      requestIdleCallback(initializeOptimizations, { timeout: 2000 })
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(initializeOptimizations, 100)
    }
  }, [])

  // Only render performance monitor in development
  if (process.env.NODE_ENV === 'development') {
    return <PerformanceMonitor />
  }

  return null
}