import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Bug, Database, Network, Clock } from 'lucide-react';
import { useErrorReporting } from '@/components/ErrorBoundary';

const ErrorTestPage = () => {
  const [loading, setLoading] = useState(false);
  const { reportError } = useErrorReporting();

  const triggerComponentError = () => {
    // This will trigger the error boundary
    throw new Error('Test component error - This is a simulated error for testing purposes');
  };

  const triggerAsyncError = async () => {
    setLoading(true);
    try {
      // Simulate async operation that fails
      await new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Async operation failed - This is a test error'));
        }, 1000);
      });
    } catch (error) {
      reportError(error as Error, 'async-operation-test');
    } finally {
      setLoading(false);
    }
  };

  const triggerAPIError = async () => {
    try {
      const response = await fetch('/api/logs/test-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'critical' })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.log('Expected API error:', errorData);
        alert(`API Error Test: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('API test error:', error);
    }
  };

  const triggerValidationError = async () => {
    try {
      const response = await fetch('/api/logs/test-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'validation' })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.log('Expected validation error:', errorData);
        alert(`Validation Error Test: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Validation test error:', error);
    }
  };

  const triggerNetworkError = async () => {
    try {
      // Simulate network timeout
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 100);
      
      await fetch('/api/nonexistent-endpoint', {
        signal: controller.signal
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        reportError(new Error('Network timeout - Connection aborted'), 'network-timeout-test');
        alert('Network timeout error logged');
      } else {
        reportError(error instanceof Error ? error : new Error('Unknown network error'), 'network-error-test');
        alert('Network error logged');
      }
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Bug className="w-8 h-8 text-red-600" />
        <h1 className="text-3xl font-bold">Error Handling Test Center</h1>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <p className="text-yellow-800 font-medium">Development Mode Only</p>
        </div>
        <p className="text-yellow-700 mt-1">
          This page is designed to test the error handling and monitoring system. 
          All errors are intentional and will be logged for demonstration purposes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Frontend Error Tests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug className="w-5 h-5" />
              Frontend Error Tests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-3">
                Test React error boundaries and component error handling
              </p>
              
              <Button 
                onClick={triggerComponentError}
                variant="destructive"
                className="w-full mb-3"
              >
                Trigger Component Error
              </Button>
              
              <Button 
                onClick={triggerAsyncError}
                disabled={loading}
                variant="outline"
                className="w-full mb-3"
              >
                {loading ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Testing Async Error...
                  </>
                ) : (
                  'Test Async Error Handling'
                )}
              </Button>
              
              <Button 
                onClick={triggerNetworkError}
                variant="outline"
                className="w-full"
              >
                <Network className="w-4 h-4 mr-2" />
                Test Network Error
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Backend Error Tests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Backend Error Tests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-3">
                Test API error handling and server-side error logging
              </p>
              
              <Button 
                onClick={triggerAPIError}
                variant="destructive"
                className="w-full mb-3"
              >
                Test Critical API Error
              </Button>
              
              <Button 
                onClick={triggerValidationError}
                variant="outline"
                className="w-full"
              >
                Test Validation Error
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Error Monitoring Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">What happens when you trigger an error:</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                <li>Frontend errors are caught by React Error Boundaries</li>
                <li>All errors are automatically logged to the monitoring system</li>
                <li>Critical errors trigger admin alerts</li>
                <li>Users see friendly error messages instead of technical details</li>
                <li>Error details are tracked with unique IDs for debugging</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Error Severity Levels:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="bg-green-50 border border-green-200 rounded p-2 text-center">
                  <div className="text-green-600 font-medium">Low</div>
                  <div className="text-xs text-green-500">Info, warnings</div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-center">
                  <div className="text-yellow-600 font-medium">Medium</div>
                  <div className="text-xs text-yellow-500">Validation errors</div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded p-2 text-center">
                  <div className="text-orange-600 font-medium">High</div>
                  <div className="text-xs text-orange-500">Network, timeouts</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded p-2 text-center">
                  <div className="text-red-600 font-medium">Critical</div>
                  <div className="text-xs text-red-500">System, payment, DB</div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-blue-800 text-sm">
                <strong>Admin Note:</strong> Visit <code>/admin/errors</code> to view the error monitoring dashboard 
                and see real-time error statistics and logs.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorTestPage;