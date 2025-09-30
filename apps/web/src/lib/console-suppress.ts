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
      message.includes('Receiving end does not exist') ||
      message.includes('ConnectorNotFoundError') ||
      message.includes('Connection request reset') ||
      message.includes('User denied account authorization') ||
      message.includes('The message port closed before a response was received') ||
      message.includes('chrome-extension://') ||
      message.includes('moz-extension://') ||
      message.includes('safari-extension://')
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
      message.includes('Extension context invalidated') ||
      message.includes('Lit is in dev mode') ||
      message.includes('Not recommended for production')
    ) {
      return;
    }
    
    originalConsoleWarn.apply(console, args);
  };
}

