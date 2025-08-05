import { useState } from "react";
import { ShoppingCart, X, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCart } from "@/hooks/use-cart";

interface CartFabProps {
  className?: string;
}

export function CartFab({ className = "" }: CartFabProps) {
  const { cart, updateQuantity, removeFromCart, getTotalPrice, getItemCount } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  const totalItems = getItemCount();

  if (totalItems === 0) {
    return null;
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          size="lg"
          className={`fixed bottom-20 left-4 z-50 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-white ${className}`}
        >
          <div className="relative">
            <ShoppingCart className="h-6 w-6" />
            {totalItems > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold"
              >
                {totalItems}
              </Badge>
            )}
          </div>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Shopping Cart</SheetTitle>
          <SheetDescription>
            {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-4">
          {cart.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Your cart is empty
            </p>
          ) : (
            <>
              {cart.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <img
                    src={item.image_url || "/placeholder-product.jpg"}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      ${parseFloat(item.unit_price).toFixed(2)}
                      {item.is_subscription && " /month"}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <div className="border-t pt-4">
                <div className="flex justify-between items-center font-semibold text-lg">
                  <span>Total:</span>
                  <span>${getTotalPrice().toFixed(2)}</span>
                </div>
                <Button
                  className="w-full mt-4"
                  size="lg"
                  onClick={() => {
                    // TODO: Implement checkout
                    console.log("Proceeding to checkout...");
                  }}
                >
                  Proceed to Checkout
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}