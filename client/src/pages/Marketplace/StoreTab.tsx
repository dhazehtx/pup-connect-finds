import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Filter, Star, ChevronDown, Check } from 'lucide-react';
import FilterDrawer from './FilterDrawer';
import { useCart } from '@/hooks/use-cart';
import { useQuery } from '@tanstack/react-query';
import GestureProductCard from '@/components/gestures/GestureProductCard';
import GestureFilterBar from '@/components/gestures/GestureFilterBar';

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

type SortType = 'featured' | 'price-low-high' | 'price-high-low' | 'rating';

interface FilterState {
  categories: string[];
  minPrice: number;
  maxPrice: number;
}

const StoreTab = () => {
  const { addToCart, isInCart } = useCart();
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());

  // Fetch products from API
  const { data: productsResponse, isLoading, error } = useQuery({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    },
  });

  const products = productsResponse?.data || [];

  const [sortType, setSortType] = useState<SortType>('featured');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    minPrice: 0,
    maxPrice: 100
  });

  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'price-low-high', label: 'Price (Low→High)' },
    { value: 'price-high-low', label: 'Price (High→Low)' },
    { value: 'rating', label: 'Rating' }
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
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5));
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

  const handleSortChange = () => {
    const currentIndex = sortOptions.findIndex(option => option.value === sortType);
    const nextIndex = (currentIndex + 1) % sortOptions.length;
    setSortType(sortOptions[nextIndex].value as SortType);
  };

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

  const currentSortLabel = sortOptions.find(option => option.value === sortType)?.label || 'Featured';

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

  const handleFavorite = (product: Product) => {
    setFavorites(prev => {
      const newSet = new Set(prev);
      if (newSet.has(product.id)) {
        newSet.delete(product.id);
      } else {
        newSet.add(product.id);
      }
      return newSet;
    });
  };

  const handleQuickView = (product: Product) => {
    // For now, just add to cart as quick action
    handleAddToCart(product);
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    setFilters(prev => ({
      ...prev,
      minPrice: min,
      maxPrice: max
    }));
  };

  const hasActiveFilters = filters.categories.length > 0 || filters.minPrice > 0 || filters.maxPrice < 100;

  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Subtle blue accent divider */}
      <div className="h-2 w-full bg-primary-200 rounded-b-3xl"></div>
      
      <div className="p-4 space-y-6">
        {/* Gesture-based Filter and Sort Section */}
        <div className="pt-4">
          <GestureFilterBar
            sortType={sortType}
            onSortChange={setSortType}
            onFilterOpen={() => setIsFilterOpen(true)}
            hasActiveFilters={hasActiveFilters}
            onPriceRangeChange={handlePriceRangeChange}
            priceRange={{ min: filters.minPrice, max: filters.maxPrice }}
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

        {/* Gesture-based Products Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredAndSortedProducts.map((product) => (
              <GestureProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onQuickView={handleQuickView}
                onFavorite={handleFavorite}
                isInCart={isInCart(product.id)}
                isAdded={addedItems.has(product.id)}
              />
            ))}
          </div>
        )}

        {filteredAndSortedProducts.length === 0 && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-12 text-center mx-4">
            <div className="text-gray-500">
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p>Try adjusting your filter criteria</p>
            </div>
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
        products={products}
      />
    </div>
  );
};

export default StoreTab;