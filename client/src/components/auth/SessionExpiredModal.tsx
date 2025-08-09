import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface SessionExpiredModalProps {
  onRedirect?: () => void;
}

export default function SessionExpiredModal({ onRedirect }: SessionExpiredModalProps) {
  const [open, setOpen] = useState(false);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // Listen for 440 status responses globally
    const handleFetchError = (event: CustomEvent) => {
      if (event.detail?.status === 440) {
        setOpen(true);
        startCountdown();
      }
    };

    // Listen for session expired events from API calls
    window.addEventListener('sessionExpired', handleFetchError as EventListener);
    
    return () => {
      window.removeEventListener('sessionExpired', handleFetchError as EventListener);
    };
  }, []);

  const startCountdown = () => {
    let timeLeft = 10;
    const timer = setInterval(() => {
      timeLeft -= 1;
      setCountdown(timeLeft);
      
      if (timeLeft <= 0) {
        clearInterval(timer);
        handleSignIn();
      }
    }, 1000);
  };

  const handleSignIn = () => {
    if (onRedirect) {
      onRedirect();
    } else {
      // Clear any stored auth data
      localStorage.removeItem('lastActive');
      sessionStorage.clear();
      
      // Redirect to auth page
      window.location.href = '/auth';
    }
  };

  const handleExtendSession = async () => {
    try {
      // Try to refresh the current session
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        // Session refreshed successfully
        localStorage.setItem('lastActive', Date.now().toString());
        setOpen(false);
        window.location.reload(); // Reload to ensure fresh state
      } else {
        // Refresh failed, proceed to sign in
        handleSignIn();
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      handleSignIn();
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Session Expired
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Your session has timed out due to inactivity. For your security, you'll need to sign in again to continue.
          </p>
          
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <p className="text-sm text-gray-800 dark:text-gray-200">
              Automatically redirecting in <span className="font-bold">{countdown}</span> seconds...
            </p>
          </div>
          
          <div className="flex gap-3 pt-2">
            <Button 
              onClick={handleExtendSession}
              variant="outline"
              className="flex-1"
            >
              Try to Refresh
            </Button>
            <Button 
              onClick={handleSignIn}
              className="flex-1"
            >
              Sign In Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}