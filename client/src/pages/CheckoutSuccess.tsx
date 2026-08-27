import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { authHeaders } from '@/lib/api';

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
    document.title = 'Order confirmed — PAWS';
  }, []);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    let cleared = false;

    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/checkout/status?session_id=${sessionId}`, {
          headers: { ...(await authHeaders()) },
        });
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" aria-hidden />
          <p className="mt-3 text-sm text-slate-600">Confirming your order…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 pb-24">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="border-slate-200 text-center shadow-sm">
          <CardContent className="pt-12 pb-8">
            <div className="mb-6">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Thank you — you are all set
              </h1>
              <p className="text-slate-600">
                Your payment was successful. We will send a confirmation to your email when processing completes.
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
                  <Link to="/marketplace?tab=store">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Back to store
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
