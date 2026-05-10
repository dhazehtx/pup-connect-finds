import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiRequest } from '@/lib/api';
import { Briefcase, MapPin } from 'lucide-react';
import { getServiceCategoryLabel } from '@shared/serviceCategories';
import { VerificationStatusBadge } from '@/components/badges/VerificationStatusBadge';
import LoadingState from '@/components/ui/loading-state';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ServiceRow = {
  id: string;
  service_type: string;
  bio: string | null;
  price: string | number | null;
  location: string | null;
  service_verified: boolean;
  review_status: string;
};

export function ProfileServicesTab({
  userId,
  isOwnProfile,
}: {
  userId: string;
  isOwnProfile: boolean;
}) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['profile-services-tab', userId],
    queryFn: async () => {
      const res = (await apiRequest(`/api/services/profile/${userId}`)) as {
        success?: boolean;
        data?: ServiceRow[];
      };
      return res?.data?.filter(Boolean) ?? [];
    },
    enabled: Boolean(userId),
  });

  if (isLoading) {
    return <LoadingState message="Loading services…" />;
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 px-6 py-12 text-center text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
        Could not load services. Try again later.
      </div>
    );
  }

  const rows = data ?? [];

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-b from-slate-50/95 to-white px-6 py-14 text-center shadow-sm dark:border-slate-800 dark:from-slate-950/80 dark:to-slate-900/60">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100/90 text-blue-700 shadow-inner dark:bg-blue-950/60 dark:text-blue-300">
          <Briefcase className="h-8 w-8" strokeWidth={1.75} aria-hidden />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">No services listed yet</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {isOwnProfile
            ? 'Offer walks, grooming, training, and more — get verified and show up in search.'
            : 'This member has not published pet services on Paws yet.'}
        </p>
        {isOwnProfile && (
          <Button asChild className="mt-6 font-semibold shadow-sm" size="lg">
            <Link to="/services">Explore services</Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li
          key={row.id}
          className={cn(
            'rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-sm transition dark:border-slate-800 dark:bg-slate-950/50',
            'hover:border-blue-200/80 hover:shadow-md dark:hover:border-blue-900/50',
          )}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1">
              <p className="text-base font-semibold text-slate-900 dark:text-slate-50">
                {getServiceCategoryLabel(row.service_type)}
              </p>
              {row.location ? (
                <p className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-blue-600" aria-hidden />
                  {row.location}
                </p>
              ) : null}
              {row.bio ? (
                <p className="line-clamp-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">{row.bio}</p>
              ) : null}
              {row.price != null && String(row.price).trim() !== '' ? (
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{String(row.price)}</p>
              ) : null}
            </div>
            <div className="shrink-0">
              <VerificationStatusBadge
                status={
                  row.service_verified ? 'verified' : row.review_status === 'rejected' ? 'rejected' : 'pending'
                }
                serviceLabel={getServiceCategoryLabel(row.service_type)}
                className="text-xs"
              />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
