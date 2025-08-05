import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProductCard } from '@/components/ui/product-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, Search, Loader2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string | null;
  unit_price: string;
  image_url: string | null;
  is_subscription: boolean;
  is_active: boolean;
  inventory_qty: number;
  created_at: string;
  updated_at: string;
}

interface ProductsResponse {
  data: Product[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}

const StoreTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { data: productsData, isLoading, error } = useQuery<ProductsResponse>({
    queryKey: ['/api/products', { search: searchTerm, sort: sortBy, category: categoryFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (sortBy !== 'featured') params.append('sort', sortBy);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      
      const response = await fetch(`/api/products?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    }
  });

  const products = productsData?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">My Pup Store</h1>
        <p className="text-gray-600">Premium products for your furry friends</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="toys">Toys</SelectItem>
              <SelectItem value="food">Food & Treats</SelectItem>
              <SelectItem value="accessories">Accessories</SelectItem>
              <SelectItem value="beds">Beds & Furniture</SelectItem>
              <SelectItem value="clothing">Clothing</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="default">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading products...</span>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600">Failed to load products. Please try again.</p>
          <Button 
            className="mt-4" 
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No products found.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={(product) => {
                  console.log('Quick view:', product);
                  // TODO: Implement quick view modal
                }}
              />
            ))}
          </div>

          {/* Load More Button */}
          {productsData && productsData.totalPages > 1 && (
            <div className="text-center pt-8">
              <Button variant="outline" size="lg">
                Load More Products
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StoreTab;