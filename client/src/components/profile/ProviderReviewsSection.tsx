import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Star } from 'lucide-react';
import { useMemo, useState } from 'react';

type ReviewRow = {
  id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
};

type ProviderReviewsResponse = {
  success?: boolean;
  averageRating: number;
  reviewCount: number;
  reviews: ReviewRow[];
};

type EligibleBooking = {
  id: string;
  booking_date: string;
  booking_time: string;
  status: string;
};

function StarsDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-4 w-4 ${n <= rating ? 'fill-blue-500 text-blue-500' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );
}

interface Props {
  providerId: string;
  isCurrentUser: boolean;
}

export function ProviderReviewsSection({ providerId, isCurrentUser }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [bookingId, setBookingId] = useState<string>('');

  const { data, isLoading } = useQuery({
    queryKey: ['/api/reviews/provider', providerId],
    queryFn: async () => {
      const res = await fetch(`/api/reviews/provider/${providerId}`);
      if (!res.ok) throw new Error('Failed to load reviews');
      return res.json() as Promise<ProviderReviewsResponse>;
    },
  });

  const { data: eligibleData } = useQuery({
    queryKey: ['/api/reviews/provider', providerId, 'eligible-bookings'],
    enabled: Boolean(user?.id && !isCurrentUser && providerId),
    queryFn: async () => {
      const raw = await apiRequest(`/api/reviews/provider/${providerId}/eligible-bookings`);
      return raw as { eligible?: EligibleBooking[] };
    },
  });

  const eligible = eligibleData?.eligible ?? [];

  const canLeaveReview = Boolean(
    user?.id && !isCurrentUser && eligible.length > 0,
  );

  const mutation = useMutation({
    mutationFn: async () => {
      if (!bookingId) {
        throw new Error('Pick a booking');
      }
      return apiRequest('/api/reviews', {
        method: 'POST',
        body: {
          provider_id: providerId,
          booking_id: bookingId,
          rating,
          comment: comment.trim() || null,
        },
      });
    },
    onSuccess: () => {
      toast({ title: 'Review submitted' });
      setComment('');
      queryClient.invalidateQueries({ queryKey: ['/api/reviews/provider', providerId] });
      queryClient.invalidateQueries({ queryKey: ['/api/reviews/provider', providerId, 'eligible-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/profiles'] });
    },
    onError: (e: Error) => {
      toast({
        title: 'Could not submit',
        description: e.message || 'Try again',
        variant: 'destructive',
      });
    },
  });

  const reviews = data?.reviews ?? [];
  const avg = data?.averageRating ?? 0;
  const count = data?.reviewCount ?? 0;

  const reviewerLabel = useMemo(() => (r: ReviewRow) => {
    return r.reviewer?.full_name?.trim() || r.reviewer?.username || 'Customer';
  }, []);

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Reviews</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">Loading…</CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Service reviews</CardTitle>
        <div className="flex items-center gap-3 pt-1">
          <span className="text-2xl font-semibold tabular-nums">{avg.toFixed(1)}</span>
          <StarsDisplay rating={Math.round(avg)} />
          <span className="text-sm text-muted-foreground">
            {count} review{count !== 1 ? 's' : ''}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {canLeaveReview && (
          <div className="rounded-lg border border-dashed p-4 space-y-3 bg-muted/30">
            <p className="text-sm font-medium">Leave a review</p>
            <label className="block text-xs text-muted-foreground">Booking</label>
            <select
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
            >
              <option value="">Select a completed booking</option>
              {eligible.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.booking_date} · {String(b.booking_time).slice(0, 5)} ({b.status})
                </option>
              ))}
            </select>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  className="p-0.5 rounded hover:bg-muted"
                  onClick={() => setRating(n)}
                  aria-label={`${n} stars`}
                >
                  <Star
                    className={`h-8 w-8 ${n <= rating ? 'fill-blue-500 text-blue-500' : 'text-gray-300'}`}
                  />
                </button>
              ))}
            </div>
            <Textarea
              placeholder="Comment (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              maxLength={5000}
            />
            <Button
              type="button"
              disabled={!bookingId || mutation.isPending}
              onClick={() => mutation.mutate()}
            >
              {mutation.isPending ? 'Submitting…' : 'Submit review'}
            </Button>
          </div>
        )}

        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reviews yet.</p>
        ) : (
          <ul className="space-y-4">
            {reviews.map((r) => (
              <li key={r.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{reviewerLabel(r)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleString()}
                    </p>
                  </div>
                  <StarsDisplay rating={r.rating} />
                </div>
                {r.comment ? (
                  <p className="mt-2 text-sm text-foreground whitespace-pre-wrap">{r.comment}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
