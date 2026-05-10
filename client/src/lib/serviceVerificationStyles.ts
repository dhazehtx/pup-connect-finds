import type { VerificationBadgeVariant } from '@shared/serviceVerification';

/** Tailwind classes for verified listing badges (per service type). */
export function verificationBadgeClasses(variant: VerificationBadgeVariant): string {
  const map: Record<VerificationBadgeVariant, string> = {
    emerald: 'bg-emerald-50 text-emerald-900 border-emerald-200/80',
    sky: 'bg-sky-50 text-sky-900 border-sky-200/80',
    violet: 'bg-violet-50 text-violet-900 border-violet-200/80',
    orange: 'bg-orange-50 text-orange-900 border-orange-200/80',
    rose: 'bg-rose-50 text-rose-900 border-rose-200/80',
    cyan: 'bg-cyan-50 text-cyan-900 border-cyan-200/80',
    indigo: 'bg-indigo-50 text-indigo-900 border-indigo-200/80',
    slate: 'bg-slate-50 text-slate-900 border-slate-200/80',
  };
  return map[variant] ?? map.slate;
}

/** Preview pill in BecomeProviderModal Step 2 */
export function verificationPreviewClasses(variant: VerificationBadgeVariant): string {
  return verificationBadgeClasses(variant) + ' shadow-sm';
}
