import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProductCard } from '@/components/ui/product-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, SortAsc } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

type SortType = 'featured' | 'price-low-high' | 'price-high-low' | 'name';

const StoreTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortType>('featured');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((product: Product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category (subscription vs regular products)
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'subscription') {
        filtered = filtered.filter((product: Product) => product.is_subscription);
      } else if (selectedCategory === 'products') {
        filtered = filtered.filter((product: Product) => !product.is_subscription);
      }
    }

    // Sort products
    const sorted = [...filtered];
    switch (sortBy) {
      case 'price-low-high':
        return sorted.sort((a, b) => parseFloat(a.unit_price) - parseFloat(b.unit_price));
      case 'price-high-low':
        return sorted.sort((a, b) => parseFloat(b.unit_price) - parseFloat(a.unit_price));
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'featured':
      default:
        return sorted;
    }
  }, [products, searchTerm, selectedCategory, sortBy]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-red-500">Failed to load products. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Store Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-primary">My Pup Store</h2>
        <p className="text-muted-foreground">
          Premium pet products and subscription boxes
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              <SelectItem value="products">Pet Products</SelectItem>
              <SelectItem value="subscription">Subscriptions</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortType)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
              <SelectItem value="price-low-high">Price: Low to High</SelectItem>
              <SelectItem value="price-high-low">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredAndSortedProducts.length} of {products.length} products
      </div>

      {/* Products Grid */}
      {filteredAndSortedProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm || selectedCategory !== 'all' 
              ? 'No products match your search criteria.' 
              : 'No products available.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product}
              onQuickView={(product) => {
                // TODO: Implement product quick view modal
                console.log('Quick view:', product);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StoreTab;