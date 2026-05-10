import { getServiceCategoryLabel } from '@shared/serviceCategories';
import { VerificationStatusBadge } from './VerificationStatusBadge';

interface ServiceBadgeProps {
  serviceType: string;
  verified: boolean;
  className?: string;
}

/** Public listing badge: only renders for verified services. */
export function ServiceBadge({ serviceType, verified, className }: ServiceBadgeProps) {
  if (!verified) return null;
  return (
    <VerificationStatusBadge
      status="verified"
      serviceLabel={getServiceCategoryLabel(serviceType)}
      className={className}
    />
  );
}
