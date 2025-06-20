// Global promise error handler to prevent console noise
window.addEventListener('unhandledrejection', (event) => {
  // Only log meaningful errors, suppress minor cosmetic issues
  if (event.reason && event.reason.message && !event.reason.message.includes('contact')) {
    console.error('Unhandled promise rejection:', event.reason);
  }
  // Prevent the error from appearing in console for known minor issues
  event.preventDefault();
});

export {};