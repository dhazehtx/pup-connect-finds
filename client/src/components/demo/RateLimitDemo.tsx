import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, Clock, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRateLimitHandler } from '@/hooks/useRateLimitHandler';
import RateLimitErrorModal from '@/components/ui/RateLimitErrorModal';

const RateLimitDemo = () => {
  const [testResults, setTestResults] = useState<Array<{ 
    endpoint: string; 
    status: number; 
    message: string; 
    timestamp: Date;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { 
    rateLimitError, 
    isErrorModalOpen, 
    handleRateLimitError, 
    closeErrorModal, 
    withRateLimitHandling 
  } = useRateLimitHandler();

  const testEndpoint = async (endpoint: string, description: string) => {
    setIsLoading(true);
    
    const result = await withRateLimitHandling(async () => {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ test: true })
      });
      
      const data = await response.json();
      
      setTestResults(prev => [...prev, {
        endpoint: description,
        status: response.status,
        message: data.message || data.error || 'Success',
        timestamp: new Date()
      }]);
      
      return data;
    });
    
    if (result) {
      toast({
        title: "Request Successful",
        description: `${description} completed successfully`,
        variant: "default"
      });
    }
    
    setIsLoading(false);
  };

  const rapidFireTest = async () => {
    setIsLoading(true);
    
    for (let i = 0; i < 15; i++) {
      await testEndpoint('/api/listings', `Rapid Fire Test ${i + 1}`);
      // Small delay to see the progression
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setIsLoading(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getStatusColor = (status: number) => {
    if (status === 200) return 'default';
    if (status === 429) return 'destructive';
    return 'secondary';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Rate Limiting Demo</h2>
        <p className="text-gray-600">Test the API rate limiting and abuse protection system</p>
      </div>

      {/* Test Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold">General Rate Limit</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">60 requests per minute</p>
            <Button 
              onClick={() => testEndpoint('/api/listings', 'General Rate Test')}
              disabled={isLoading}
              className="w-full"
            >
              Test General Limit
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold">Messaging Limit</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">30 messages per minute</p>
            <Button 
              onClick={() => testEndpoint('/api/messages', 'Messaging Rate Test')}
              disabled={isLoading}
              variant="secondary"
              className="w-full"
            >
              Test Message Limit
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold">Listing Creation</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">10 listings per hour</p>
            <Button 
              onClick={() => testEndpoint('/api/listings', 'Listing Rate Test')}
              disabled={isLoading}
              variant="destructive"
              className="w-full"
            >
              Test Listing Limit
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-purple-500" />
              <h3 className="font-semibold">Rapid Fire</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">15 quick requests</p>
            <Button 
              onClick={rapidFireTest}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              Rapid Fire Test
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Results Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Test Results</CardTitle>
            <div className="flex gap-2">
              <Button onClick={clearResults} variant="outline" size="sm">
                Clear Results
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {testResults.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No test results yet. Run a test to see the results.</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant={getStatusColor(result.status)}>
                      {result.status}
                    </Badge>
                    <div>
                      <p className="font-medium">{result.endpoint}</p>
                      <p className="text-sm text-gray-600">{result.message}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {result.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rate Limit Error Modal */}
      <RateLimitErrorModal
        isOpen={isErrorModalOpen}
        onClose={closeErrorModal}
        error={rateLimitError || { message: '' }}
      />
    </div>
  );
};

export default RateLimitDemo;