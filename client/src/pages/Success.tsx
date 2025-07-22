
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

const Success = () => {
  const navigate = useNavigate();
  const { refreshSubscription } = useSubscription();

  useEffect(() => {
    // Refresh subscription status after successful checkout
    const timer = setTimeout(() => {
      refreshSubscription();
    }, 2000);

    return () => clearTimeout(timer);
  }, [refreshSubscription]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-800">
            Payment Successful!
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Thank you for subscribing to MY PUP! Your subscription is now active.
          </p>
          
          <div className="space-y-2">
            <Button 
              onClick={() => navigate('/monetization')}
              className="w-full"
            >
              View Subscription Details
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Success;
