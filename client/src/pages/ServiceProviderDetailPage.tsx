import React, { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Loader2, MapPin, MessageCircle, Dog, Truck, Shield, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getServiceCategoryLabel, formatStudMethod, formatTransportType } from '@shared/serviceCategories';
import { getServiceVerificationInfo } from '@shared/serviceVerification';
import { verificationBadgeClasses } from '@/lib/serviceVerificationStyles';
import { startProviderConversation } from '@/lib/serviceProviderContact';
import { BookServiceModal } from '@/components/BookServiceModal';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import WhelpingWaitlistDialog from '@/components/services/WhelpingWaitlistDialog';
import type { PetServiceProvider } from '@shared/schema';

type ProviderDetail = {
  id: string;
  user_id: string;
  service_type: string;
  bio: string | null;
  price: string | null;
  availability: string | null;
  location: string | null;
  dog_name: string | null;
  breed: string | null;
  age: string | null;
  stud_method: string | null;
  images: string[] | null;
  transport_type: string | null;
  vehicle_type: string | null;
  max_distance: string | null;
  created_at: string | null;
  is_verified?: boolean | null;
  user?: {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    verified: boolean | null;
  };
};

export default function ServiceProviderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { requireAuth } = useRequireAuth();
  const [contactLoading, setContactLoading] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['service-provider-detail', id],
    queryFn: async () => {
      const res = await apiRequest(`/api/services/provider/${id}`);
      const payload = res as { data?: ProviderDetail };
      if (!payload?.data) throw new Error('Not found');
      return payload.data as ProviderDetail;
    },
    enabled: !!id,
  });

  const isStud = data?.service_type === 'stud_services';
  const isWhelping = data?.service_type === 'whelping';
  const isTransport = data?.service_type === 'transportation';

  const bookingProvider = useMemo((): (PetServiceProvider & {
    user?: { id: string; full_name: string; username: string; avatar_url?: string };
  }) | null => {
    if (!data) return null;
    return {
      ...(data as unknown as PetServiceProvider),
      user: data.user
        ? {
            id: data.user.id,
            full_name: data.user.full_name || '',
            username: data.user.username || '',
            avatar_url: data.user.avatar_url || undefined,
          }
        : undefined,
    };
  }, [data]);

  const isOwnListing = Boolean(user?.id && data?.user_id && user.id === data.user_id);

  const handleBookClick = () => {
    requireAuth(() => setBookOpen(true));
  };

  const handleWhelpingWaitlistClick = () => {
    requireAuth(() => setWaitlistOpen(true));
  };

  const handleContactOwner = async () => {
    if (!user) {
      requireAuth(() => {
        // After auth, user can return and continue messaging flow from this listing.
      });
      return;
    }
    if (!data?.user_id) return;
    if (user.id === data.user_id) {
      toast({
        title: 'Cannot message yourself',
        description: 'This is your listing.',
        variant: 'destructive',
      });
      return;
    }

    setContactLoading(true);
    try {
      const convId = await startProviderConversation(data.user_id);
      if (convId) {
        navigate(`/messages/${convId}`);
      } else {
        toast({
          title: 'Messaging unavailable',
          description: 'Could not start a conversation.',
          variant: 'destructive',
        });
      }
    } catch (e: any) {
      toast({
        title: 'Messaging failed',
        description: e?.message || 'Try again later.',
        variant: 'destructive',
      });
    } finally {
      setContactLoading(false);
    }
  };

  if (isLoading || !id) {
    return (
      <div className="mx-auto flex min-h-[40vh] max-w-3xl flex-col items-center justify-center gap-3 px-4 py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
        <p className="text-sm text-muted-foreground">Loading listing…</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] text-center">
        <p className="text-lg font-medium">Provider not found</p>
        <p className="mt-2 text-sm text-muted-foreground">
          This listing may have been removed or is temporarily unavailable.
        </p>
        <div className="mt-4 flex flex-col items-center justify-center gap-2 sm:flex-row">
          <Button asChild variant="outline" className="min-h-11">
            <Link to="/marketplace">Back to marketplace</Link>
          </Button>
          <Button type="button" className="min-h-11" onClick={() => window.location.reload()}>
            Retry loading
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] pt-4 sm:px-6">
      <Button
        variant="ghost"
        size="sm"
        type="button"
        onClick={() => navigate(-1)}
        className="-ml-2 gap-2 transition-colors duration-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <div className="rounded-xl border border-slate-200/90 bg-slate-50/90 px-4 py-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
        Book and message through Paws for safer records and support if anything goes wrong.{' '}
        <Link to="/marketplace" className="font-medium underline underline-offset-2">
          Browse more providers
        </Link>
        .
      </div>

      <Card className="overflow-hidden border-slate-200/90 shadow-sm dark:border-slate-800">
        <CardContent className="p-5 sm:p-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <Avatar className="h-24 w-24 border-2 border-border">
          <AvatarImage src={data.user?.avatar_url || undefined} alt={data.user?.full_name || ''} />
          <AvatarFallback>
            {isStud ? (
              <Dog className="h-10 w-10" />
            ) : isTransport ? (
              <Truck className="h-10 w-10" />
            ) : (
              data.user?.full_name?.charAt(0) || 'P'
            )}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{getServiceCategoryLabel(data.service_type)}</Badge>
            {data.is_verified && (
              <Badge
                variant="secondary"
                className={
                  'border ' +
                  verificationBadgeClasses(getServiceVerificationInfo(data.service_type).badgeVariant)
                }
              >
                <Shield className="mr-1 h-3 w-3" aria-hidden />
                {getServiceVerificationInfo(data.service_type).badgeLabel}
              </Badge>
            )}
            {data.user?.verified && <Badge variant="outline">Verified user</Badge>}
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isStud && data.dog_name
              ? data.dog_name
              : data.user?.full_name || 'Service provider'}
          </h1>
          {isStud && data.user?.full_name && (
            <p className="text-muted-foreground">Owner: {data.user.full_name}</p>
          )}
          {data.location && (
            <p className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              {data.location}
            </p>
          )}
          {data.price != null && (
            <p className="text-lg font-semibold">
              ${String(data.price)}
              {isStud ? ' stud fee' : isTransport ? ' estimate' : ' / hour'}
            </p>
          )}
          {data.created_at && (
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Listed {new Date(data.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
            </p>
          )}
        </div>
      </div>
        </CardContent>
      </Card>

      {isStud && (
        <Card className="border-blue-200 bg-blue-50/90">
          <CardContent className="pt-6 text-sm text-slate-900">
            <strong>Disclaimer:</strong> Users are responsible for verifying health and breeding agreements. Pup
            Connect does not guarantee pedigree, health testing, or contract terms.
          </CardContent>
        </Card>
      )}

      {isTransport && (
        <Card className="border-sky-200 bg-sky-50/80">
          <CardContent className="pt-6 text-sm text-sky-950">
            <strong>Safety note:</strong> Users are responsible for verifying safety and transport conditions. Pup
            Connect does not vet vehicles, drivers, or routes.
          </CardContent>
        </Card>
      )}

      {isWhelping && (
        <Card className="border-rose-200 bg-rose-50/90">
          <CardContent className="pt-6 text-sm text-rose-950">
            <strong>High caution:</strong> Whelping is application-only with strict anti-theft, welfare, and legal
            controls. Direct booking is disabled. Waitlist deposits are monitored and policy violations can result in
            immediate removal.
          </CardContent>
        </Card>
      )}

      {isTransport && (
        <Card>
          <CardContent className="pt-6 space-y-3">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Transport details
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {data.transport_type && (
                <>
                  <dt className="text-muted-foreground">Service type</dt>
                  <dd className="font-medium">{formatTransportType(data.transport_type)}</dd>
                </>
              )}
              {data.vehicle_type && (
                <>
                  <dt className="text-muted-foreground">Vehicle</dt>
                  <dd className="font-medium">{data.vehicle_type}</dd>
                </>
              )}
              {data.max_distance && (
                <>
                  <dt className="text-muted-foreground">Max distance</dt>
                  <dd className="font-medium">{data.max_distance}</dd>
                </>
              )}
            </dl>
          </CardContent>
        </Card>
      )}

      {isStud && (
        <Card>
          <CardContent className="pt-6 space-y-3">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Dog className="h-5 w-5" />
              Dog details
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {data.dog_name && (
                <>
                  <dt className="text-muted-foreground">Dog name</dt>
                  <dd className="font-medium">{data.dog_name}</dd>
                </>
              )}
              {data.breed && (
                <>
                  <dt className="text-muted-foreground">Breed</dt>
                  <dd className="font-medium">{data.breed}</dd>
                </>
              )}
              {data.age && (
                <>
                  <dt className="text-muted-foreground">Age</dt>
                  <dd className="font-medium">{data.age}</dd>
                </>
              )}
              {data.stud_method && (
                <>
                  <dt className="text-muted-foreground">Method</dt>
                  <dd className="font-medium">{formatStudMethod(data.stud_method)}</dd>
                </>
              )}
            </dl>
          </CardContent>
        </Card>
      )}

      {data.images && data.images.length > 0 && (
        <div>
          <h2 className="font-semibold text-lg mb-3">Photos</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {data.images.map((url, i) => (
              <a
                key={`${url}-${i}`}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="aspect-square rounded-lg overflow-hidden border bg-muted"
              >
                <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
              </a>
            ))}
          </div>
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          <h2 className="font-semibold text-lg mb-2">Description</h2>
          <p className="text-muted-foreground whitespace-pre-wrap">{data.bio || 'No description provided.'}</p>
          {data.availability && (
            <p className="mt-4 text-sm">
              <span className="font-medium text-foreground">Availability: </span>
              {data.availability}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {!isOwnListing && !isWhelping && (
          <Button
            type="button"
            onClick={handleBookClick}
            className="min-h-11 w-full gap-2 font-semibold sm:w-auto sm:min-w-[10rem]"
          >
            Book service
          </Button>
        )}
        {!isOwnListing && isWhelping && (
          <Button
            type="button"
            onClick={handleWhelpingWaitlistClick}
            className="min-h-11 w-full gap-2 font-semibold sm:w-auto sm:min-w-[12rem]"
          >
            Apply for waitlist
          </Button>
        )}
        {!isOwnListing && (
          <Button
            type="button"
            variant="outline"
            onClick={handleContactOwner}
            disabled={contactLoading}
            className="min-h-11 w-full gap-2 font-semibold sm:w-auto sm:min-w-[10rem]"
          >
            {contactLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MessageCircle className="h-4 w-4" />
            )}
            {isTransport ? 'Message provider' : 'Message'}
          </Button>
        )}
        {isOwnListing && (
          <Button asChild className="min-h-11 w-full gap-2 font-semibold sm:w-auto sm:min-w-[10rem]">
            <Link to="/dashboard/provider">Manage bookings</Link>
          </Button>
        )}
        {data.user?.id && (
          <Button variant="outline" asChild className="min-h-11 w-full font-semibold sm:w-auto">
            <Link to={`/profile/${data.user.id}`}>Full profile</Link>
          </Button>
        )}
      </div>

      {bookingProvider && (
        <BookServiceModal provider={bookingProvider} open={bookOpen} onClose={() => setBookOpen(false)} />
      )}
      {data?.id && (
        <WhelpingWaitlistDialog providerId={data.id} open={waitlistOpen} onClose={() => setWaitlistOpen(false)} />
      )}
    </div>
  );
}
