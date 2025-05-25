
import React, { useState } from 'react';
import { MapPin, Filter, Truck, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const MapView = () => {
  const [selectedRadius, setSelectedRadius] = useState('25');
  const [deliveryFilter, setDeliveryFilter] = useState('all');

  const listings = [
    {
      id: 1,
      title: "Golden Retriever Puppies",
      price: "$2,800",
      location: "Oakland, CA",
      distance: "5.7 miles",
      breed: "Golden Retriever",
      image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=200&fit=crop",
      lat: 37.8044,
      lng: -122.2712,
      delivery: "pickup",
      verified: true
    },
    {
      id: 2,
      title: "French Bulldog - Blue Fawn",
      price: "$4,200",
      location: "San Francisco, CA",
      distance: "2.3 miles",
      breed: "French Bulldog",
      image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=200&fit=crop",
      lat: 37.7749,
      lng: -122.4194,
      delivery: "both",
      verified: true
    },
    {
      id: 3,
      title: "German Shepherd Puppy",
      price: "$3,500",
      location: "San Jose, CA",
      distance: "8.1 miles",
      breed: "German Shepherd",
      image: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=300&h=200&fit=crop",
      lat: 37.3382,
      lng: -121.8863,
      delivery: "shipping",
      verified: true
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Map View</h1>
        <p className="text-gray-600">Find puppies available in your area</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">Radius:</span>
            <Select value={selectedRadius} onValueChange={setSelectedRadius}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="10">10 mi</SelectItem>
                <SelectItem value="25">25 mi</SelectItem>
                <SelectItem value="50">50 mi</SelectItem>
                <SelectItem value="100">100 mi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">Delivery:</span>
            <Select value={deliveryFilter} onValueChange={setDeliveryFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Options</SelectItem>
                <SelectItem value="pickup">Pickup Only</SelectItem>
                <SelectItem value="shipping">Shipping Available</SelectItem>
                <SelectItem value="both">Pickup & Shipping</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Map Placeholder */}
        <div className="lg:order-2">
          <Card className="h-[600px]">
            <CardContent className="p-0 h-full">
              <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50"></div>
                <div className="relative z-10 text-center">
                  <MapPin className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Interactive Map</h3>
                  <p className="text-gray-500 text-sm">Map integration coming soon</p>
                  <p className="text-gray-400 text-xs mt-2">Showing {listings.length} listings within {selectedRadius} miles</p>
                </div>
                
                {/* Mock map pins */}
                <div className="absolute top-20 left-20 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
                <div className="absolute top-32 right-24 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
                <div className="absolute bottom-24 left-16 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Listings */}
        <div className="lg:order-1 space-y-4 max-h-[600px] overflow-y-auto">
          {listings.map((listing) => (
            <Card key={listing.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <img
                    src={listing.image}
                    alt={listing.title}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{listing.title}</h3>
                      {listing.verified && (
                        <Badge variant="secondary" className="ml-2">Verified</Badge>
                      )}
                    </div>
                    
                    <p className="text-lg font-bold text-gray-900 mb-1">{listing.price}</p>
                    
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                      <MapPin size={14} />
                      {listing.location} • {listing.distance}
                    </div>

                    <div className="flex items-center gap-2">
                      {listing.delivery === 'pickup' && (
                        <Badge variant="outline" className="text-xs">
                          <Home className="w-3 h-3 mr-1" />
                          Pickup Only
                        </Badge>
                      )}
                      {listing.delivery === 'shipping' && (
                        <Badge variant="outline" className="text-xs">
                          <Truck className="w-3 h-3 mr-1" />
                          Shipping Available
                        </Badge>
                      )}
                      {listing.delivery === 'both' && (
                        <>
                          <Badge variant="outline" className="text-xs">
                            <Home className="w-3 h-3 mr-1" />
                            Pickup
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Truck className="w-3 h-3 mr-1" />
                            Shipping
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapView;
