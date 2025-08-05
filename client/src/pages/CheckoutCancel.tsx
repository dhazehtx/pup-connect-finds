import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { XCircle, ArrowLeft, ShoppingBag } from 'lucide-react';

const CheckoutCancel = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="text-center">
          <CardContent className="pt-12 pb-8">
            <div className="mb-6">
              <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Payment Cancelled
              </h1>
              <p className="text-gray-600">
                Your payment was cancelled. No charges were made to your account.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">
                Don't worry - you can try again anytime. Your cart items are still saved.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="bg-primary-600 hover:bg-primary-700">
                <Link to="/marketplace">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/cart">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Cart
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CheckoutCancel;