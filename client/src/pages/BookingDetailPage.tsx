import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/queryClient';

const BookingDetailPage = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['/api/bookings', bookingId],
    queryFn: async () => {
      if (!bookingId) return null;
      return apiRequest(`/api/bookings/${bookingId}`);
    },
    enabled: !!bookingId,
  });

  if (isLoading) {
    return <div className="p-6">Loading booking...</div>;
  }

  if (!data) {
    return (
      <div className="p-6">
        <p className="mb-4 text-muted-foreground">Booking not found.</p>
        <Button onClick={() => navigate('/bookings')}>Back to bookings</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Booking Detail</span>
            <Badge>{data.status}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.provider ? (
            <p>
              <strong>Provider:</strong> {data.provider.full_name || data.provider.username || 'Provider'}
            </p>
          ) : null}
          {data.user ? (
            <p>
              <strong>User:</strong> {data.user.full_name || data.user.username || 'User'}
            </p>
          ) : null}
          <p><strong>Date:</strong> {data.booking_date}</p>
          <p><strong>Time:</strong> {String(data.booking_time || '').slice(0, 5)}</p>
          {data.notes ? <p><strong>Notes:</strong> {data.notes}</p> : null}
          <p className="text-sm text-muted-foreground">
            Created {new Date(data.created_at).toLocaleString()}
          </p>
          <Button variant="outline" onClick={() => navigate('/bookings')}>
            Back to bookings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingDetailPage;
