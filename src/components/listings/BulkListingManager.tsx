
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Check, X, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { useListingAnalytics } from '@/hooks/useListingAnalytics';
import { useEnhancedListings } from '@/hooks/useEnhancedListings';
import { useToast } from '@/hooks/use-toast';

const BulkListingManager = () => {
  const [selectedListings, setSelectedListings] = useState<string[]>([]);
  const [bulkOperation, setBulkOperation] = useState<string>('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  const { listings, loading, refreshListings } = useEnhancedListings();
  const { bulkUpdateListings } = useListingAnalytics();
  const { toast } = useToast();

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedListings(listings.map(listing => listing.id));
    } else {
      setSelectedListings([]);
    }
  };

  const handleSelectListing = (listingId: string, checked: boolean) => {
    if (checked) {
      setSelectedListings(prev => [...prev, listingId]);
    } else {
      setSelectedListings(prev => prev.filter(id => id !== listingId));
    }
  };

  const handleBulkOperation = async () => {
    if (!bulkOperation || selectedListings.length === 0) return;

    try {
      await bulkUpdateListings({
        listingIds: selectedListings,
        operation: bulkOperation as any
      });
      
      setSelectedListings([]);
      setBulkOperation('');
      setShowConfirmDialog(false);
      refreshListings();
    } catch (error) {
      console.error('Bulk operation failed:', error);
    }
  };

  const getOperationDescription = () => {
    switch (bulkOperation) {
      case 'activate':
        return `Activate ${selectedListings.length} selected listing(s)`;
      case 'deactivate':
        return `Deactivate ${selectedListings.length} selected listing(s)`;
      case 'delete':
        return `Permanently delete ${selectedListings.length} selected listing(s)`;
      default:
        return '';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'sold':
        return <Badge className="bg-blue-100 text-blue-800">Sold</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bulk Listing Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={selectedListings.length === listings.length && listings.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <label htmlFor="select-all" className="text-sm font-medium">
                Select All ({selectedListings.length} selected)
              </label>
            </div>
            
            {selectedListings.length > 0 && (
              <>
                <Select value={bulkOperation} onValueChange={setBulkOperation}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select operation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activate">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Activate Listings
                      </div>
                    </SelectItem>
                    <SelectItem value="deactivate">
                      <div className="flex items-center gap-2">
                        <EyeOff className="h-4 w-4" />
                        Deactivate Listings
                      </div>
                    </SelectItem>
                    <SelectItem value="delete">
                      <div className="flex items-center gap-2">
                        <Trash2 className="h-4 w-4" />
                        Delete Listings
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                
                <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                  <AlertDialogTrigger asChild>
                    <Button 
                      disabled={!bulkOperation}
                      variant={bulkOperation === 'delete' ? 'destructive' : 'default'}
                    >
                      Apply Operation
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Bulk Operation</AlertDialogTitle>
                      <AlertDialogDescription>
                        {getOperationDescription()}. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleBulkOperation}>
                        Confirm
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>

          <div className="space-y-3">
            {listings.map((listing) => (
              <div key={listing.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                <Checkbox
                  checked={selectedListings.includes(listing.id)}
                  onCheckedChange={(checked) => handleSelectListing(listing.id, checked as boolean)}
                />
                
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={listing.image_url || '/placeholder.svg'}
                    alt={listing.dog_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold">{listing.dog_name}</h3>
                  <p className="text-sm text-muted-foreground">{listing.breed}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(listing.status)}
                    <span className="text-sm font-medium">${listing.price.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="text-sm">{new Date(listing.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkListingManager;
