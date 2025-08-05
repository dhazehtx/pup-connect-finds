import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Filter, Star, Check, ShoppingCart, CreditCard } from 'lucide-react';
import FilterDrawer from './FilterDrawer';
import FilterBar from '@/components/FilterBar';
import { useCart } from '@/hooks/use-cart';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  description: string | null;
  unit_price: string;
  image_url: string | null;
  is_subscription: boolean;
  is_active: boolean;
  inventory_qty: number;
  category?: string;
  rating?: number;
  reviews?: number;
}

type SortType = 'featured' | 'price-low-high' | 'price-high-low' | 'sale' | 'bestseller';

interface FilterState {
  categories: string[];
  minPrice: number;
  maxPrice: number;
}

const StoreTab = () => {
  const { addToCart, isInCart } = useCart();
  const { toast } = useToast();
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  const [sortType, setSortType] = useState<SortType>('featured');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    minPrice: 0,
    maxPrice: 100
  });

  // Fetch products from API with sort parameter
  const { data: productsResponse, isLoading, error } = useQuery({
    queryKey: ['/api/products', sortType],
    queryFn: async () => {
      const response = await fetch(`/api/products?sort=${sortType}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    },
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
    { value: 'price-low-high', label: 'Price: Low → High' },
    { value: 'price-high-low', label: 'Price: High → Low' },
    { value: 'sale', label: 'Sale' },
    { value: 'bestseller', label: 'Best-Selling' }
  ];

  // Apply filters function
  const applyFilters = (products: Product[], filterState: FilterState): Product[] => {
    return products.filter(product => {
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
    const sorted = [...products];
    
    switch (sortType) {
      case 'price-low-high':
        return sorted.sort((a, b) => parseFloat(a.unit_price) - parseFloat(b.unit_price));
      case 'price-high-low':
        return sorted.sort((a, b) => parseFloat(b.unit_price) - parseFloat(a.unit_price));
      case 'sale':
        return sorted.sort((a, b) => {
          // Prioritize discounted items first
          if (a.is_discounted && !b.is_discounted) return -1;
          if (!a.is_discounted && b.is_discounted) return 1;
          // Then sort by price ascending
          return parseFloat(a.unit_price) - parseFloat(b.unit_price);
        });
      case 'bestseller':
        return sorted.sort((a, b) => (b.total_sold || 0) - (a.total_sold || 0));
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
      image_url: product.image_url,
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
    <div className="bg-white min-h-screen pb-24">
      {/* Subtle blue accent divider */}
      <div className="h-2 w-full bg-primary-200 rounded-b-3xl"></div>
      
      <div className="p-4 space-y-6">
        {/* Filter and Sort Section */}
        <div className="pt-4">
          <FilterBar
            sortType={sortType}
            onSortChange={setSortType}
            onFilterOpen={() => setIsFilterOpen(true)}
            hasActiveFilters={hasActiveFilters}
          />
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-600">Loading products...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600">Failed to load products. Please try again.</p>
          </div>
        )}

        {/* Results count */}
        {!isLoading && !error && (
          <div className="text-sm text-gray-600">
            Showing {filteredAndSortedProducts.length} products
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredAndSortedProducts.map((product) => (
              <div key={product.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                {/* Product Image */}
                <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Filter className="w-8 h-8" />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900 line-clamp-2">{product.name}</h3>
                  {product.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                  )}
                  
                  {/* Price and Rating */}
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-primary-600">
                      ${parseFloat(product.unit_price).toFixed(2)}
                    </span>
                    {product.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600">{product.rating}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <Button
                      onClick={() => handleAddToCart(product)}
                      disabled={addedItems.has(product.id)}
                      variant="outline"
                      className="border-primary-600 text-primary-600 hover:bg-primary-50"
                    >
                      {addedItems.has(product.id) ? (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Added
                        </>
                      ) : isInCart(product.id) ? (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-1" />
                          In Cart
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-1" />
                          Add
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => checkoutMutation.mutate(product.id)}
                      disabled={checkoutMutation.isPending}
                      className="bg-primary-600 hover:bg-primary-700 text-white"
                    >
                      {checkoutMutation.isPending ? (
                        <>
                          <div className="w-4 h-4 mr-1 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          Processing
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-1" />
                          Buy Now
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No results */}
        {!isLoading && !error && filteredAndSortedProducts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">No products found matching your criteria.</p>
            <Button 
              onClick={() => setFilters({ categories: [], minPrice: 0, maxPrice: 100 })}
              className="mt-4"
            >
              Clear Filters
            </Button>
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

export default StoreTab;