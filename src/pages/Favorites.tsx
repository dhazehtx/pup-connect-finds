
import React from 'react';
import { useFavorites } from '@/hooks/useFavorites';
import FavoritesList from '@/components/favorites/FavoritesList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Favorites = () => {
  const { favorites, loading, removeFromFavorites } = useFavorites();
  const navigate = useNavigate();

  const handleRemoveFavorite = async (listingId: string) => {
    await removeFromFavorites(listingId);
  };

  const handleViewListing = (listingId: string) => {
    navigate(`/listing/${listingId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="w-6 h-6 text-red-500" />
              <span>My Favorites</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading favorites...</p>
              </div>
            ) : (
              <FavoritesList
                favorites={favorites}
                onRemoveFavorite={handleRemoveFavorite}
                onViewListing={handleViewListing}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Favorites;
