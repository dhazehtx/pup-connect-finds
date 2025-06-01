
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Star, MapPin, Calendar, DollarSign, Heart } from 'lucide-react';
import { sampleListings } from '@/data/sampleListings';

interface ComparisonItem {
  id: number;
  listing: any;
}

const ListingComparison = () => {
  const [comparisons, setComparisons] = useState<ComparisonItem[]>([
    { id: 1, listing: sampleListings[0] },
    { id: 2, listing: sampleListings[1] },
  ]);

  const [availableListings] = useState(sampleListings.slice(2, 8));

  const addToComparison = (listing: any) => {
    if (comparisons.length < 4) {
      setComparisons(prev => [...prev, { id: Date.now(), listing }]);
    }
  };

  const removeFromComparison = (id: number) => {
    setComparisons(prev => prev.filter(item => item.id !== id));
  };

  const comparisonFields = [
    { key: 'price', label: 'Price', icon: DollarSign },
    { key: 'breed', label: 'Breed', icon: null },
    { key: 'age', label: 'Age', icon: Calendar },
    { key: 'location', label: 'Location', icon: MapPin },
    { key: 'rating', label: 'Seller Rating', icon: Star },
    { key: 'available', label: 'Available', icon: null },
    { key: 'verified', label: 'Verified Seller', icon: null },
  ];

  const getFieldValue = (listing: any, field: string) => {
    switch (field) {
      case 'price':
        return listing.price;
      case 'breed':
        return listing.breed;
      case 'age':
        return listing.age;
      case 'location':
        return listing.location;
      case 'rating':
        return `${listing.rating} (${listing.reviews} reviews)`;
      case 'available':
        return listing.available > 1 ? `${listing.available} puppies` : '1 puppy';
      case 'verified':
        return listing.verified ? 'Yes' : 'No';
      default:
        return 'N/A';
    }
  };

  const getBestValue = (field: string) => {
    if (comparisons.length === 0) return null;
    
    switch (field) {
      case 'price':
        return Math.min(...comparisons.map(c => parseInt(c.listing.price.replace(/[$,]/g, ''))));
      case 'rating':
        return Math.max(...comparisons.map(c => c.listing.rating));
      case 'available':
        return Math.max(...comparisons.map(c => c.listing.available));
      default:
        return null;
    }
  };

  const isHighlighted = (listing: any, field: string) => {
    const bestValue = getBestValue(field);
    if (!bestValue) return false;
    
    switch (field) {
      case 'price':
        return parseInt(listing.price.replace(/[$,]/g, '')) === bestValue;
      case 'rating':
        return listing.rating === bestValue;
      case 'available':
        return listing.available === bestValue;
      default:
        return false;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Compare Listings</h1>
          <p className="text-gray-600">Compare up to 4 listings side by side</p>
        </div>
        <Badge variant="secondary">
          {comparisons.length}/4 listings
        </Badge>
      </div>

      {/* Comparison Table */}
      {comparisons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Comparison Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                {/* Header with listing images and titles */}
                <thead>
                  <tr>
                    <th className="text-left p-4 w-48"></th>
                    {comparisons.map(item => (
                      <th key={item.id} className="text-center p-4 min-w-64">
                        <div className="space-y-3">
                          <div className="relative">
                            <img
                              src={item.listing.image}
                              alt={item.listing.title}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <Button
                              size="sm"
                              variant="destructive"
                              className="absolute top-2 right-2"
                              onClick={() => removeFromComparison(item.id)}
                            >
                              <X size={16} />
                            </Button>
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm">{item.listing.title}</h4>
                            <p className="text-xs text-gray-600">{item.listing.breeder}</p>
                          </div>
                        </div>
                      </th>
                    ))}
                    {comparisons.length < 4 && (
                      <th className="text-center p-4 min-w-64">
                        <div className="h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <Plus className="mx-auto mb-2 text-gray-400" size={24} />
                            <p className="text-sm text-gray-500">Add listing</p>
                          </div>
                        </div>
                      </th>
                    )}
                  </tr>
                </thead>

                {/* Comparison Fields */}
                <tbody>
                  {comparisonFields.map(field => {
                    const IconComponent = field.icon;
                    return (
                      <tr key={field.key} className="border-t">
                        <td className="p-4 font-medium">
                          <div className="flex items-center gap-2">
                            {IconComponent && <IconComponent size={16} />}
                            {field.label}
                          </div>
                        </td>
                        {comparisons.map(item => (
                          <td 
                            key={item.id} 
                            className={`p-4 text-center ${
                              isHighlighted(item.listing, field.key) ? 'bg-green-50 font-semibold' : ''
                            }`}
                          >
                            {getFieldValue(item.listing, field.key)}
                            {field.key === 'verified' && item.listing.verified && (
                              <Badge className="ml-2 bg-green-500 text-white text-xs">
                                Verified
                              </Badge>
                            )}
                          </td>
                        ))}
                        {comparisons.length < 4 && (
                          <td className="p-4 text-center text-gray-400">-</td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>

                {/* Action Buttons */}
                <tfoot>
                  <tr className="border-t bg-gray-50">
                    <td className="p-4 font-medium">Actions</td>
                    {comparisons.map(item => (
                      <td key={item.id} className="p-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <Button size="sm">Contact</Button>
                          <Button size="sm" variant="outline">
                            <Heart size={16} />
                          </Button>
                        </div>
                      </td>
                    ))}
                    {comparisons.length < 4 && (
                      <td className="p-4"></td>
                    )}
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Listings Section */}
      {comparisons.length < 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Add Listings to Compare</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {availableListings.map(listing => (
                <div key={listing.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                  <img
                    src={listing.image}
                    alt={listing.title}
                    className="w-full h-32 object-cover rounded mb-3"
                  />
                  <h4 className="font-medium text-sm mb-1">{listing.title}</h4>
                  <p className="text-xs text-gray-600 mb-2">{listing.breed}</p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-green-600">{listing.price}</span>
                    <Button 
                      size="sm" 
                      onClick={() => addToComparison(listing)}
                      disabled={comparisons.some(c => c.listing.id === listing.id)}
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Breed Comparison Tool */}
      <Card>
        <CardHeader>
          <CardTitle>Breed Comparison Tool</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <h4 className="font-semibold mb-2">Golden Retriever</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Size:</span>
                  <span>Large (55-75 lbs)</span>
                </div>
                <div className="flex justify-between">
                  <span>Energy:</span>
                  <span>High</span>
                </div>
                <div className="flex justify-between">
                  <span>Training:</span>
                  <span>Easy</span>
                </div>
                <div className="flex justify-between">
                  <span>Grooming:</span>
                  <span>High</span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <h4 className="font-semibold mb-2">French Bulldog</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Size:</span>
                  <span>Small (20-28 lbs)</span>
                </div>
                <div className="flex justify-between">
                  <span>Energy:</span>
                  <span>Moderate</span>
                </div>
                <div className="flex justify-between">
                  <span>Training:</span>
                  <span>Moderate</span>
                </div>
                <div className="flex justify-between">
                  <span>Grooming:</span>
                  <span>Low</span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <h4 className="font-semibold mb-2">German Shepherd</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Size:</span>
                  <span>Large (50-90 lbs)</span>
                </div>
                <div className="flex justify-between">
                  <span>Energy:</span>
                  <span>Very High</span>
                </div>
                <div className="flex justify-between">
                  <span>Training:</span>
                  <span>Easy</span>
                </div>
                <div className="flex justify-between">
                  <span>Grooming:</span>
                  <span>High</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ListingComparison;
