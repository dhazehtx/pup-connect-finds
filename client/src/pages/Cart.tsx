import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { Minus, Plus, Trash2, ShoppingBag, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const Cart = () => {
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
        headers: { 'Content-Type': 'application/json' },
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
      <div className="min-h-screen bg-gray-50 pt-20 px-4">
        <div className="max-w-2xl mx-auto text-center py-16">
          <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Add some products from our store to get started.</p>
          <Link to="/marketplace">
            <Button className="btn-primary">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 px-4 pb-24">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
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
              <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl">
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
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

        <div className="bg-white rounded-3xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
          
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-gray-600">
              <span>Items ({items.reduce((sum, item) => sum + item.quantity, 0)})</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <hr className="my-4" />
            <div className="flex justify-between text-xl font-bold text-gray-900">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <Button
            onClick={handleCheckout}
            disabled={isCheckingOut}
            className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white"
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
          
          <Link to="/marketplace" className="block mt-4">
            <Button variant="outline" className="w-full">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
