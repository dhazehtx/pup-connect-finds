import React, { useState } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useDrag, useWheel } from '@use-gesture/react';
import { Star, Check, ShoppingCart, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Product {
  id: string;
  name: string;
  description: string | null;
  unit_price: string;
  image_url: string | null;
  is_subscription: boolean;
  inventory_qty: number;
  rating?: number;
}

interface GestureProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onFavorite: (product: Product) => void;
  isInCart: boolean;
  isAdded: boolean;
}

const GestureProductCard: React.FC<GestureProductCardProps> = ({
  product,
  onAddToCart,
  onQuickView,
  onFavorite,
  isInCart,
  isAdded
}) => {
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [isPressed, setIsPressed] = useState(false);

  // Spring for card animation
  const [{ x, scale, rotateZ, opacity }, api] = useSpring(() => ({
    x: 0,
    scale: 1,
    rotateZ: 0,
    opacity: 1,
    config: { tension: 300, friction: 30 }
  }));

  // Spring for action indicators
  const [{ leftAction, rightAction }, actionApi] = useSpring(() => ({
    leftAction: 0,
    rightAction: 0,
    config: { tension: 200, friction: 20 }
  }));

  // Drag gesture handler
  const bindDrag = useDrag(({ active, movement: [mx], direction: [xDir], velocity: [vx] }) => {
    const trigger = Math.abs(mx) > 100;
    const dir = xDir < 0 ? 'left' : 'right';
    
    if (active) {
      // While dragging
      api.start({
        x: mx,
        scale: 1.05,
        rotateZ: mx / 10,
        immediate: true
      });

      // Show action indicators based on swipe direction
      if (mx < -50) {
        actionApi.start({ leftAction: 1, rightAction: 0 });
        setSwipeDirection('left');
      } else if (mx > 50) {
        actionApi.start({ leftAction: 0, rightAction: 1 });
        setSwipeDirection('right');
      } else {
        actionApi.start({ leftAction: 0, rightAction: 0 });
        setSwipeDirection(null);
      }
    } else {
      // On release
      if (trigger && Math.abs(vx) > 0.2) {
        // Execute action based on swipe direction
        if (dir === 'left') {
          onFavorite(product);
          // Animate card out and back
          api.start({ x: -300, opacity: 0 });
          setTimeout(() => {
            api.start({ x: 0, opacity: 1, scale: 1, rotateZ: 0 });
          }, 300);
        } else {
          onAddToCart(product);
          // Animate card bounce
          api.start({ x: 300, scale: 1.1 });
          setTimeout(() => {
            api.start({ x: 0, scale: 1, rotateZ: 0 });
          }, 300);
        }
      } else {
        // Reset position
        api.start({ x: 0, scale: 1, rotateZ: 0 });
      }
      
      // Reset action indicators
      actionApi.start({ leftAction: 0, rightAction: 0 });
      setSwipeDirection(null);
    }
  });

  // Long press for quick view
  const handlePress = () => {
    setIsPressed(true);
    setTimeout(() => {
      if (isPressed) {
        onQuickView(product);
      }
      setIsPressed(false);
    }, 800);
  };

  const price = parseFloat(product.unit_price);
  const inStock = product.inventory_qty > 0;

  return (
    <div className="relative">
      {/* Action Indicators */}
      <animated.div
        style={{
          opacity: leftAction,
          transform: leftAction.to(v => `scale(${0.8 + v * 0.4})`)
        }}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-red-500 text-white p-3 rounded-full shadow-lg"
      >
        <Heart className="w-5 h-5" />
      </animated.div>

      <animated.div
        style={{
          opacity: rightAction,
          transform: rightAction.to(v => `scale(${0.8 + v * 0.4})`)
        }}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-green-500 text-white p-3 rounded-full shadow-lg"
      >
        <ShoppingCart className="w-5 h-5" />
      </animated.div>

      {/* Product Card */}
      <animated.div
        {...bindDrag()}
        style={{
          x,
          scale,
          rotateZ,
          opacity
        }}
        onMouseDown={handlePress}
        onTouchStart={handlePress}
        onMouseUp={() => setIsPressed(false)}
        onTouchEnd={() => setIsPressed(false)}
        className={`
          touch-none select-none cursor-pointer
          bg-white rounded-3xl border border-gray-200 shadow-sm p-4
          transition-shadow duration-200
          ${isPressed ? 'shadow-lg' : 'hover:shadow-md'}
          ${swipeDirection === 'left' ? 'border-red-300' : ''}
          ${swipeDirection === 'right' ? 'border-green-300' : ''}
        `}
      >
        <div className="relative mb-3">
          <img
            src={product.image_url || "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400"}
            alt={product.name}
            className="w-full h-32 object-cover rounded-xl"
          />
          
          {product.is_subscription && (
            <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
              Subscription
            </div>
          )}

          {/* Quick action hint overlay */}
          {swipeDirection && (
            <div className="absolute inset-0 bg-black bg-opacity-20 rounded-xl flex items-center justify-center">
              <div className="text-white text-sm font-medium">
                {swipeDirection === 'left' ? '← Swipe to Favorite' : 'Swipe to Add →'}
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="font-semibold text-primary-600 text-base line-clamp-2">
            {product.name}
          </h3>
          
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`h-3 w-3 ${i < Math.floor(product.rating || 4.5) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
              />
            ))}
            <span className="text-xs text-gray-600 ml-1">{product.rating || '4.5'}</span>
          </div>

          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-bold text-primary-600">
              ${price.toFixed(2)}
              {product.is_subscription && <span className="text-sm font-normal">/month</span>}
            </span>
          </div>
          
          <Button 
            disabled={!inStock || isAdded || isInCart}
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="w-full py-2 btn-primary text-sm"
            variant={isInCart ? "secondary" : "default"}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Added
              </>
            ) : isInCart ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                In Cart
              </>
            ) : !inStock ? (
              'Out of Stock'
            ) : (
              'Add to Cart'
            )}
          </Button>
        </div>

        {/* Swipe instruction hint */}
        <div className="text-xs text-gray-400 text-center mt-2">
          Swipe ← to favorite • Swipe → to add cart
        </div>
      </animated.div>
    </div>
  );
};

export default GestureProductCard;