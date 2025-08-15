import React from 'react';
import ProviderOnboard from '../services/onboarding/ProviderOnboard';

const ProviderOnboardingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Become a Provider</h1>
          <p className="text-gray-600 mt-2">Join our platform and start offering pet services to dog owners in your area</p>
        </div>
        <ProviderOnboard />
      </div>
    </div>
  );
};

export default ProviderOnboardingPage;