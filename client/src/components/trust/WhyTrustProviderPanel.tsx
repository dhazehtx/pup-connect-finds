import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BadgeCheck, Shield, Star } from 'lucide-react';
import { UserTrustActions } from '@/components/trust/UserTrustActions';

export type SellerTrust = {
  id: string;
  full_name?: string | null;
  username?: string | null;
  avatar_url?: string | null;
  verified?: boolean;
  rating?: number | null;
  total_reviews?: number | null;
  user_type?: string | null;
};

type Props = {
  seller: SellerTrust;
};

/**
 * “Why trust this provider?” — listing detail module before booking.
 */
export function WhyTrustProviderPanel({ seller }: Props) {
  if (!seller?.id) return null;

  const label = seller.full_name?.trim() || seller.username || 'this seller';
  const reviews = seller.total_reviews ?? 0;
  const rating = Number(seller.rating) || 0;
  const verified = !!seller.verified;

  return (
    <Card className="border-blue-100/90 bg-gradient-to-br from-blue-50/50 via-white to-slate-50/80 shadow-sm dark:border-blue-900/35 dark:from-blue-950/25 dark:via-slate-950 dark:to-slate-900/80">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-slate-900 dark:text-slate-50">
          <Shield className="h-5 w-5 text-blue-600" aria-hidden />
          Why trust this provider?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
        <div className="flex flex-wrap items-start gap-3">
          {verified ? (
            <Badge className="gap-1 border-blue-200 bg-blue-600 text-white hover:bg-blue-600">
              <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
              Verified by Paws
            </Badge>
          ) : (
            <Badge variant="outline" className="font-normal text-slate-600 dark:text-slate-400">
              Not verified yet
            </Badge>
          )}
          <p className="min-w-0 flex-1 text-xs leading-relaxed">
            {verified ? (
              <>
                We&apos;ve checked this seller&apos;s credentials for this platform. Verification helps reduce scams but
                isn&apos;t a guarantee — always review listings carefully and keep chat on Paws.
              </>
            ) : (
              <>
                This seller hasn&apos;t completed verification. That&apos;s OK for many honest breeders and fosters — ask
                questions, request references, and meet safely before paying.
              </>
            )}
          </p>
        </div>

        {(reviews > 0 || rating > 0) && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Star className="h-4 w-4 text-amber-500" aria-hidden />
            <span className="font-semibold tabular-nums text-slate-900 dark:text-slate-100">
              {rating >= 1 ? rating.toFixed(1) : '—'} / 5
            </span>
            <span className="text-slate-600 dark:text-slate-400">
              {reviews} review{reviews === 1 ? '' : 's'} · see their profile for details
            </span>
          </div>
        )}

        <ul className="list-inside list-disc space-y-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
          <li>Use Paws messages first — it helps if you need support later.</li>
          <li>Meet in person or video call before a large deposit when possible.</li>
          <li>Report suspicious listings or pressure tactics — we review every report.</li>
        </ul>

        <div className="flex flex-col gap-3 border-t border-slate-200/80 pt-4 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
          <Button asChild variant="link" className="h-auto justify-start p-0 text-blue-700 dark:text-blue-400">
            <Link to={`/profile/${seller.id}`}>View full profile &amp; reviews</Link>
          </Button>
          <UserTrustActions targetUserId={seller.id} targetLabel={label} variant="compact" />
        </div>
      </CardContent>
    </Card>
  );
}
