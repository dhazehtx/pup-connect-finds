import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string | null;
  unit_price: string;
  image_url: string | null;
  is_featured: boolean;
  is_active?: boolean;
  tags: string[] | null;
  rating: string | null;
  reviews_count: number;
  category: string | null;
}

interface FeaturedProductsProps {
  onProductSelect?: (productId: string) => void;
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ onProductSelect }) => {
  const { data: featuredProducts = [], isLoading } = useQuery({
    queryKey: ['/api/products', { featured: true }],
    queryFn: async () => {
      const response = await fetch('/api/products?featured=true');
      if (!response.ok) {
        throw new Error('Failed to fetch featured products');
      }
      const data = await response.json();
      return data.data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="featured-products-strip space-y-4">
        <h2 className="text-2xl font-bold">Featured Products</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card
              key={i}
              className={cn('featured-store-card overflow-hidden rounded-2xl border-0 bg-white', 'animate-pulse')}
            >
              <div className="h-52 bg-gradient-to-b from-slate-100 to-slate-200/80" />
              <CardContent className="space-y-3 p-5 pt-4">
                <div className="h-4 rounded-md bg-slate-200" />
                <div className="h-3 w-4/5 rounded-md bg-slate-200" />
                <div className="h-9 rounded-lg bg-slate-200" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const visibleFeatured = featuredProducts.filter((p: Product) => p.is_active !== false);

  if (visibleFeatured.length === 0) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Featured Products</h2>
        <p className="text-gray-500">No featured products available at the moment.</p>
      </div>
    );
  }

  const renderStars = (rating: string | null) => {
    if (!rating) return null;
    const stars = parseFloat(rating);
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= stars ? 'text-blue-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating})</span>
      </div>
    );
  };

  return (
    <div className="featured-products-strip space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
        <Badge variant="secondary" className="border-0 bg-blue-100/90 text-blue-800 shadow-none">
          Featured
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visibleFeatured.map((product: Product) => (
          <Card
            key={product.id}
            className={cn(
              'featured-store-card group overflow-hidden rounded-2xl border-0 bg-white',
              'transition-all duration-200 ease-out hover:-translate-y-0.5',
            )}
          >
            <div className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100/85">
              {product.image_url ? (
                <FeaturedCardImage src={product.image_url} alt={product.name} />
              ) : (
                <div className="flex h-52 w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100/90">
                  <ShoppingCart className="h-12 w-12 text-blue-400/90" aria-hidden />
                </div>
              )}
              <Badge className="absolute right-3 top-3 border-0 bg-blue-600/95 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white shadow-sm backdrop-blur-[2px]">
                Featured
              </Badge>
            </div>

            <CardContent className="space-y-3 bg-white p-5 pt-5">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                  {product.name}
                </h3>
                {product.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {product.description}
                  </p>
                )}
              </div>

              {product.rating && renderStars(product.rating)}

              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {product.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {product.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{product.tags.length - 3} more
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="text-2xl font-bold text-green-600">
                  ${parseFloat(product.unit_price).toFixed(2)}
                </div>
                <Button
                  size="sm"
                  onClick={() => onProductSelect?.(product.id)}
                  className="rounded-lg bg-[#0074d4] font-semibold text-white shadow-sm hover:bg-[#0068c0]"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Buy Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

function FeaturedCardImage({ src, alt }: { src: string; alt: string }) {
  const [broken, setBroken] = useState(false);
  if (broken) {
    return (
      <div className="flex h-52 w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100/90">
        <ShoppingCart className="h-12 w-12 text-blue-400/90" aria-hidden />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className="box-border h-52 w-full object-contain object-center px-4 pb-3 pt-4"
      onError={() => setBroken(true)}
    />
  );
}

export default FeaturedProducts;