import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Filter, Star, ChevronDown, Check } from 'lucide-react';
import FilterDrawer from './FilterDrawer';
import { useCart } from '@/lib/CartContext';
import SortChips from '@/components/ui/SortPopover';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  rating?: number;
  reviews?: number;
  image: string;
  description: string;
  inStock: boolean;
}

type SortType = 'Featured' | 'Price ↑' | 'Price ↓' | 'Rating' | 'Newest' | 'Oldest';

interface FilterState {
  categories: string[];
  minPrice: number;
  maxPrice: number;
}

const StoreTab = () => {
  const { addItem } = useCart();
  const [addedItems, setAddedItems] = useState<Set<number>>(new Set());

  // Product seed data
  const [products] = useState<Product[]>([
    {
      id: 1,
      name: "Bone Toy",
      category: "Toys",
      price: 10,
      rating: 4.5,
      image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400",
      description: "Classic bone-shaped toy for dogs",
      inStock: true
    },
    {
      id: 2,
      name: "Dog Bed",
      category: "Accessories",
      price: 49,
      rating: 4.2,
      image: "https://images.unsplash.com/photo-1581888227599-779811939961?w=400",
      description: "Comfortable orthopedic bed",
      inStock: true
    },
    {
      id: 3,
      name: "Rope Toy",
      category: "Toys",
      price: 12,
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400",
      description: "Interactive rope toy for play",
      inStock: true
    },
    {
      id: 4,
      name: "Dog Bowl",
      category: "Accessories",
      price: 8,
      rating: 4.1,
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
      description: "Durable food and water bowl",
      inStock: true
    },
    {
      id: 5,
      name: "Dog Mat",
      category: "Accessories",
      price: 27,
      rating: 4.0,
      image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400",
      description: "Non-slip feeding mat",
      inStock: true
    },
    {
      id: 6,
      name: "Ball Toy",
      category: "Toys",
      price: 6,
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400",
      description: "Bouncy rubber ball toy",
      inStock: true
    },
    {
      id: 7,
      name: "Pet Bowl",
      category: "Accessories",
      price: 15,
      rating: 4.3,
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
      description: "Stainless steel pet bowl",
      inStock: true
    },
    {
      id: 8,
      name: "Premium Dog Food",
      category: "Food & Treats",
      price: 35,
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400",
      description: "High-quality dry dog food",
      inStock: true
    }
  ]);

  const [sortType, setSortType] = useState<SortType>('Featured');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    minPrice: 0,
    maxPrice: 100
  });

  // Remove old sortOptions array since we're using SortChips now

  // Apply filters function
  const applyFilters = (products: Product[], filterState: FilterState): Product[] => {
    return products.filter(product => {
      // Category filter
      const matchesCategory = filterState.categories.length === 0 || 
        filterState.categories.includes(product.category);
      
      // Price filter
      const matchesPrice = product.price >= filterState.minPrice && 
        product.price <= filterState.maxPrice;
      
      return matchesCategory && matchesPrice;
    });
  };

  // Apply sort function
  const applySort = (products: Product[], sortType: SortType): Product[] => {
    const sorted = [...products];
    
    switch (sortType) {
      case 'Price ↑':
        return sorted.sort((a, b) => a.price - b.price);
      case 'Price ↓':
        return sorted.sort((a, b) => b.price - a.price);
      case 'Rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'Newest':
        return sorted.sort((a, b) => b.id - a.id);
      case 'Oldest':
        return sorted.sort((a, b) => a.id - b.id);
      case 'Featured':
      default:
        return sorted.sort((a, b) => a.id - b.id);
    }
  };

  // Filtered and sorted products
  const filteredAndSortedProducts = useMemo(() => {
    const filtered = applyFilters(products, filters);
    return applySort(filtered, sortType);
  }, [products, filters, sortType]);

  const handleSortChange = (sort: SortType) => {
    setSortType(sort);
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

  // Remove currentSortLabel since we're using SortChips now

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image
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

  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Subtle blue accent divider */}
      <div className="h-2 w-full bg-primary-200 rounded-b-3xl"></div>
      
      <div className="p-4 space-y-6">
        {/* Filter and Sort Section */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <Button 
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-2 border border-primary-600 text-primary-600 bg-white rounded-full px-6 py-2 hover:bg-primary-50 transition-colors"
            >
              <Filter className="h-4 w-4" />
              Filter
              {(filters.categories.length > 0 || filters.minPrice > 0 || filters.maxPrice < 100) && (
                <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-1">
                  !
                </span>
              )}
            </Button>
          </div>
          
          {/* Sort Chips */}
          <div className="flex justify-center">
            <SortChips onSortChange={handleSortChange} className="max-w-full" />
          </div>
        </div>

        {/* Results count */}
        <div className="text-sm text-gray-600">
          Showing {filteredAndSortedProducts.length} products
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 gap-4">
          {filteredAndSortedProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-3xl border border-gray-200 shadow-sm p-4">
              <div className="relative mb-3">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-32 object-cover rounded-xl"
                />
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-primary-600 text-base">{product.name}</h3>
                
                {product.rating && (
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-3 w-3 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                    <span className="text-xs text-gray-600 ml-1">{product.rating}</span>
                  </div>
                )}

                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold text-primary-600">${product.price}</span>
                </div>
                
                <Button 
                  disabled={!product.inStock || addedItems.has(product.id)}
                  onClick={() => handleAddToCart(product)}
                  className="w-full py-2 btn-primary"
                >
                  {addedItems.has(product.id) ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Added
                    </>
                  ) : (
                    'Add to Cart'
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>

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