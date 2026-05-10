import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { getServiceCategoryLabel } from '@shared/serviceCategories';
import { VerificationStatusBadge } from '@/components/badges/VerificationStatusBadge';

type Row = {
  id: string;
  service_type: string;
  service_verified: boolean;
  review_status: string;
  badge_label: string;
  badge_variant?: string;
};

export function ProfileServiceVerificationBadges({ userId }: { userId: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['profile-service-offerings', userId],
    queryFn: async () => {
      const res = await apiRequest(`/api/services/profile/${userId}`);
      return res as { success?: boolean; data?: Row[] };
    },
    enabled: Boolean(userId),
  });

  const rows = data?.data?.filter(Boolean) ?? [];
  if (isLoading || isError || rows.length === 0) return null;

  return (
    <Card className="mb-4 sm:mb-6 border-slate-200/90">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          Pet services
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-3">
          Service-specific verification badges (approved by our team).
        </p>
        <div className="flex flex-wrap gap-2">
          {rows.map((row) => (
            <div key={row.id} className="flex flex-col gap-1 min-w-[160px]">
              <span className="text-xs text-muted-foreground">
                {getServiceCategoryLabel(row.service_type)}
              </span>
              <VerificationStatusBadge
                status={row.service_verified ? 'verified' : row.review_status === 'rejected' ? 'rejected' : 'pending'}
                serviceLabel={getServiceCategoryLabel(row.service_type)}
                className="text-xs"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
