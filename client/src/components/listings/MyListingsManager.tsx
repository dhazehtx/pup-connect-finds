
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useDogListings } from '@/hooks/useDogListings';
import { useToast } from '@/hooks/use-toast';
import { Eye, Edit, Trash2, Heart, MessageCircle, MapPin, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyListingsManager = () => {
  const { user } = useAuth();
  const { getUserListings, deleteListing } = useDogListings();
  const { toast } = useToast();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserListings();
    }
  }, [user]);

  const loadUserListings = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userListings = await getUserListings(user.id);
      setListings(userListings);
    } catch (error) {
      console.error('Error loading user listings:', error);
      toast({
        title: "Error",
        description: "Failed to load your listings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;

    try {
      await deleteListing(listingId);
      setListings(prev => prev.filter(listing => listing.id !== listingId));
      toast({
        title: "Success",
        description: "Listing deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast({
        title: "Error",
        description: "Failed to delete listing",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'sold': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No listings yet</h3>
          <p className="text-gray-600 mb-4">Create your first dog listing to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">My Listings ({listings.length})</h2>
      </div>
      
      <div className="grid gap-4">
        {listings.map((listing) => (
          <Card key={listing.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex gap-4">
                {listing.image_url && (
                  <img
                    src={listing.image_url}
                    alt={listing.dog_name}
                    className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{listing.dog_name}</h3>
                      <p className="text-gray-600">{listing.breed}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {listing.age} months old
                        </span>
                        {listing.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {listing.location}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xl font-bold text-blue-600">
                        ${listing.price?.toLocaleString()}
                      </div>
                      <Badge className={getStatusColor(listing.status || 'active')}>
                        {listing.status || 'active'}
                      </Badge>
                    </div>
                  </div>
                  
                  {listing.description && (
                    <p className="text-gray-600 mt-2 line-clamp-2">{listing.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        0 views
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        0 inquiries
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Link to={`/listing/${listing.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteListing(listing.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MyListingsManager;
