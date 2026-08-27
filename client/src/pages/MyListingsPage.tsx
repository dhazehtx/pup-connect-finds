import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit3, Trash2, Eye, Plus, Filter, Calendar, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const MyListingsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch user's listings
  const { data: listings, isLoading, error } = useQuery({
    queryKey: ['my-listings', user?.id, statusFilter],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const params = new URLSearchParams();
      params.append('user_id', user.id);
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      console.log('[MY LISTINGS] Fetching user listings with params:', params.toString());
      
      return await apiRequest(`listings/user/${user.id}?${params.toString()}`);
    },
    enabled: !!user?.id,
  });

  // Delete listing mutation
  const deleteMutation = useMutation({
    mutationFn: async (listingId: string) => {
      return apiRequest(`listings/${listingId}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      toast({
        title: "Listing deleted successfully",
        description: "Your listing has been removed from the marketplace.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete listing",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Update listing status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ listingId, status }: { listingId: string; status: string }) => {
      return apiRequest(`listings/${listingId}`, {
        method: 'PUT',
        body: { status }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      toast({
        title: "Listing updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update listing",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteListing = (listingId: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      deleteMutation.mutate(listingId);
    }
  };

  const handleStatusChange = (listingId: string, status: string) => {
    updateStatusMutation.mutate({ listingId, status });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sold': return 'bg-blue-100 text-blue-800';
      case 'inactive': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredListings = listings?.filter((listing: any) => {
    if (searchTerm) {
      return listing.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             listing.breed?.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  }) || [];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600">Please sign in to view your listings.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
              <p className="text-gray-600 mt-2">Manage your dog listings and track their performance</p>
            </div>
            <Button className="mt-4 sm:mt-0" onClick={() => window.location.href = '/create-listing'}>
              <Plus className="w-4 h-4 mr-2" />
              Create New Listing
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by title or breed..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Listings Grid */}
        {filteredListings.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <div className="text-gray-400 mb-4">
                <Plus className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your filters or search terms.'
                  : "You haven't created any listings yet. Start by creating your first listing!"
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button onClick={() => window.location.href = '/create-listing'}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Listing
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing: any) => (
              <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative overflow-hidden">
                  {listing.images?.[0] ? (
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge className={getStatusColor(listing.status)}>
                      {listing.status}
                    </Badge>
                  </div>
                </div>
                
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg line-clamp-2">{listing.title}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      ${listing.price}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(listing.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Breed:</strong> {listing.breed}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Age:</strong> {listing.age} weeks • <strong>Gender:</strong> {listing.gender}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit3 className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteListing(listing.id, listing.title)}
                        disabled={deleteMutation.isPending}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {listing.status === 'draft' && (
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleStatusChange(listing.id, 'active')}
                        disabled={updateStatusMutation.isPending}
                      >
                        Publish Listing
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListingsPage;