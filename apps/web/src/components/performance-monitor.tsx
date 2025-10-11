"use client"

import { useEffect } from 'react'

export function PerformanceMonitor() {
  useEffect(() => {
    // Monitor Core Web Vitals
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Monitor Largest Contentful Paint (LCP)
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            console.log('LCP:', entry.startTime)
          }
          if (entry.entryType === 'first-input') {
            const fidEntry = entry as any
            console.log('FID:', fidEntry.processingStart - fidEntry.startTime)
          }
          if (entry.entryType === 'layout-shift') {
            const clsEntry = entry as any
            console.log('CLS:', clsEntry.value)
          }
        }
      })

      try {
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] })
      } catch (e) {
        // Fallback for older browsers
        console.log('Performance monitoring not fully supported')
      }

      // Monitor page load time
      window.addEventListener('load', () => {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart
        console.log('Page load time:', loadTime + 'ms')
      })

      // Monitor API response times
      const originalFetch = window.fetch
      window.fetch = async (...args) => {
        const start = performance.now()
        const response = await originalFetch(...args)
        const end = performance.now()
        console.log(`API call to ${args[0]} took ${end - start}ms`)
        return response
      }
    }
  }, [])

  return null
}
