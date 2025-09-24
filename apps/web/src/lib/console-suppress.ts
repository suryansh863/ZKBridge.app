// Suppress extension-related console errors in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  console.error = (...args: any[]) => {
    const message = args.join(' ');
    
    // Suppress extension-related errors
    if (
      message.includes('runtime.lastError') ||
      message.includes('message port closed') ||
      message.includes('Extension context invalidated') ||
      message.includes('Could not establish connection') ||
      message.includes('Receiving end does not exist')
    ) {
      return;
    }
    
    originalConsoleError.apply(console, args);
  };

  console.warn = (...args: any[]) => {
    const message = args.join(' ');
    
    // Suppress extension-related warnings
    if (
      message.includes('runtime.lastError') ||
      message.includes('message port closed') ||
      message.includes('Extension context invalidated')
    ) {
      return;
    }
    
    originalConsoleWarn.apply(console, args);
  };
}

