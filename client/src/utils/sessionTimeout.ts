let logoutTimer: NodeJS.Timeout;
let warningTimer: NodeJS.Timeout;

export function startSessionTimeout(
  onTimeout: () => void, 
  onWarning?: () => void,
  timeoutMinutes = 30,
  warningMinutes = 2
) {
  const resetTimers = () => {
    clearTimeout(logoutTimer);
    clearTimeout(warningTimer);
    
    // Set warning timer (2 minutes before logout)
    if (onWarning) {
      warningTimer = setTimeout(() => {
        onWarning();
      }, (timeoutMinutes - warningMinutes) * 60 * 1000);
    }
    
    // Set logout timer
    logoutTimer = setTimeout(() => {
      onTimeout();
    }, timeoutMinutes * 60 * 1000);
  };

  // Listen for activity
  ['click', 'mousemove', 'keydown', 'scroll', 'touchstart'].forEach(event =>
    window.addEventListener(event, resetTimers)
  );

  resetTimers(); // Start initially

  return () => {
    clearTimeout(logoutTimer);
    clearTimeout(warningTimer);
    ['click', 'mousemove', 'keydown', 'scroll', 'touchstart'].forEach(event =>
      window.removeEventListener(event, resetTimers)
    );
  };
}

export function stopSessionTimeout() {
  clearTimeout(logoutTimer);
  clearTimeout(warningTimer);
}