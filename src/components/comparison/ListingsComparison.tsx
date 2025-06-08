
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Star, MapPin, Calendar, DollarSign, Heart, MessageCircle } from 'lucide-react';

interface Listing {
  id: string;
  dog_name: string;
  breed: string;
  price: number;
  age: number;
  location: string;
  image_url?: string;
  description?: string;
  user_id: string;
  created_at: string;
}

interface ListingsComparisonProps {
  listings: Listing[];
  onRemoveListing: (listingId: string) => void;
  onContactSeller: (listing: Listing) => void;
  onAddToFavorites: (listing: Listing) => void;
}

const ListingsComparison = ({ 
  listings, 
  onRemoveListing, 
  onContactSeller, 
  onAddToFavorites 
}: ListingsComparisonProps) => {
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'price', 'age', 'location', 'breed'
  ]);

  const features = [
    { key: 'price', label: 'Price', icon: DollarSign },
    { key: 'age', label: 'Age', icon: Calendar },
    { key: 'location', label: 'Location', icon: MapPin },
    { key: 'breed', label: 'Breed', icon: Star },
    { key: 'description', label: 'Description', icon: MessageCircle }
  ];

  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const renderFeatureValue = (listing: Listing, feature: string) => {
    switch (feature) {
      case 'price':
        return (
          <div className="flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            <span className="font-semibold">${listing.price}</span>
          </div>
        );
      case 'age':
        return (
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{listing.age} months</span>
          </div>
        );
      case 'location':
        return (
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{listing.location}</span>
          </div>
        );
      case 'breed':
        return (
          <Badge variant="secondary" className="w-fit">
            {listing.breed}
          </Badge>
        );
      case 'description':
        return (
          <p className="text-sm text-gray-600 line-clamp-3">
            {listing.description || 'No description available'}
          </p>
        );
      default:
        return null;
    }
  };

  if (listings.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-gray-500">
            <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No listings to compare</h3>
            <p className="text-sm">Add listings to your comparison to see them side by side</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Feature selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Compare Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {features.map(feature => {
              const Icon = feature.icon;
              return (
                <Badge
                  key={feature.key}
                  variant={selectedFeatures.includes(feature.key) ? "default" : "outline"}
                  className="cursor-pointer flex items-center gap-1"
                  onClick={() => toggleFeature(feature.key)}
                >
                  <Icon className="w-3 h-3" />
                  {feature.label}
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Comparison table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {listings.map((listing) => (
                <Card key={listing.id} className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveListing(listing.id)}
                    className="absolute top-2 right-2 w-8 h-8 p-0 z-10"
                  >
                    <X className="w-4 h-4" />
                  </Button>

                  <CardContent className="p-4">
                    {/* Listing image and name */}
                    <div className="mb-4">
                      {listing.image_url && (
                        <img
                          src={listing.image_url}
                          alt={listing.dog_name}
                          className="w-full h-32 object-cover rounded-lg mb-2"
                        />
                      )}
                      <h3 className="font-semibold text-lg">{listing.dog_name}</h3>
                    </div>

                    {/* Features comparison */}
                    <div className="space-y-3">
                      {selectedFeatures.map(feature => (
                        <div key={feature} className="border-b pb-2 last:border-b-0">
                          <label className="text-xs text-gray-500 uppercase tracking-wide">
                            {features.find(f => f.key === feature)?.label}
                          </label>
                          <div className="mt-1">
                            {renderFeatureValue(listing, feature)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4 pt-4 border-t">
                      <Button
                        size="sm"
                        onClick={() => onContactSeller(listing)}
                        className="flex-1"
                      >
                        <MessageCircle className="w-3 h-3 mr-1" />
                        Contact
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAddToFavorites(listing)}
                        className="flex items-center gap-1"
                      >
                        <Heart className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600">Price Range</p>
              <p className="font-semibold">
                ${Math.min(...listings.map(l => l.price))} - ${Math.max(...listings.map(l => l.price))}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Age Range</p>
              <p className="font-semibold">
                {Math.min(...listings.map(l => l.age))} - {Math.max(...listings.map(l => l.age))} months
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Breeds</p>
              <p className="font-semibold">
                {[...new Set(listings.map(l => l.breed))].length} different
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Listings</p>
              <p className="font-semibold">{listings.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ListingsComparison;
