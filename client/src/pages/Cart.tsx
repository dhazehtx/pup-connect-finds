import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { Minus, Plus, Trash2, ShoppingBag, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { authHeaders } from '@/lib/api';

const Cart = () => {
  useEffect(() => {
    document.title = 'Cart — PAWS';
  }, []);

  const { cart, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const items = cart;
  const totalPrice = getTotalPrice();

  const handleCheckout = async () => {
    if (items.length === 0) return;

    if (!user) {
      toast({
        title: 'Please sign in to checkout',
        description: 'You need an account to complete your purchase.',
        variant: 'destructive',
      });
      navigate('/greeting');
      return;
    }

    setIsCheckingOut(true);

    try {
      const cartItems = items.map(item => ({
        id: item.id,
        quantity: item.quantity,
      }));

      const response = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
        credentials: 'include',
        body: JSON.stringify({ cartItems }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        console.error('Cart checkout API error:', data);
        throw new Error(data.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error: any) {
      console.error('Cart checkout error:', error);
      toast({
        title: 'Checkout failed',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
      setIsCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 pb-24 pt-20">
        <div className="mx-auto max-w-2xl py-16 text-center">
          <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-slate-300" />
          <h2 className="mb-2 text-2xl font-bold text-slate-900">Your cart is empty</h2>
          <p className="mb-8 text-slate-600">
            Add products from the PAWS store or Pup Box—then check out when you are ready.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link to="/marketplace?tab=store">
              <Button className="btn-primary min-h-[44px] px-8">Continue to PAWS Store</Button>
            </Link>
            <Button variant="ghost" asChild>
              <Link to="/marketplace?tab=box">Browse Pup Box</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 pb-24 pt-20">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">Shopping cart</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={clearCart}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 rounded-xl border border-slate-200 p-4">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                    <ShoppingBag className="h-7 w-7 text-slate-300" aria-hidden />
                  </div>
                )}
                
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-lg font-bold text-primary-600">${parseFloat(item.unit_price).toFixed(2)}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 p-0"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  
                  <span className="w-8 text-center font-semibold">{item.quantity}</span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-slate-900">Order summary</h2>
          
          <div className="mb-6 space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>Items ({items.reduce((sum, item) => sum + item.quantity, 0)})</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping</span>
              <span className="text-slate-800">Calculated at checkout</span>
            </div>
            <hr className="my-4 border-slate-200" />
            <div className="flex justify-between text-xl font-bold text-slate-900">
              <span>Subtotal</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <Button
            onClick={handleCheckout}
            disabled={isCheckingOut}
            className="min-h-[48px] w-full bg-primary-600 py-3 text-white hover:bg-primary-700"
          >
            {isCheckingOut ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Redirecting to Checkout...
              </>
            ) : (
              'Proceed to Checkout'
            )}
          </Button>
          
          <Link to="/marketplace?tab=store" className="mt-4 block">
            <Button variant="outline" className="w-full border-slate-200">
              Continue shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
