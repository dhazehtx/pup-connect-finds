import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { XCircle, ArrowLeft, ShoppingBag } from 'lucide-react';

const CheckoutCancel = () => {
  useEffect(() => {
    document.title = 'Checkout cancelled — PAWS';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 pb-24">
      <div className="mx-auto max-w-2xl px-4">
        <Card className="border-slate-200 text-center shadow-sm">
          <CardContent className="pt-12 pb-8">
            <div className="mb-6">
              <XCircle className="mx-auto mb-4 h-20 w-20 text-amber-500" aria-hidden />
              <h1 className="mb-2 text-3xl font-bold text-slate-900">Checkout cancelled</h1>
              <p className="text-slate-600">
                No payment was taken. Your cart is unchanged — you can return anytime.
              </p>
            </div>

            <div className="mb-6 rounded-lg border border-slate-100 bg-slate-50 p-4">
              <p className="text-sm text-slate-600">
                If you closed the Stripe window by mistake, open your cart and try checkout again.
              </p>
            </div>

            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild className="bg-primary-600 hover:bg-primary-700">
                <Link to="/marketplace?tab=store">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Back to store
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/cart">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  View cart
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