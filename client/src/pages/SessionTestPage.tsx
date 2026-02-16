import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Shield, Activity, Server } from 'lucide-react';
import SessionManagerDemo from '@/components/session/SessionManagerDemo';
import { useSessionManager } from '@/hooks/useSessionManager';

export default function SessionTestPage() {
  const { updateLastActive, checkSessionExpiry, refreshToken } = useSessionManager();

  useEffect(() => {
    // Initialize session manager on page load
    updateLastActive();
  }, [updateLastActive]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Session Management Test Center
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Comprehensive testing interface for 15-minute session timeout, token refresh, 
            and security middleware validation
          </p>
        </div>

        {/* Feature Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                Session Timeout
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="outline">15 Minutes</Badge>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Automatic logout after inactivity period
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-600" />
                Activity Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="outline">Real-time</Badge>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Mouse, keyboard, touch, and scroll monitoring
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Server className="h-4 w-4 text-purple-600" />
                Middleware
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="outline">Protected Routes</Badge>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Server-side validation with 440 status codes
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                Security Modal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="outline">User Friendly</Badge>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Countdown timer with refresh option
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interactive Demo */}
        <SessionManagerDemo />

        {/* Technical Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Server className="h-5 w-5" />
              Implementation Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Server-Side Features</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <span>sessionTimeout middleware for protected routes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <span>Automatic user activity tracking and IP logging</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <span>RESTful auth endpoints (/refresh, /status)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <span>440 status code for session expiry</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Client-Side Features</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <span>useSessionManager hook for activity monitoring</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <span>SessionExpiredModal with countdown timer</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <span>Automatic token refresh every 10 minutes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <span>localStorage persistence for session state</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Protected Routes</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">POST /api/posts</Badge>
                <Badge variant="secondary">POST /api/comments</Badge>
                <Badge variant="secondary">POST /api/notifications</Badge>
                <Badge variant="secondary">All user content creation</Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                These routes automatically validate session timeout and return 440 status if expired
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Testing Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <strong className="text-gray-900 dark:text-white">1. Session Status:</strong>
                <span className="ml-2">Click "Check Status" to see current session validity and time remaining</span>
              </div>
              <div>
                <strong className="text-gray-900 dark:text-white">2. Session Refresh:</strong>
                <span className="ml-2">Click "Refresh Session" to extend your activity time</span>
              </div>
              <div>
                <strong className="text-gray-900 dark:text-white">3. Protected Route Test:</strong>
                <span className="ml-2">Click "Test Protected Route" to verify middleware functionality</span>
              </div>
              <div>
                <strong className="text-gray-900 dark:text-white">4. Session Expiry:</strong>
                <span className="ml-2">Wait 15 minutes of inactivity to see the session expired modal</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}