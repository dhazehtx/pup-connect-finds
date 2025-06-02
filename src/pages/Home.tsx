
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  MapPin, 
  Star, 
  MessageCircle, 
  Share2, 
  Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDogListings } from '@/hooks/useDogListings';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import EmptyState from '@/components/EmptyState';

const Home = () => {
  const { user, isGuest } = useAuth();
  const { listings, loading } = useDogListings();
  const [activeTab, setActiveTab] = useState('feed');

  if (loading) {
    return <LoadingSkeleton viewMode="list" />;
  }

  const featuredListings = listings?.slice(0, 6) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="feed">Pet Feed</TabsTrigger>
            <TabsTrigger value="featured">Featured Pets</TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-6">
            {/* Feed Content */}
            <div className="grid gap-6">
              {featuredListings.length > 0 ? (
                featuredListings.map((listing) => (
                  <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="flex">
                      {listing.image_url && (
                        <div className="w-32 h-32 flex-shrink-0">
                          <img 
                            src={listing.image_url} 
                            alt={listing.dog_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-semibold">{listing.dog_name}</h3>
                          <Badge>{listing.breed}</Badge>
                        </div>
                        <p className="text-gray-600 mb-2">{listing.age} months old</p>
                        <p className="text-2xl font-bold text-green-600 mb-3">${listing.price}</p>
                        <div className="flex gap-2">
                          <Button size="sm">
                            <Heart className="w-4 h-4 mr-1" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline">
                            <MessageCircle className="w-4 h-4 mr-1" />
                            Message
                          </Button>
                          <Button size="sm" variant="outline">
                            <Share2 className="w-4 h-4 mr-1" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <EmptyState 
                  onClearFilters={() => {}}
                  hasActiveFilters={false}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="featured" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredListings.length > 0 ? (
                featuredListings.map((listing) => (
                  <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    {listing.image_url && (
                      <div className="aspect-video">
                        <img 
                          src={listing.image_url} 
                          alt={listing.dog_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold">{listing.dog_name}</h3>
                        <Badge>{listing.breed}</Badge>
                      </div>
                      <p className="text-gray-600 mb-2">{listing.age} months old</p>
                      <p className="text-xl font-bold text-green-600 mb-3">${listing.price}</p>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">
                          <Heart className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full">
                  <EmptyState 
                    onClearFilters={() => {}}
                    hasActiveFilters={false}
                  />
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Home;
