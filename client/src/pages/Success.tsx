import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Success = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you'd fetch order details using the session_id
    // For now, we'll show a generic success message
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Confirming your order...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
            <CardDescription className="text-lg">
              Thank you for your purchase from My Pup Store
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                <Package className="w-5 h-5" />
                <span>Order confirmation email sent</span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">What happens next?</h3>
              <div className="text-left space-y-2 text-sm text-muted-foreground">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">1</div>
                  <div>
                    <p className="font-medium text-foreground">Order Processing</p>
                    <p>We'll prepare your items for shipment within 1-2 business days.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">2</div>
                  <div>
                    <p className="font-medium text-foreground">Shipping</p>
                    <p>You'll receive a tracking number once your order ships.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">3</div>
                  <div>
                    <p className="font-medium text-foreground">Delivery</p>
                    <p>Your pup's new favorites will arrive in 3-5 business days.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button asChild variant="outline">
                  <Link to="/marketplace">
                    Continue Shopping
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild>
                  <Link to="/profile">
                    View Orders
                  </Link>
                </Button>
              </div>
            </div>

            {sessionId && (
              <div className="text-xs text-muted-foreground border-t pt-4">
                Order Reference: {sessionId.slice(-8).toUpperCase()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Success;