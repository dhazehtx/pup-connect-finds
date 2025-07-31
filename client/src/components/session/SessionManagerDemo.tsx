import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';

interface SessionStatus {
  authenticated: boolean;
  user_id?: string;
  last_active?: string;
  session_expired?: boolean;
  time_remaining?: number;
}

export default function SessionManagerDemo() {
  const [sessionStatus, setSessionStatus] = useState<SessionStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<string>('');
  const [error, setError] = useState<string>('');

  const checkSessionStatus = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/status?user_id=8b7adf6a-eb74-43a0-9a26-575e65886ac5');
      const data = await response.json();
      
      if (response.ok) {
        setSessionStatus(data);
      } else {
        setError(data.message || 'Failed to check session status');
      }
    } catch (err) {
      setError('Network error checking session status');
      console.error('Session status error:', err);
    }
    
    setLoading(false);
  };

  const refreshSession = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: '8b7adf6a-eb74-43a0-9a26-575e65886ac5'
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setLastRefresh(data.timestamp);
        // Update localStorage to match client-side session management
        localStorage.setItem('lastActive', Date.now().toString());
        await checkSessionStatus(); // Refresh status after successful refresh
      } else {
        setError(data.message || 'Failed to refresh session');
      }
    } catch (err) {
      setError('Network error refreshing session');
      console.error('Session refresh error:', err);
    }
    
    setLoading(false);
  };

  const testSessionTimeout = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Make a request to a protected endpoint to test session timeout middleware
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: '8b7adf6a-eb74-43a0-9a26-575e65886ac5',
          title: 'Session Timeout Test',
          content: 'Testing session management middleware',
          category: 'test'
        })
      });
      
      const data = await response.json();
      
      if (response.status === 440) {
        setError('Session expired - middleware working correctly!');
        // Trigger the session expired modal
        const event = new CustomEvent('sessionExpired', {
          detail: { status: 440, message: 'Session expired due to inactivity' }
        });
        window.dispatchEvent(event);
      } else if (response.ok) {
        setError('Post created successfully - session is active');
        await checkSessionStatus();
      } else {
        setError(`API Error: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      setError('Network error testing session timeout');
      console.error('Session timeout test error:', err);
    }
    
    setLoading(false);
  };

  const formatTimeRemaining = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  useEffect(() => {
    checkSessionStatus();
    
    // Auto-refresh status every 30 seconds
    const interval = setInterval(checkSessionStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Session Management Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={checkSessionStatus}
              disabled={loading}
              variant="outline"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
              Check Status
            </Button>
            <Button 
              onClick={refreshSession}
              disabled={loading}
            >
              Refresh Session
            </Button>
            <Button 
              onClick={testSessionTimeout}
              disabled={loading}
              variant="secondary"
            >
              Test Protected Route
            </Button>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span className="text-sm text-red-800 dark:text-red-200">{error}</span>
            </div>
          )}

          {sessionStatus && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {sessionStatus.authenticated ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  Session Status
                  <Badge variant={sessionStatus.authenticated ? "default" : "destructive"}>
                    {sessionStatus.authenticated ? "Active" : "Expired"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>User ID:</strong> {sessionStatus.user_id || 'N/A'}
                  </div>
                  <div>
                    <strong>Last Active:</strong> {
                      sessionStatus.last_active 
                        ? new Date(sessionStatus.last_active).toLocaleString()
                        : 'N/A'
                    }
                  </div>
                  <div>
                    <strong>Session Expired:</strong> {sessionStatus.session_expired ? 'Yes' : 'No'}
                  </div>
                  <div>
                    <strong>Time Remaining:</strong> {
                      sessionStatus.time_remaining 
                        ? formatTimeRemaining(sessionStatus.time_remaining)
                        : 'N/A'
                    }
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {lastRefresh && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Last refresh: {new Date(lastRefresh).toLocaleString()}
            </div>
          )}

          <div className="text-xs text-gray-500 dark:text-gray-400 border-t pt-4">
            <p><strong>Demo Features:</strong></p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>15-minute session timeout with server-side middleware</li>
              <li>Session refresh endpoint to extend activity</li>
              <li>Protected route testing (posts creation)</li>
              <li>Session expired modal trigger (status 440)</li>
              <li>Real-time session status monitoring</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}