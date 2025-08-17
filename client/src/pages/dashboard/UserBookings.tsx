import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, DollarSign, MapPin, MessageSquare, Star } from 'lucide-react';

interface UserBooking {
  id: string;
  service_date: string;
  duration_hours: string;
  total_price: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  special_instructions?: string;
  created_at: string;
  updated_at: string;
  provider: {
    id: string;
    service_type: string;
    price: string;
    location?: string;
  };
  user: {
    id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
  };
}

function UserBookings() {
  const { user } = useAuth();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['/api/services/bookings/user', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/services/bookings/user/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch bookings');
      
      const result = await response.json();
      return result.data || [];
    },
    enabled: !!user?.id,
  });

  const serviceTypeLabels: Record<string, string> = {
    grooming: 'Dog Grooming',
    walking: 'Dog Walking',
    sitting: 'Pet Sitting',
    training: 'Dog Training',
    boarding: 'Pet Boarding',
    veterinary: 'Veterinary Care',
  };

  const serviceTypeIcons: Record<string, string> = {
    grooming: '✂️',
    walking: '🚶',
    sitting: '🏠',
    training: '🎓',
    boarding: '🏨',
    veterinary: '🏥',
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-blue-100 text-blue-800 border-yellow-300';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending': return 'Waiting for provider response';
      case 'accepted': return 'Service confirmed';
      case 'rejected': return 'Request declined by provider';
      case 'completed': return 'Service completed';
      default: return '';
    }
  };

  const BookingCard = ({ booking }: { booking: UserBooking }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">
              {serviceTypeIcons[booking.provider.service_type] || '🐕'}
            </div>
            
            <div>
              <h3 className="font-semibold text-lg">
                {serviceTypeLabels[booking.provider.service_type] || booking.provider.service_type}
              </h3>
              <p className="text-sm text-muted-foreground">
                with {booking.user.full_name}
              </p>
            </div>
          </div>

          <Badge className={getStatusColor(booking.status)}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Service Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{new Date(booking.service_date).toLocaleDateString()}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{booking.duration_hours} hours</span>
          </div>
          
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">${booking.total_price}</span>
          </div>
          
          {booking.provider.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{booking.provider.location}</span>
            </div>
          )}
        </div>

        {/* Status Message */}
        <div className="bg-muted p-3 rounded-lg">
          <p className="text-sm font-medium">{getStatusMessage(booking.status)}</p>
          {booking.status === 'pending' && (
            <p className="text-xs text-muted-foreground mt-1">
              You'll be notified when the provider responds to your request.
            </p>
          )}
        </div>

        {/* Special Instructions */}
        {booking.special_instructions && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-sm font-medium mb-1">Your Instructions:</p>
            <p className="text-sm text-blue-700">{booking.special_instructions}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => window.open(`/messages?user=${booking.user.id}`, '_blank')}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Contact Provider
          </Button>

          {booking.status === 'completed' && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(`/reviews/service/${booking.id}`, '_blank')}
            >
              <Star className="w-4 h-4 mr-2" />
              Leave Review
            </Button>
          )}
        </div>

        {/* Booking Date */}
        <div className="text-xs text-muted-foreground border-t pt-2">
          Booked on {new Date(booking.created_at).toLocaleDateString()}
          {booking.updated_at !== booking.created_at && (
            <span> • Updated {new Date(booking.updated_at).toLocaleDateString()}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">My Bookings</h1>
            <p className="text-muted-foreground">Loading your service bookings...</p>
          </div>
          
          <div className="grid gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-16 bg-muted rounded mb-4"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const pendingBookings = bookings.filter((b: UserBooking) => b.status === 'pending');
  const activeBookings = bookings.filter((b: UserBooking) => ['accepted'].includes(b.status));
  const completedBookings = bookings.filter((b: UserBooking) => b.status === 'completed');

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-3xl font-bold">My Bookings</h1>
        <p className="text-muted-foreground">
          Track your pet service bookings and connect with providers
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{pendingBookings.length}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{activeBookings.length}</div>
            <div className="text-sm text-muted-foreground">Confirmed</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{completedBookings.length}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{bookings.length}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
      </div>

      {/* Notice */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-8">
        <p className="text-blue-900 text-sm">
          <strong>Service Notice:</strong> All providers on our platform are verified. 
          You can contact providers directly through our messaging system for any questions.
        </p>
      </div>

      {/* Bookings List */}
      {bookings.length > 0 ? (
        <div className="grid gap-6">
          {bookings.map((booking: UserBooking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🐕</div>
          <h3 className="text-xl font-semibold mb-2">No Bookings Yet</h3>
          <p className="text-muted-foreground mb-4">
            Start booking pet services to see your reservations here.
          </p>
          <Button onClick={() => window.open('/marketplace', '_blank')}>
            Browse Services
          </Button>
        </div>
      )}
    </div>
  );
}

export default UserBookings;