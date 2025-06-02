
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  User,
  Database
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDogListings } from '@/hooks/useDogListings';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import EmptyState from '@/components/EmptyState';
import { useToast } from '@/hooks/use-toast';
import { loadSampleData } from '@/utils/sampleDataLoader';

const Home = () => {
  const { user, isGuest } = useAuth();
  const { listings, loading, refreshListings } = useDogListings();
  const { toast } = useToast();

  const handleLoadSampleData = async () => {
    try {
      const success = await loadSampleData();
      if (success) {
        toast({
          title: "Sample Data Loaded",
          description: "Demo listings have been added successfully!",
        });
        refreshListings();
      } else {
        toast({
          title: "Error",
          description: "Failed to load sample data",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while loading sample data",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <LoadingSkeleton viewMode="list" />;
  }

  if (!listings || listings.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto bg-white min-h-screen">
          <div className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">No listings yet</h2>
            <p className="text-gray-600 mb-6">Load some sample data to see the demo in action!</p>
            <Button onClick={handleLoadSampleData} className="mb-4">
              <Database className="w-4 h-4 mr-2" />
              Load Demo Listings
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Instagram-like Feed */}
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Demo Data Loader Button */}
        <div className="p-3 border-b border-gray-200 bg-white sticky top-0 z-10">
          <Button 
            onClick={handleLoadSampleData}
            variant="outline" 
            size="sm"
            className="w-full"
          >
            <Database className="w-4 h-4 mr-2" />
            Load More Demo Data
          </Button>
        </div>

        <div className="space-y-0">
          {listings.map((listing) => (
            <Card key={listing.id} className="rounded-none border-x-0 border-t-0 border-b border-gray-200 shadow-none">
              {/* Post Header */}
              <div className="flex items-center justify-between p-3 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{listing.profiles?.username || 'breeder'}</p>
                    <p className="text-xs text-gray-500">{listing.profiles?.location || 'Location'}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </div>

              {/* Post Image */}
              {listing.image_url && (
                <div className="aspect-square bg-gray-100">
                  <img 
                    src={listing.image_url} 
                    alt={listing.dog_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Post Actions */}
              <div className="p-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" className="p-0 h-auto">
                      <Heart className="w-6 h-6" />
                    </Button>
                    <Button variant="ghost" size="sm" className="p-0 h-auto">
                      <MessageCircle className="w-6 h-6" />
                    </Button>
                    <Button variant="ghost" size="sm" className="p-0 h-auto">
                      <Share2 className="w-6 h-6" />
                    </Button>
                  </div>
                </div>

                {/* Post Content */}
                <div className="space-y-1">
                  <p className="font-semibold text-sm">
                    <span className="font-bold">{listing.dog_name}</span> • <Badge variant="outline" className="text-xs">{listing.breed}</Badge>
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">${listing.price}</span> • {listing.age} months old
                  </p>
                  {listing.description && (
                    <p className="text-sm text-gray-700">{listing.description}</p>
                  )}
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    {new Date(listing.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
