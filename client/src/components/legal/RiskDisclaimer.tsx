import { Link } from 'react-router-dom';

interface RiskDisclaimerProps {
  variant?: 'stripe' | 'booking' | 'general';
  className?: string;
}

export function RiskDisclaimer({ variant = 'general', className = '' }: RiskDisclaimerProps) {
  const getContent = () => {
    switch (variant) {
      case 'stripe':
        return (
          <>
            PAWS is a marketplace. We don&apos;t provide pet services or insurance and don&apos;t supervise users.
            By continuing, you accept animal-related risks and agree services are between you and the other party.
            See our <Link to="/legal/terms" className="underline hover:text-gray-700">Terms</Link> (release, indemnity, arbitration)
            and <Link to="/legal/privacy" className="underline hover:text-gray-700">Privacy</Link>.
          </>
        );
      case 'booking':
        return (
          <>
            Services are provided by independent users, not PAWS.
            You assume animal-related risks and agree disputes are between the parties.
            See our <Link to="/legal/terms" className="underline hover:text-gray-700">Terms</Link> and{' '}
            <Link to="/legal/privacy" className="underline hover:text-gray-700">Privacy</Link>.
          </>
        );
      case 'general':
      default:
        return (
          <>
            Services are provided by independent users, not PAWS.
            You assume animal-related risks and agree disputes are between the parties.
            See our <Link to="/legal/terms" className="underline hover:text-gray-700">Terms</Link> and{' '}
            <Link to="/legal/privacy" className="underline hover:text-gray-700">Privacy</Link>.
          </>
        );
    }
  };

  return (
    <p className={`text-xs text-gray-500 leading-relaxed ${className}`} data-testid="disclaimer-risk">
      {getContent()}
    </p>
  );
}
