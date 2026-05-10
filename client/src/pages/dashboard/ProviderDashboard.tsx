import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, DollarSign, User, CheckCircle, XCircle, Star, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface Booking {
  id: string;
  service_date: string;
  duration_hours: string;
  total_price: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  special_instructions?: string;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
  };
  provider: {
    id: string;
    service_type: string;
  };
}

function ProviderDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('pending');

  const { data: bookings = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/services/bookings/provider', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/services/bookings/provider/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch bookings');
      
      const result = await response.json();
      return result.data || [];
    },
    enabled: !!user?.id,
  });

  const updateBookingStatus = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: string }) => {
      return apiRequest(`/api/services/bookings/${bookingId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: (_, { status }) => {
      toast({
        title: "Booking Updated",
        description: `Booking has been ${status}.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/services/bookings/provider'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update booking status.",
        variant: "destructive",
      });
    },
  });

  const serviceTypeLabels: Record<string, string> = {
    grooming: 'Dog Grooming',
    walking: 'Dog Walking',
    sitting: 'Pet Sitting',
    training: 'Dog Training',
    boarding: 'Pet Boarding',
    whelping: 'Whelping Care',
    veterinary: 'Veterinary Care',
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const BookingCard = ({ booking }: { booking: Booking }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={booking.user.avatar_url} alt={booking.user.full_name} />
              <AvatarFallback>
                {booking.user.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h3 className="font-semibold">{booking.user.full_name}</h3>
              <p className="text-sm text-muted-foreground">@{booking.user.username}</p>
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
          
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-muted-foreground" />
            <span>{serviceTypeLabels[booking.provider.service_type] || booking.provider.service_type}</span>
          </div>
        </div>

        {/* Special Instructions */}
        {booking.special_instructions && (
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm font-medium mb-1">Special Instructions:</p>
            <p className="text-sm text-muted-foreground">{booking.special_instructions}</p>
          </div>
        )}

        {/* Action Buttons */}
        {booking.status === 'pending' && (
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => updateBookingStatus.mutate({ bookingId: booking.id, status: 'accepted' })}
              disabled={updateBookingStatus.isPending}
              className="min-h-11 flex-1 bg-green-600 hover:bg-green-700"
              size="sm"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Accept
            </Button>
            
            <Button
              onClick={() => updateBookingStatus.mutate({ bookingId: booking.id, status: 'rejected' })}
              disabled={updateBookingStatus.isPending}
              variant="destructive"
              className="min-h-11 flex-1"
              size="sm"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </div>
        )}

        {booking.status === 'accepted' && (
          <Button
            onClick={() => updateBookingStatus.mutate({ bookingId: booking.id, status: 'completed' })}
            disabled={updateBookingStatus.isPending}
            className="min-h-11 w-full"
            size="sm"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark as Completed
          </Button>
        )}

        {/* Contact Button */}
        <Button 
          variant="outline" 
          size="sm" 
          className="min-h-11 w-full"
          onClick={() => navigate(`/messages?user=${booking.user.id}`)}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Contact Client
        </Button>

        {/* Booking Date */}
        <div className="text-xs text-muted-foreground border-t pt-2">
          Requested on {new Date(booking.created_at).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Provider Dashboard</h1>
            <p className="text-muted-foreground">Loading your bookings...</p>
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

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-xl rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <h1 className="text-xl font-semibold text-red-900">Could not load provider bookings</h1>
          <p className="mt-2 text-sm text-red-800">
            Please try again. If this keeps failing, refresh your session and retry.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button className="min-h-11" onClick={() => void refetch()}>
              Try again
            </Button>
            <Button variant="outline" className="min-h-11" onClick={() => navigate('/marketplace')}>
              Go to marketplace
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const pendingBookings = bookings.filter((b: Booking) => b.status === 'pending');
  const activeBookings = bookings.filter((b: Booking) => b.status === 'accepted');
  const completedBookings = bookings.filter((b: Booking) => b.status === 'completed');
  const rejectedBookings = bookings.filter((b: Booking) => b.status === 'rejected');

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-3xl font-bold">Provider Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your service bookings and connect with clients
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{pendingBookings.length}</div>
            <div className="text-sm text-muted-foreground">Pending Requests</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{activeBookings.length}</div>
            <div className="text-sm text-muted-foreground">Active Bookings</div>
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
            <div className="text-sm text-muted-foreground">Total Bookings</div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">
            Pending ({pendingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Active ({activeBookings.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedBookings.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All ({bookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingBookings.length > 0 ? (
            <div className="grid gap-6">
              {pendingBookings.map((booking: Booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold mb-2">No Pending Requests</h3>
              <p className="text-muted-foreground">
                New booking requests will appear here for you to review.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {activeBookings.length > 0 ? (
            <div className="grid gap-6">
              {activeBookings.map((booking: Booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🐕</div>
              <h3 className="text-xl font-semibold mb-2">No Active Bookings</h3>
              <p className="text-muted-foreground">
                Accepted bookings will show here for you to manage.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedBookings.length > 0 ? (
            <div className="grid gap-6">
              {completedBookings.map((booking: Booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-semibold mb-2">No Completed Services</h3>
              <p className="text-muted-foreground">
                Completed service bookings will be listed here.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {bookings.length > 0 ? (
            <div className="grid gap-6">
              {bookings.map((booking: Booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold mb-2">No Bookings Yet</h3>
              <p className="text-muted-foreground">
                Your service bookings will appear here once clients start booking.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProviderDashboard;