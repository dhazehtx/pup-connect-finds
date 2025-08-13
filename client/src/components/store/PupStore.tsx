import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Filter, Star, ShoppingCart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import FilterPill from '@/components/common/FilterPill';
import { useSignedIn } from '@/hooks/useSignedIn';

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

const PupStore = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const isSignedIn = useSignedIn();

  const categories = ['All', 'Food & Treats', 'Toys', 'Health & Wellness', 'Accessories', 'Grooming'];

  // Fetch products from API with fallback to static data
  const { data: productsResponse, isLoading, error } = useQuery({
    queryKey: ['/api/products'],
    queryFn: () => apiRequest('/api/products'),
    retry: 1,
    retryDelay: 1000,
  });

  // Determine which products to use
  const products = (() => {
    // If we have API data, use it
    if (productsResponse?.data && Array.isArray(productsResponse.data)) {
      return productsResponse.data.map((p: any) => ({
        id: p.id,
        name: p.name || p.title,
        category: p.category || 'Accessories',
        price: p.price || 0,
        rating: p.rating,
        reviews: p.reviews,
        image: p.image || "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400",
        description: p.description || `Quality ${p.name || p.title}`,
        inStock: p.inStock !== false
      }));
    }
    
    // Fallback to static products for demo
    return [
      {
        id: 1,
        name: "Bone Toy",
        category: "Toys",
        price: 10,
        image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400",
        description: "Classic bone-shaped toy for dogs",
        inStock: true
      },
      {
        id: 2,
        name: "Dog Bed",
        category: "Accessories",
        price: 49,
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
        image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
        description: "Durable food and water bowl",
        inStock: true
      },
      {
        id: 5,
        name: "Dog Mat",
        category: "Accessories",
        price: 27,
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
      }
    ];
  })();

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-white min-h-screen pb-24">
      <div className="p-4 space-y-6">
        {/* Category Filter Pills */}
        <div className="flex items-center justify-center pt-4">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map(category => (
              <FilterPill
                key={category}
                active={selectedCategory === category}
                onClick={() => setSelectedCategory(category)}
                className="text-sm"
              >
                {category}
              </FilterPill>
            ))}
          </div>
        </div>

        {/* Error state */}
        {error && !isLoading && (
          <div className="text-center py-8 bg-red-50 rounded-xl">
            <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-red-400" />
            <h3 className="text-lg font-semibold text-red-700 mb-2">Store Temporarily Unavailable</h3>
            <p className="text-red-600 mb-4">We're having trouble loading products. Please try again later.</p>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-[#2363FF] border-t-transparent rounded-full mx-auto mb-3"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-3xl border border-gray-200 shadow-sm p-4">
                <div className="relative mb-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-32 object-cover rounded-xl"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400";
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-[#2363FF] text-base">{product.name}</h3>
                  
                  {product.rating && (
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-3 w-3 ${i < Math.floor(product.rating || 0) ? 'text-orange-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                      <span className="text-xs text-gray-600 ml-1">{product.rating}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-[#2363FF]">${product.price}</span>
                  </div>
                  
                  <Button 
                    disabled={!product.inStock}
                    className="w-full py-2 bg-[#2363FF] hover:bg-[#1E55D6] text-white font-medium rounded-lg"
                  >
                    {isSignedIn ? "Add to Cart" : "Preview Item"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && filteredProducts.length === 0 && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-12 text-center">
            <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2 text-gray-700">No products found</h3>
            <p className="text-gray-500">Try selecting a different category or check back later for new items!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PupStore;