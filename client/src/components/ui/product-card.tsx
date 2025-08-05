import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Star, Check } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

interface Product {
  id: string;
  name: string;
  description: string | null;
  unit_price: string;
  image_url: string | null;
  is_subscription: boolean;
  is_active: boolean;
  inventory_qty: number;
}

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { addToCart, isInCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      addToCart({
        id: product.id,
        name: product.name,
        unit_price: product.unit_price,
        image_url: product.image_url,
        is_subscription: product.is_subscription,
      });
      
      // Brief feedback delay
      await new Promise(resolve => setTimeout(resolve, 500));
    } finally {
      setIsAdding(false);
    }
  };

  const price = parseFloat(product.unit_price);
  const inStock = product.inventory_qty > 0;
  const alreadyInCart = isInCart(product.id);

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="p-4">
        <div className="aspect-square relative mb-4 overflow-hidden rounded-lg bg-gray-50">
          <img
            src={product.image_url || "/placeholder-product.jpg"}
            alt={product.name}
            className="object-cover w-full h-full hover:scale-105 transition-transform duration-200 cursor-pointer"
            onClick={() => onQuickView?.(product)}
          />
          {product.is_subscription && (
            <Badge className="absolute top-2 right-2 bg-orange-500 hover:bg-orange-600">
              Subscription
            </Badge>
          )}
          {!inStock && (
            <Badge variant="secondary" className="absolute top-2 left-2">
              Out of Stock
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {product.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 p-4 pt-0">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-primary">
              ${price.toFixed(2)}
              {product.is_subscription && (
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  /month
                </span>
              )}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
              <span>4.8 (42 reviews)</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          onClick={handleAddToCart}
          disabled={!inStock || isAdding || alreadyInCart}
          variant={alreadyInCart ? "secondary" : "default"}
        >
          {isAdding ? (
            "Adding..."
          ) : alreadyInCart ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              In Cart
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              {inStock ? "Add to Cart" : "Out of Stock"}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}