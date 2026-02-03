import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Filter, Star, Check, ShoppingCart, CreditCard } from 'lucide-react';
import FilterDrawer from './FilterDrawer';
import FilterBar from '@/components/FilterBar';
import { useCart } from '@/hooks/use-cart';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import FeaturedProducts from '@/components/FeaturedProducts';
import ProductTags from '@/components/ProductTags';
import { Separator } from '@/components/ui/separator';
import StripeCheckoutDemo from '@/components/StripeCheckoutDemo';

interface Product {
  id: string;
  name: string;
  description?: string | null;
  unit_price: string;
  image_url?: string | null;
  is_subscription: boolean;
  is_active: boolean;
  is_featured?: boolean;
  tags?: string[] | null;
  inventory_qty: number;
  category?: string;
  rating?: number;
  reviews_count?: number;
  is_discounted?: boolean;
  original_price?: string;
  sales_count?: number;
}

type SortType = 'featured' | 'price-low-high' | 'price-high-low' | 'sale' | 'best-selling';

interface FilterState {
  categories: string[];
  minPrice: number;
  maxPrice: number;
}

// SOL:STORE:START
const StoreTab = () => {
  const { addToCart, isInCart } = useCart();
  const { toast } = useToast();
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  const [sortType, setSortType] = useState<SortType>('featured');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    minPrice: 0,
    maxPrice: 100
  });

  // Fetch products from API with enhanced error handling
  const { data: productsResponse, isLoading, error } = useQuery({
    queryKey: ['/api/products', { tag: selectedTag }],
    queryFn: async () => {
      try {
        const url = selectedTag ? `/api/products?tag=${encodeURIComponent(selectedTag)}` : '/api/products';
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store'
        });
        
        if (!response.ok) {
          console.error('Products fetch failed:', response.status, response.statusText);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Products loaded successfully:', data);
        return data;
      } catch (err) {
        console.error('Products API error:', err);
        throw err;
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const products = productsResponse?.data || [];

  // Create checkout session mutation
  const checkoutMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await apiRequest('/api/checkout', {
        method: 'POST',
        body: JSON.stringify({
          product_id: productId,
          quantity: 1
        })
      });
      return response.json();
    },
    onSuccess: (data) => {
      // Redirect to Stripe checkout
      window.location.href = data.url;
    },
    onError: (error) => {
      toast({
        title: "Checkout Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
    }
  });

  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'price-low-high', label: 'Price (Low→High)' },
    { value: 'price-high-low', label: 'Price (High→Low)' },
    { value: 'sale', label: 'Sale' },
    { value: 'best-selling', label: 'Best-Selling' }
  ];

  // Apply filters function
  const applyFilters = (products: Product[], filterState: FilterState): Product[] => {
    return products.filter(product => {
      // Add null safety checks
      if (!product || !product.name || !product.unit_price) {
        return false;
      }

      // Category filter - derive category from product name or description
      const category = product.category || (
        product.name.toLowerCase().includes('toy') ? 'Toys' :
        product.name.toLowerCase().includes('bed') || product.name.toLowerCase().includes('bowl') ? 'Accessories' :
        product.name.toLowerCase().includes('food') || product.name.toLowerCase().includes('treat') ? 'Food & Treats' :
        'Other'
      );
      
      const matchesCategory = filterState.categories.length === 0 || 
        filterState.categories.includes(category);
      
      // Price filter
      const price = parseFloat(product.unit_price);
      const matchesPrice = price >= filterState.minPrice && 
        price <= filterState.maxPrice;
      
      return matchesCategory && matchesPrice && product.is_active;
    });
  };

  // Apply sort function
  const applySort = (products: Product[], sortType: SortType): Product[] => {
    const sorted = [...products].filter(product => product && product.name); // Add null safety
    
    switch (sortType) {
      case 'price-low-high':
        return sorted.sort((a, b) => parseFloat(a.unit_price) - parseFloat(b.unit_price));
      case 'price-high-low':
        return sorted.sort((a, b) => parseFloat(b.unit_price) - parseFloat(a.unit_price));
      case 'sale':
        // Show discounted items first, then sort by discount amount
        return sorted.sort((a, b) => {
          if (a.is_discounted && !b.is_discounted) return -1;
          if (!a.is_discounted && b.is_discounted) return 1;
          if (a.is_discounted && b.is_discounted && a.original_price && b.original_price) {
            const aDiscount = parseFloat(a.original_price) - parseFloat(a.unit_price);
            const bDiscount = parseFloat(b.original_price) - parseFloat(b.unit_price);
            return bDiscount - aDiscount; // Bigger discounts first
          }
          return a.name.localeCompare(b.name);
        });
      case 'best-selling':
        return sorted.sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0));
      case 'featured':
      default:
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
  };

  // Filtered and sorted products
  const filteredAndSortedProducts = useMemo(() => {
    const filtered = applyFilters(products, filters);
    return applySort(filtered, sortType);
  }, [products, filters, sortType]);

  const handleFilterApply = (newFilters: FilterState) => {
    setFilters(newFilters);
    setIsFilterOpen(false);
  };

  const handleFilterClear = () => {
    setFilters({
      categories: [],
      minPrice: 0,
      maxPrice: 100
    });
    setIsFilterOpen(false);
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      unit_price: product.unit_price,
      image_url: product.image_url || null,
      is_subscription: product.is_subscription
    });
    
    // Show "Added" state for 1.5 seconds
    setAddedItems(prev => new Set(prev).add(product.id));
    setTimeout(() => {
      setAddedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
    }, 1500);
  };

  const hasActiveFilters = filters.categories.length > 0 || filters.minPrice > 0 || filters.maxPrice < 100;

  return (
    <div className="store-tab bg-white min-h-screen pb-24">
      {/* Subtle blue accent divider */}
      <div className="h-2 w-full bg-blue-100 rounded-b-3xl"></div>
      
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Stripe Checkout Demo - Hidden in production, only show in dev mode */}
        {process.env.NODE_ENV === 'development' && false && (
          <div className="flex justify-center">
            <StripeCheckoutDemo />
          </div>
        )}

        {/* Filter and Sort Section */}
        <div className="pt-0">
          <FilterBar
            sortType={sortType}
            onSortChange={setSortType}
            onFilterOpen={() => setIsFilterOpen(true)}
            hasActiveFilters={hasActiveFilters}
            productCount={filteredAndSortedProducts.length}
          />
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading products...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="text-red-800 font-medium">Unable to load products</div>
            <div className="text-red-600 text-sm mt-1">
              {error.message || 'Please try again in a moment.'}
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && filteredAndSortedProducts.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
            <div className="text-gray-900 font-medium">No products available</div>
            <div className="mt-1 text-gray-500 text-sm">
              Products will appear here once they're added to the store.
            </div>
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && !error && filteredAndSortedProducts.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredAndSortedProducts.map((product) => (
              <div key={product.id} className="product-card">
                {/* Product Image */}
                <div className="product-card__image">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingCart className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="product-card__body">
                  <h3 className="product-card__title">{product.name}</h3>
                  
                  {product.description && (
                    <p className="product-card__description">{product.description}</p>
                  )}

                  {/* Price */}
                  <div className="product-card__price">
                    ${parseFloat(product.unit_price).toFixed(2)}
                  </div>

                  {/* Action Buttons */}
                  <div className="product-card__actions">
                    <button
                      type="button"
                      onClick={() => handleAddToCart(product)}
                      disabled={addedItems.has(product.id)}
                      className="btn-pill btn-pill--outline"
                      data-testid={`button-add-cart-${product.id}`}
                    >
                      {addedItems.has(product.id) ? 'Added' : isInCart(product.id) ? 'In Cart' : 'Add'}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => checkoutMutation.mutate(product.id)}
                      disabled={checkoutMutation.isPending}
                      className="btn-pill btn-pill--outline"
                      style={{ color: '#111827' }}
                      data-testid={`button-buy-now-${product.id}`}
                    >
                      {checkoutMutation.isPending ? 'Processing...' : 'Buy Now'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No results */}
        {!isLoading && !error && filteredAndSortedProducts.length === 0 && hasActiveFilters && (
          <div className="text-center py-8">
            <p className="text-gray-600">No products found matching your criteria.</p>
            <Button 
              onClick={() => {
                setFilters({ categories: [], minPrice: 0, maxPrice: 100 });
                setSelectedTag(null);
              }}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Tag Filter Section */}
        {!isLoading && !error && (
          <div className="mt-8">
            <ProductTags 
              selectedTag={selectedTag || undefined}
              onTagSelect={setSelectedTag}
            />
          </div>
        )}
      </div>

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onApply={handleFilterApply}
        onClear={handleFilterClear}
      />
    </div>
  );
};
// SOL:STORE:END

export default StoreTab;
