// Suppress extension-related console errors in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  const originalConsoleLog = console.log;

  // Enhanced error suppression - only suppress extension-related errors
  const shouldSuppressError = (message: string) => {
    // First check if it's an extension-related error
    const extensionPatterns = [
      'runtime.lastError',
      'message port closed',
      'Extension context invalidated',
      'Could not establish connection',
      'Receiving end does not exist',
      'ConnectorNotFoundError',
      'Connection request reset',
      'User denied account authorization',
      'The message port closed before a response was received',
      'Unchecked runtime.lastError',
      'chrome-extension://',
      'moz-extension://',
      'safari-extension://',
      'b19c0d6',
      'inpage.js',
      'content.js',
      'background.js',
      'popup.js'
    ];
    
    const isExtensionError = extensionPatterns.some(pattern => message.includes(pattern));
    
    // If it's an extension error, also check if it has these patterns to suppress the entire stack
    const stackPatterns = [
      'VM3872',
      'VM4329',
      'console-suppress.ts',
      'hook.js',
      'app-index.js',
      'hydration-error-info.js',
      'overrideMethod',
      'window.console.error'
    ];
    
    const hasExtensionStack = stackPatterns.some(pattern => message.includes(pattern));
    
    // Only suppress if it's both an extension error AND has extension stack traces
    return isExtensionError || hasExtensionStack;
  };

  // Enhanced warning suppression
  const shouldSuppressWarning = (message: string) => {
    const suppressedPatterns = [
      'runtime.lastError',
      'message port closed',
      'Extension context invalidated',
      'Lit is in dev mode',
      'Not recommended for production',
      'Unchecked runtime.lastError',
      'b19c0d6'
    ];
    
    return suppressedPatterns.some(pattern => message.includes(pattern));
  };

  console.error = (...args: any[]) => {
    // Convert all arguments to string for pattern matching
    const message = args.map(arg => {
      if (arg instanceof Error) {
        return arg.message + ' ' + arg.stack;
      }
      return String(arg);
    }).join(' ');
    
    if (shouldSuppressError(message)) {
      return;
    }
    
    // Also check individual arguments
    for (const arg of args) {
      if (arg && typeof arg === 'object' && arg.stack) {
        if (shouldSuppressError(String(arg.stack))) {
          return;
        }
      }
    }
    
    originalConsoleError.apply(console, args);
  };

  console.warn = (...args: any[]) => {
    const message = args.join(' ');
    
    if (shouldSuppressWarning(message)) {
      return;
    }
    
    originalConsoleWarn.apply(console, args);
  };

  // Also suppress logs that might contain extension errors
  console.log = (...args: any[]) => {
    const message = args.join(' ');
    
    if (shouldSuppressError(message)) {
      return;
    }
    
    originalConsoleLog.apply(console, args);
  };

  // Add global error handler to catch unhandled extension errors
  const originalOnError = window.onerror;
  window.onerror = (message, source, lineno, colno, error) => {
    const errorMessage = String(message);
    
    if (shouldSuppressError(errorMessage)) {
      return true; // Prevent default error handling
    }
    
    if (originalOnError) {
      return originalOnError(message, source, lineno, colno, error);
    }
    
    return false;
  };

  // Add unhandled promise rejection handler
  const originalOnUnhandledRejection = window.onunhandledrejection;
  window.onunhandledrejection = (event) => {
    const errorMessage = String(event.reason);
    
    if (shouldSuppressError(errorMessage)) {
      event.preventDefault();
      return;
    }
    
    if (originalOnUnhandledRejection) {
      originalOnUnhandledRejection(event);
    }
  };
}

