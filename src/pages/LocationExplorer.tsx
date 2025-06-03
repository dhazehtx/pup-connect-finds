
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Search, Target, TrendingUp } from 'lucide-react';
import EnhancedMapView from '@/components/maps/EnhancedMapView';
import ProximitySearch from '@/components/location/ProximitySearch';
import LocationBasedRecommendations from '@/components/location/LocationBasedRecommendations';
import LocationManager from '@/components/location/LocationManager';

const LocationExplorer = () => {
  const [searchResults, setSearchResults] = useState<any[]>([]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Location Explorer</h1>
        <p className="text-gray-600">
          Discover puppies near you with our advanced location features
        </p>
      </div>

      <Tabs defaultValue="map" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="map" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Interactive Map
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Proximity Search
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Recommendations
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Location Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="mt-6">
          <EnhancedMapView />
        </TabsContent>

        <TabsContent value="search" className="mt-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <ProximitySearch onResultsChange={setSearchResults} />
            </div>
            <div className="lg:col-span-2">
              {searchResults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.map((result, index) => (
                    <div key={result.id || index} className="border rounded-lg p-4">
                      <div className="flex gap-3">
                        <img
                          src={result.image_url || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=100&h=100&fit=crop'}
                          alt={result.dog_name}
                          className="w-20 h-20 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium">{result.dog_name}</h3>
                          <p className="text-sm text-gray-600">{result.breed}</p>
                          <p className="text-lg font-bold">${result.price?.toLocaleString()}</p>
                          {result.formattedDistance && (
                            <p className="text-sm text-blue-600">{result.formattedDistance} away</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-4" />
                  <p>Use proximity search to find listings in your area</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="mt-6">
          <LocationBasedRecommendations />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <LocationManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LocationExplorer;
