import { AlertTriangle } from 'lucide-react';
import { Link } from 'wouter';

interface RiskDisclaimerProps {
  variant?: 'stripe' | 'booking' | 'general';
  className?: string;
}

export function RiskDisclaimer({ variant = 'general', className = '' }: RiskDisclaimerProps) {
  const getContent = () => {
    switch (variant) {
      case 'stripe':
        return {
          title: 'Payment Service Agreement',
          message: 'My Pup is a marketplace that connects pet owners and independent providers. We do not provide pet services, supervise users, or guarantee safety/insurance. By continuing with Stripe Connect, you acknowledge animal-related risks and agree that services are at your own risk between you and the other party.',
        };
      case 'booking':
        return {
          title: 'Booking Risk Acknowledgment',
          message: 'My Pup is a marketplace that connects pet owners and independent providers. We do not provide pet services, supervise users, or guarantee safety/insurance. By booking, you acknowledge animal-related risks and agree that services are at your own risk between you and the provider.',
        };
      case 'general':
      default:
        return {
          title: 'Service Agreement',
          message: 'My Pup is a marketplace that connects pet owners and independent providers. We do not provide pet services, supervise users, or guarantee safety/insurance. By continuing, you acknowledge animal-related risks and agree that services are at your own risk between you and the other party.',
        };
    }
  };

  const content = getContent();

  return (
    <div className={`rounded-lg border border-amber-200 bg-amber-50 p-4 ${className}`} data-testid="disclaimer-risk">
      <div className="flex gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-sm text-amber-900 mb-1">{content.title}</h4>
          <p className="text-sm text-amber-800 leading-relaxed">
            {content.message}{' '}
            <Link href="/legal/terms" className="underline hover:text-amber-900 font-medium">
              See our Terms
            </Link>
            {' for release, indemnity, arbitration, and limits on liability.'}
          </p>
        </div>
      </div>
    </div>
  );
}
