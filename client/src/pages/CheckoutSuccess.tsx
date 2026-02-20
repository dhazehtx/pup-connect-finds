import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';

interface OrderStatus {
  order_id: string;
  status: string;
  amount_total: string;
  currency: string;
  created_at: string;
}

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [orderDetails, setOrderDetails] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { clearCart } = useCart();

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    let cleared = false;

    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/checkout/status?session_id=${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          setOrderDetails(data);
          if (data.status === 'paid' && !cleared) {
            cleared = true;
            clearCart();
          }
        }
      } catch (err) {
        console.error('Failed to fetch order status:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();

    if (!cleared) {
      clearCart();
      cleared = true;
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="text-center">
          <CardContent className="pt-12 pb-8">
            <div className="mb-6">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Payment Successful!
              </h1>
              <p className="text-gray-600">
                Thank you for your purchase. Your order has been confirmed.
              </p>
            </div>

            {orderDetails && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">
                  Order ID: <span className="font-mono font-semibold">{orderDetails.order_id.slice(-8)}</span>
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  Status: <span className="font-semibold capitalize text-green-600">{orderDetails.status}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Total: <span className="font-semibold">${parseFloat(orderDetails.amount_total).toFixed(2)}</span>
                </p>
              </div>
            )}

            {!orderDetails && sessionId && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600">
                  Order ID: <span className="font-mono">{sessionId.slice(-8)}</span>
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                <p>Your order will be processed within 1-2 business days</p>
                <p>Track your order in your account dashboard</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-6">
                <Button asChild className="bg-primary-600 hover:bg-primary-700">
                  <Link to="/marketplace">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Continue Shopping
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/orders">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    View Orders
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
