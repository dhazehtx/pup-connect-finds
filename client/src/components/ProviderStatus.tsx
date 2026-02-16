interface Provider {
  id: string;
  onboarding_status?: string;
  charges_enabled?: boolean;
  payouts_enabled?: boolean;
  requirements_due?: string[];
  stripe_account_id?: string;
}

interface ProviderStatusProps {
  provider: Provider | null;
}

export default function ProviderStatus({ provider }: ProviderStatusProps) {
  if (!provider) {
    return (
      <div className="p-4 border rounded bg-gray-50" data-testid="provider-status-empty">
        <p className="text-gray-600">No provider information available</p>
      </div>
    );
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'verified': return 'text-green-600 bg-green-50';
      case 'requires_action': return 'text-blue-600 bg-blue-50';
      case 'started': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const requirementsDue = Array.isArray(provider.requirements_due) 
    ? provider.requirements_due 
    : [];

  return (
    <div className="p-4 rounded border mb-4 bg-white" data-testid="provider-status">
      <h3 className="font-semibold mb-3">Provider Verification Status</h3>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="font-medium">Status:</span>
          <span 
            className={`px-2 py-1 rounded text-sm ${getStatusColor(provider.onboarding_status)}`}
            data-testid="onboarding-status"
          >
            {provider.onboarding_status || 'unknown'}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="font-medium">Charges Enabled:</span>
          <span data-testid="charges-enabled">
            {provider.charges_enabled ? '✅' : '❌'}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="font-medium">Payouts Enabled:</span>
          <span data-testid="payouts-enabled">
            {provider.payouts_enabled ? '✅' : '❌'}
          </span>
        </div>

        {provider.stripe_account_id && (
          <div className="flex justify-between items-center">
            <span className="font-medium">Stripe Account:</span>
            <code className="text-xs bg-gray-100 px-2 py-1 rounded" data-testid="stripe-account-id">
              {provider.stripe_account_id.substring(0, 12)}...
            </code>
          </div>
        )}

        {requirementsDue.length > 0 && (
          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
            <p className="font-medium text-blue-800">Requirements Due:</p>
            <ul className="text-sm text-blue-700 mt-1">
              {requirementsDue.map((req, index) => (
                <li key={index} className="list-disc list-inside">
                  {req}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}