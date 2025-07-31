import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Filter, ShoppingCart, Star, Heart } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  description: string;
  inStock: boolean;
}

const PupStore = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Food & Treats', 'Toys', 'Health & Wellness', 'Accessories', 'Grooming'];

  const products: Product[] = [
    {
      id: 1,
      name: "Premium Puppy Food - Chicken & Rice",
      category: "Food & Treats",
      price: 49.99,
      rating: 4.8,
      reviews: 234,
      image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400",
      description: "High-quality nutrition for growing puppies",
      inStock: true
    },
    {
      id: 2,
      name: "Interactive Puzzle Toy",
      category: "Toys",
      price: 19.99,
      rating: 4.6,
      reviews: 156,
      image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400",
      description: "Mental stimulation for smart pups",
      inStock: true
    },
    {
      id: 3,
      name: "Adjustable Dog Collar",
      category: "Accessories",
      price: 24.99,
      rating: 4.7,
      reviews: 89,
      image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400",
      description: "Comfortable and durable collar",
      inStock: false
    },
    {
      id: 4,
      name: "Natural Training Treats",
      category: "Food & Treats",
      price: 12.99,
      rating: 4.9,
      reviews: 312,
      image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400",
      description: "Healthy rewards for good behavior",
      inStock: true
    },
    {
      id: 5,
      name: "Gentle Puppy Shampoo",
      category: "Grooming",
      price: 16.99,
      rating: 4.5,
      reviews: 67,
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
      description: "Mild formula for sensitive skin",
      inStock: true
    },
    {
      id: 6,
      name: "Orthopedic Dog Bed",
      category: "Accessories",
      price: 79.99,
      rating: 4.8,
      reviews: 145,
      image: "https://images.unsplash.com/photo-1581888227599-779811939961?w=400",
      description: "Memory foam comfort for better sleep",
      inStock: true
    }
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="cursor-pointer px-3 py-1"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <div className="relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2 bg-white/80 hover:bg-white"
              >
                <Heart className="h-4 w-4" />
              </Button>
              {!product.inStock && (
                <div className="absolute inset-0 bg-black/50 rounded-t-lg flex items-center justify-center">
                  <Badge variant="destructive">Out of Stock</Badge>
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg line-clamp-2">{product.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium ml-1">{product.rating}</span>
                  </div>
                  <span className="text-sm text-gray-500">({product.reviews} reviews)</span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xl font-bold text-blue-600">${product.price}</span>
                  <Button 
                    size="sm" 
                    disabled={!product.inStock}
                    className="flex items-center gap-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PupStore;