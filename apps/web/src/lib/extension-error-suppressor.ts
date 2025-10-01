// Early extension error suppression - runs before other scripts
// This catches extension errors at the earliest possible point

if (typeof window !== 'undefined') {
  // Store original error handlers
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  const originalConsoleLog = console.log;

  // Function to check if message should be suppressed
  const isExtensionError = (message: string): boolean => {
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
      'popup.js',
      'walletconnect',
      'metamask',
      'coinbase',
      'trust wallet',
      'exodus',
      'binance',
      'bitget'
    ];

    return extensionPatterns.some(pattern => 
      message.toLowerCase().includes(pattern.toLowerCase())
    );
  };

  // Override console methods
  console.error = (...args: any[]) => {
    const message = args.join(' ');
    if (isExtensionError(message)) {
      return; // Suppress extension errors
    }
    originalConsoleError.apply(console, args);
  };

  console.warn = (...args: any[]) => {
    const message = args.join(' ');
    if (isExtensionError(message)) {
      return; // Suppress extension warnings
    }
    originalConsoleWarn.apply(console, args);
  };

  console.log = (...args: any[]) => {
    const message = args.join(' ');
    if (isExtensionError(message)) {
      return; // Suppress extension logs
    }
    originalConsoleLog.apply(console, args);
  };

  // Global error handler
  window.addEventListener('error', (event) => {
    if (isExtensionError(event.message)) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }, true);

  // Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    const message = String(event.reason);
    if (isExtensionError(message)) {
      event.preventDefault();
      return false;
    }
  }, true);

  // Additional handler for runtime errors
  window.addEventListener('error', (event) => {
    if (event.filename && (
      event.filename.includes('chrome-extension://') ||
      event.filename.includes('moz-extension://') ||
      event.filename.includes('safari-extension://') ||
      event.filename.includes('inpage.js') ||
      event.filename.includes('content.js')
    )) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }, true);
}

export {}; // Make this a module
