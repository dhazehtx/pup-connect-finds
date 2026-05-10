import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle2, Clock3, AlertCircle } from 'lucide-react';

type VerificationStatus = 'pending' | 'approved' | 'verified' | 'rejected';

interface VerificationStatusBadgeProps {
  status: VerificationStatus;
  serviceLabel: string;
  className?: string;
}

export function VerificationStatusBadge({
  status,
  serviceLabel,
  className,
}: VerificationStatusBadgeProps) {
  if (status === 'approved' || status === 'verified') {
    return (
      <Badge
        className={cn(
          'border border-blue-400/70 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold',
          'shadow-[0_0_0_1px_rgba(59,130,246,0.25),0_8px_20px_-12px_rgba(37,99,235,0.75)]',
          'transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_0_1px_rgba(59,130,246,0.35),0_12px_24px_-12px_rgba(37,99,235,0.85)]',
          className,
        )}
      >
        <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
        {`Verified ${serviceLabel}`}
      </Badge>
    );
  }

  if (status === 'rejected') {
    return (
      <Badge
        variant="secondary"
        className={cn(
          'border border-red-200 bg-red-50 text-red-700 font-medium',
          className,
        )}
      >
        <AlertCircle className="mr-1 h-3.5 w-3.5" />
        Verification Required
      </Badge>
    );
  }

  return (
    <Badge
      variant="secondary"
      className={cn(
        'border border-slate-200 bg-slate-100 text-slate-700 font-medium',
        className,
      )}
    >
      <Clock3 className="mr-1 h-3.5 w-3.5" />
      Pending Verification
    </Badge>
  );
}
