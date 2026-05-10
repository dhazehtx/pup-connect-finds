import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const SubscriptionCancelled = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/marketplace?tab=box');
  };

  const handleTryAgain = () => {
    navigate('/marketplace?tab=box');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-800">
            Payment Cancelled
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-gray-600">
            <p className="mb-2">Your subscription was not completed.</p>
            <p className="text-sm">No charges have been made to your account.</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-800">
              You can try subscribing again at any time to unlock premium features.
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleTryAgain}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Try Again
            </Button>
            <Button 
              onClick={handleGoBack}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Marketplace
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionCancelled;