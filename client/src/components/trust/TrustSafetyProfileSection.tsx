import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BadgeCheck, HeartHandshake, Shield, Star } from 'lucide-react';

type Props = {
  verified: boolean;
  rating: number;
  totalReviews: number;
  /** e.g. breeder, shelter, buyer */
  userType?: string;
  className?: string;
};

const SAFETY_TIPS = [
    'Keep payments and booking details inside Paws when possible — it helps us protect you if something goes wrong.',
    'Meet in a safe, public place for first-time pickups or handoffs.',
    'Ask for health records and ID verification before sending a deposit.',
    'Never share banking passwords or pay with gift cards or wire transfers to strangers.',
  ];

/**
 * Trust & Safety block for provider-style profiles: verified meaning, reviews summary, safety tips.
 */
export function TrustSafetyProfileSection({ verified, rating, totalReviews, userType, className }: Props) {
  const isProviderish = ['breeder', 'shelter', 'admin'].includes((userType || '').toLowerCase());
  const showReviews = totalReviews > 0 || rating > 0;
  const avg = typeof rating === 'number' ? rating : Number(rating) || 0;

  return (
    <Card className={`border-blue-100/90 bg-gradient-to-b from-blue-50/40 to-white shadow-sm dark:border-blue-900/40 dark:from-blue-950/30 dark:to-slate-950/80 ${className ?? ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-slate-900 dark:text-slate-50">
          <Shield className="h-5 w-5 shrink-0 text-blue-600" aria-hidden />
          Trust &amp; safety
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 text-sm text-slate-700 dark:text-slate-300">
        <section className="space-y-2">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            <BadgeCheck className="h-4 w-4 text-blue-600" aria-hidden />
            Verified badge
          </h3>
          {verified ? (
            <div className="rounded-xl border border-blue-200/80 bg-white/90 px-3 py-2.5 dark:border-blue-900/60 dark:bg-slate-900/50">
              <p className="font-medium text-slate-900 dark:text-slate-100">This account is verified by Paws</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Our team has reviewed this {isProviderish ? 'provider’s' : 'member’s'} identity and credentials for this
                platform. Verification reduces fraud but does not guarantee every transaction — always use good judgment.
              </p>
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-slate-200 px-3 py-2.5 text-xs leading-relaxed text-slate-600 dark:border-slate-700 dark:text-slate-400">
              This profile is not verified yet. You can still connect, but take extra care: ask questions, meet safely,
              and keep communication on Paws.
            </p>
          )}
        </section>

        {showReviews && (
          <section className="space-y-2">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <Star className="h-4 w-4 text-amber-500" aria-hidden />
              Reviews summary
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="gap-1 font-semibold tabular-nums">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" aria-hidden />
                {avg >= 1 ? avg.toFixed(1) : '—'} / 5
              </Badge>
              <span className="text-slate-600 dark:text-slate-400">
                {totalReviews} review{totalReviews === 1 ? '' : 's'} from the community
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Reviews come from bookings and completed interactions. Read individual reviews in the Reviews tab.
            </p>
          </section>
        )}

        <section className="space-y-2">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            <HeartHandshake className="h-4 w-4 text-blue-600" aria-hidden />
            Safety tips
          </h3>
          <ul className="list-inside list-disc space-y-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            {SAFETY_TIPS.map((tip) => (
              <li key={tip.slice(0, 40)}>{tip}</li>
            ))}
          </ul>
        </section>
      </CardContent>
    </Card>
  );
}
