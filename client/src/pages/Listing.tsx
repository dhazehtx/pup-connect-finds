
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, MapPin, Calendar, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import LoadingState from '@/components/ui/loading-state';
import ErrorState from '@/components/ui/error-state';

const Listing = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  // Mock data for now - replace with actual data fetching
  const listing = {
    id: id,
    dog_name: "Buddy",
    breed: "Golden Retriever",
    age: 2,
    price: 1200,
    description: "Beautiful, well-trained Golden Retriever looking for a loving home. Great with kids and other pets.",
    location: "San Francisco, CA",
    image_url: "/placeholder.svg",
    seller: {
      name: "John Smith",
      avatar: "/placeholder.svg",
      rating: 4.8,
      verified: true
    },
    created_at: "2024-01-15"
  };

  if (!listing) {
    return (
      <LoadingState 
        message="Loading listing..." 
        className="min-h-screen flex items-center justify-center"
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden">
              <img 
                src={listing.image_url}
                alt={listing.dog_name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-bold">{listing.dog_name}</h1>
                <Button variant="outline" size="icon">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary">{listing.breed}</Badge>
                <Badge variant="outline">{listing.age} years old</Badge>
              </div>
              <div className="text-3xl font-bold text-primary mb-4">
                ${listing.price.toLocaleString()}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{listing.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Listed {new Date(listing.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{listing.description}</p>
            </div>

            {/* Seller Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Seller Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <img 
                    src={listing.seller.avatar}
                    alt={listing.seller.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{listing.seller.name}</span>
                      {listing.seller.verified && (
                        <Badge variant="secondary">Verified</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{listing.seller.rating}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              {user ? (
                <>
                  <Button className="w-full" size="lg">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Seller
                  </Button>
                  <Button variant="outline" className="w-full" size="lg">
                    Schedule Visit
                  </Button>
                </>
              ) : (
                <Button className="w-full" size="lg">
                  Sign In to Contact Seller
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Listing;
