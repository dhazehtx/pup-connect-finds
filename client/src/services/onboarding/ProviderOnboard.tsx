import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CheckCircle, Circle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// SOL:START ProviderOnboard
interface Step {
  id: number;
  title: string;
  status: 'pending' | 'current' | 'completed';
}

interface IDVerificationState {
  status: 'idle' | 'pending' | 'passed' | 'failed' | 'loading';
  sessionId?: string;
  message?: string;
}

interface BackgroundCheckState {
  status: 'idle' | 'pending' | 'passed' | 'failed' | 'loading';
  message?: string;
}

interface PayoutSetupState {
  status: 'idle' | 'connecting' | 'connected' | 'failed' | 'loading';
  accountId?: string;
  message?: string;
}

const ProviderOnboard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [providerId, setProviderId] = useState<string | null>(null);
  const [idVerification, setIdVerification] = useState<IDVerificationState>({ status: 'idle' });
  const [backgroundCheck, setBackgroundCheck] = useState<BackgroundCheckState>({ status: 'idle' });
  const [payoutSetup, setPayoutSetup] = useState<PayoutSetupState>({ status: 'idle' });
  const [accountType, setAccountType] = useState<'individual' | 'business'>('individual');
  const [serviceDetails, setServiceDetails] = useState({
    description: '',
    pricePerService: '',
    availability: 'weekdays',
    serviceTypes: [] as string[],
    radiusKm: 10,
  });
  const { toast } = useToast();
  
  const steps: Step[] = [
    { id: 0, title: 'Welcome', status: currentStep === 0 ? 'current' : currentStep > 0 ? 'completed' : 'pending' },
    { id: 1, title: 'Basics', status: currentStep === 1 ? 'current' : currentStep > 1 ? 'completed' : 'pending' },
    { id: 2, title: 'ID', status: currentStep === 2 ? 'current' : currentStep > 2 ? 'completed' : 'pending' },
    { id: 3, title: 'Check', status: currentStep === 3 ? 'current' : currentStep > 3 ? 'completed' : 'pending' },
    { id: 4, title: 'Payout', status: currentStep === 4 ? 'current' : currentStep > 4 ? 'completed' : 'pending' },
    { id: 5, title: 'Details', status: currentStep === 5 ? 'current' : currentStep > 5 ? 'completed' : 'pending' },
    { id: 6, title: 'Terms', status: currentStep === 6 ? 'current' : currentStep > 6 ? 'completed' : 'pending' },
    { id: 7, title: 'Review', status: currentStep === 7 ? 'current' : currentStep > 7 ? 'completed' : 'pending' },
  ];

  const handleNext = () => {
    // Check if current step requirements are met
    if (currentStep === 2 && idVerification.status !== 'passed') {
      toast({
        title: "Verification Required",
        description: "Please complete ID verification before proceeding.",
        variant: "destructive",
      });
      return;
    }

    if (currentStep === 3 && backgroundCheck.status !== 'passed') {
      toast({
        title: "Background Check Required",
        description: "Please wait for background check to complete before proceeding.",
        variant: "destructive",
      });
      return;
    }

    if (currentStep === 4 && payoutSetup.status !== 'connected') {
      toast({
        title: "Payout Setup Required",
        description: "Please complete Stripe Connect setup before proceeding.",
        variant: "destructive",
      });
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStartIDVerification = async () => {
    if (!providerId) {
      toast({
        title: "Error",
        description: "Provider ID not found. Please start from the beginning.",
        variant: "destructive",
      });
      return;
    }

    setIdVerification({ status: 'loading' });

    try {
      const response = await fetch('/api/providers/id/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start verification');
      }

      setIdVerification({ 
        status: 'pending', 
        sessionId: data.sessionClientSecret,
        message: data.message 
      });

      // Start polling for verification status
      pollVerificationStatus();

      toast({
        title: "Verification Started",
        description: "ID verification session has been initiated.",
      });

    } catch (error) {
      console.error('ID verification start error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setIdVerification({ status: 'failed', message: errorMessage });
      toast({
        title: "Verification Failed", 
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const checkVerificationStatus = async () => {
    if (!providerId) return;

    try {
      const response = await fetch(`/api/providers/verification-status/${providerId}`);
      const data = await response.json();

      if (data.verification?.id_status === 'passed' && data.verification?.liveness_passed) {
        setIdVerification({ status: 'passed' });
        toast({
          title: "Verification Complete",
          description: "Your identity has been verified successfully!",
        });
      } else if (data.verification?.id_status === 'failed') {
        setIdVerification({ status: 'failed', message: 'Verification failed. Please try again.' });
      }
    } catch (error) {
      console.error('Status check error:', error);
    }
  };

  const pollVerificationStatus = () => {
    const pollInterval = setInterval(async () => {
      await checkVerificationStatus();
      
      // Stop polling if verification is complete
      if (idVerification.status === 'passed' || idVerification.status === 'failed') {
        clearInterval(pollInterval);
      }
    }, 3000); // Check every 3 seconds

    // Stop polling after 2 minutes
    setTimeout(() => clearInterval(pollInterval), 120000);
  };

  const handleStartBackgroundCheck = async () => {
    if (!providerId) {
      toast({
        title: "Error",
        description: "Provider ID not found. Please start from the beginning.",
        variant: "destructive",
      });
      return;
    }

    setBackgroundCheck({ status: 'loading' });

    try {
      const response = await fetch('/api/providers/checks/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start background check');
      }

      setBackgroundCheck({ 
        status: 'pending',
        message: data.message 
      });

      // Start polling for background check status
      pollBackgroundCheckStatus();

      toast({
        title: "Background Check Started",
        description: "Background check has been initiated.",
      });

    } catch (error) {
      console.error('Background check start error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setBackgroundCheck({ status: 'failed', message: errorMessage });
      toast({
        title: "Background Check Failed", 
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const checkBackgroundStatus = async () => {
    if (!providerId) return;

    try {
      const response = await fetch(`/api/providers/verification-status/${providerId}`);
      const data = await response.json();

      if (data.backgroundCheck?.check_status === 'passed') {
        setBackgroundCheck({ status: 'passed' });
        toast({
          title: "Background Check Complete",
          description: "Your background check has passed successfully!",
        });
      } else if (data.backgroundCheck?.check_status === 'failed') {
        setBackgroundCheck({ status: 'failed', message: 'Background check failed. Please contact support.' });
      }
    } catch (error) {
      console.error('Background check status error:', error);
    }
  };

  const pollBackgroundCheckStatus = () => {
    const pollInterval = setInterval(async () => {
      await checkBackgroundStatus();
      
      // Stop polling if background check is complete
      if (backgroundCheck.status === 'passed' || backgroundCheck.status === 'failed') {
        clearInterval(pollInterval);
      }
    }, 5000); // Check every 5 seconds

    // Stop polling after 5 minutes
    setTimeout(() => clearInterval(pollInterval), 300000);
  };

  const handleStripeConnect = async () => {
    if (!providerId) {
      toast({
        title: "Error",
        description: "Provider ID not found. Please start from the beginning.",
        variant: "destructive",
      });
      return;
    }

    setPayoutSetup({ status: 'loading' });

    try {
      const response = await fetch('/api/providers/payouts/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          providerId,
          accountType,
          returnUrl: `${window.location.origin}/provider-onboarding?step=4&connected=true`,
          refreshUrl: `${window.location.origin}/provider-onboarding?step=4&refresh=true`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create Stripe Connect account');
      }

      setPayoutSetup({ 
        status: 'connecting',
        accountId: data.accountId,
        message: data.message 
      });

      // Open Stripe Connect onboarding in new window
      window.open(data.accountLinkUrl, '_blank', 'width=600,height=800');

      toast({
        title: "Stripe Connect Opened",
        description: "Complete your setup in the new window.",
      });

    } catch (error) {
      console.error('Stripe Connect error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setPayoutSetup({ status: 'failed', message: errorMessage });
      toast({
        title: "Setup Failed", 
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const checkPayoutStatus = async () => {
    if (!providerId) return;

    try {
      const response = await fetch(`/api/providers/payouts/status/${providerId}`);
      const data = await response.json();

      if (data.status === 'connected' && data.chargesEnabled) {
        setPayoutSetup({ status: 'connected', accountId: data.accountId });
        toast({
          title: "Payout Setup Complete",
          description: "Your Stripe account is connected and ready!",
        });
      } else {
        toast({
          title: "Setup In Progress",
          description: "Please complete your Stripe setup and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Payout status check error:', error);
      toast({
        title: "Status Check Failed",
        description: "Unable to verify payout setup status.",
        variant: "destructive",
      });
    }
  };

  const saveServiceDetails = async () => {
    try {
      const response = await fetch('/api/providers/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: serviceDetails.description,
          pricePerService: parseFloat(serviceDetails.pricePerService) || undefined,
          availability: serviceDetails.availability,
          serviceTypes: serviceDetails.serviceTypes,
          radiusKm: serviceDetails.radiusKm,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save service details');
      }

      toast({
        title: "Details Saved",
        description: "Your service details have been saved successfully.",
      });

      return true;
    } catch (error) {
      console.error('Save service details error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Save Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  // Check URL parameters for Stripe Connect return
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('connected') === 'true' && currentStep === 4) {
      checkPayoutStatus();
    }
  }, [currentStep]);

  // Initialize provider ID (mock for now)
  useEffect(() => {
    if (!providerId) {
      setProviderId('mock-provider-id-' + Date.now());
    }
  }, []);

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Welcome
        return (
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Welcome to Provider Onboarding</h2>
            <p className="text-gray-600">Let's get you started as a service provider on our platform.</p>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">You'll complete the following steps:</p>
              <ul className="text-sm text-gray-500 list-disc list-inside">
                <li>Basic information</li>
                <li>Identity verification</li>
                <li>Background check</li>
                <li>Payment setup</li>
                <li>Service details</li>
                <li>Terms agreement</li>
              </ul>
            </div>
          </div>
        );

      case 1: // Basics
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Legal Name</label>
                <Input placeholder="Enter your full legal name" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <Input placeholder="Enter your phone number" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Profile Photo</label>
                <Input type="file" accept="image/*" />
              </div>
            </div>
          </div>
        );

      case 2: // ID Verification
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Identity Verification</h2>
            <p className="text-gray-600">Upload a photo of your government-issued ID</p>
            
            {idVerification.status === 'idle' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">ID Document</label>
                  <Input type="file" accept="image/*" />
                </div>
                <Button 
                  onClick={handleStartIDVerification}
                  className="w-full"
                  data-testid="button-start-id-verification"
                >
                  Start ID Verification
                </Button>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    We'll verify your identity using liveness detection and document matching.
                    This process typically takes 1-2 minutes.
                  </p>
                </div>
              </div>
            )}

            {idVerification.status === 'loading' && (
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
                <p className="text-sm text-gray-600">Starting verification session...</p>
              </div>
            )}

            {idVerification.status === 'pending' && (
              <div className="space-y-4">
                <div className="bg-yellow-50 p-4 rounded-lg flex items-center space-x-3">
                  <Loader2 className="h-5 w-5 animate-spin text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Verification in Progress</p>
                    <p className="text-sm text-yellow-700">Please wait while we verify your identity...</p>
                  </div>
                </div>
                <Button 
                  onClick={checkVerificationStatus}
                  variant="outline"
                  className="w-full"
                  data-testid="button-check-verification-status"
                >
                  Check Status
                </Button>
              </div>
            )}

            {idVerification.status === 'passed' && (
              <div className="bg-green-50 p-4 rounded-lg flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">Identity Verified</p>
                  <p className="text-sm text-green-700">Your identity has been successfully verified.</p>
                </div>
              </div>
            )}

            {idVerification.status === 'failed' && (
              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-lg flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Verification Failed</p>
                    <p className="text-sm text-red-700">
                      {idVerification.message || 'Please try again with a clear photo of your ID.'}
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => setIdVerification({ status: 'idle' })}
                  variant="outline"
                  className="w-full"
                  data-testid="button-retry-id-verification"
                >
                  Try Again
                </Button>
              </div>
            )}
          </div>
        );

      case 3: // Background Check
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Background Check</h2>
            <p className="text-gray-600">We'll run a background check to ensure platform safety</p>
            
            {backgroundCheck.status === 'idle' && (
              <div className="space-y-4">
                <Button 
                  onClick={handleStartBackgroundCheck}
                  className="w-full"
                  data-testid="button-start-background-check"
                >
                  Start Background Check
                </Button>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    We'll verify your background to ensure platform safety.
                    This process typically takes 1-3 business days.
                  </p>
                </div>
              </div>
            )}

            {backgroundCheck.status === 'loading' && (
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
                <p className="text-sm text-gray-600">Starting background check...</p>
              </div>
            )}

            {backgroundCheck.status === 'pending' && (
              <div className="space-y-4">
                <div className="bg-yellow-50 p-4 rounded-lg flex items-center space-x-3">
                  <Loader2 className="h-5 w-5 animate-spin text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Background Check in Progress</p>
                    <p className="text-sm text-yellow-700">Please wait while we verify your background...</p>
                  </div>
                </div>
                <Button 
                  onClick={checkBackgroundStatus}
                  variant="outline"
                  className="w-full"
                  data-testid="button-check-background-status"
                >
                  Check Status
                </Button>
              </div>
            )}

            {backgroundCheck.status === 'passed' && (
              <div className="bg-green-50 p-4 rounded-lg flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">Background Check Passed</p>
                  <p className="text-sm text-green-700">Your background check has been completed successfully.</p>
                </div>
              </div>
            )}

            {backgroundCheck.status === 'failed' && (
              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-lg flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Background Check Failed</p>
                    <p className="text-sm text-red-700">
                      {backgroundCheck.message || 'Please contact support for assistance.'}
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => setBackgroundCheck({ status: 'idle' })}
                  variant="outline"
                  className="w-full"
                  data-testid="button-retry-background-check"
                >
                  Contact Support
                </Button>
              </div>
            )}
          </div>
        );

      case 4: // Payout Setup
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Payout Setup</h2>
            <p className="text-gray-600">Connect your bank account to receive payments</p>
            
            {payoutSetup.status === 'idle' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Account Type</label>
                  <select 
                    className="w-full border rounded-lg px-3 py-2"
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value as 'individual' | 'business')}
                    data-testid="select-account-type"
                  >
                    <option value="individual">Individual</option>
                    <option value="business">Business</option>
                  </select>
                  {accountType === 'business' && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium mb-2">Business EIN</label>
                      <Input 
                        type="text" 
                        placeholder="XX-XXXXXXX"
                        data-testid="input-business-ein"
                      />
                    </div>
                  )}
                </div>
                
                <Button 
                  onClick={handleStripeConnect}
                  className="w-full"
                  data-testid="button-connect-stripe"
                >
                  Connect with Stripe
                </Button>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-800">
                    We use Stripe Connect for secure payment processing.
                    Your financial information is encrypted and secure.
                  </p>
                </div>
              </div>
            )}

            {payoutSetup.status === 'loading' && (
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
                <p className="text-sm text-gray-600">Setting up your payout account...</p>
              </div>
            )}

            {payoutSetup.status === 'connecting' && (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg flex items-center space-x-3">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Complete Setup in New Window</p>
                    <p className="text-sm text-blue-700">Finish your Stripe Connect setup in the opened window.</p>
                  </div>
                </div>
                <Button 
                  onClick={checkPayoutStatus}
                  variant="outline"
                  className="w-full"
                  data-testid="button-check-payout-status"
                >
                  I've Completed Setup
                </Button>
              </div>
            )}

            {payoutSetup.status === 'connected' && (
              <div className="bg-green-50 p-4 rounded-lg flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">Payout Account Connected</p>
                  <p className="text-sm text-green-700">You're ready to receive payments!</p>
                </div>
              </div>
            )}

            {payoutSetup.status === 'failed' && (
              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-lg flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Setup Failed</p>
                    <p className="text-sm text-red-700">
                      {payoutSetup.message || 'Please try again or contact support.'}
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => setPayoutSetup({ status: 'idle' })}
                  variant="outline"
                  className="w-full"
                  data-testid="button-retry-payout-setup"
                >
                  Try Again
                </Button>
              </div>
            )}
          </div>
        );

      case 5: // Service Details
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Service Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Service Description</label>
                <textarea 
                  className="w-full border rounded-lg px-3 py-2 h-24"
                  placeholder="Describe your services..."
                  value={serviceDetails.description}
                  onChange={(e) => setServiceDetails(prev => ({ ...prev, description: e.target.value }))}
                  data-testid="textarea-service-description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Starting Price ($)</label>
                  <Input 
                    type="number" 
                    placeholder="50"
                    value={serviceDetails.pricePerService}
                    onChange={(e) => setServiceDetails(prev => ({ ...prev, pricePerService: e.target.value }))}
                    data-testid="input-price-per-service"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Availability</label>
                  <select 
                    className="w-full border rounded-lg px-3 py-2"
                    value={serviceDetails.availability}
                    onChange={(e) => setServiceDetails(prev => ({ ...prev, availability: e.target.value }))}
                    data-testid="select-availability"
                  >
                    <option value="weekdays">Weekdays</option>
                    <option value="weekends">Weekends</option>
                    <option value="anytime">Anytime</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Services Offered</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Dog Walking', 'Pet Sitting', 'Grooming', 'Dog Training'].map((service) => (
                    <label key={service} className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        className="rounded"
                        checked={serviceDetails.serviceTypes.includes(service)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setServiceDetails(prev => ({ 
                              ...prev, 
                              serviceTypes: [...prev.serviceTypes, service] 
                            }));
                          } else {
                            setServiceDetails(prev => ({ 
                              ...prev, 
                              serviceTypes: prev.serviceTypes.filter(s => s !== service) 
                            }));
                          }
                        }}
                        data-testid={`checkbox-service-${service.toLowerCase().replace(' ', '-')}`}
                      />
                      <span className="text-sm">{service}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Service Radius (km)</label>
                <Input 
                  type="number" 
                  placeholder="10" 
                  min="1" 
                  max="50"
                  value={serviceDetails.radiusKm}
                  onChange={(e) => setServiceDetails(prev => ({ ...prev, radiusKm: parseInt(e.target.value) || 10 }))}
                  data-testid="input-service-radius"
                />
              </div>
              <div className="pt-4">
                <Button 
                  onClick={saveServiceDetails}
                  variant="outline"
                  className="w-full"
                  data-testid="button-save-service-details"
                >
                  Save Service Details
                </Button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Details are saved as draft and can be updated later
                </p>
              </div>
            </div>
          </div>
        );

      case 6: // Terms
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Terms & Conditions</h2>
            <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
              <p className="text-sm text-gray-700">
                By becoming a service provider, you agree to our terms and conditions...
                [Terms content would be displayed here]
              </p>
            </div>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">I agree to the Terms & Conditions</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">I agree to the Provider Agreement</span>
              </label>
            </div>
          </div>
        );

      case 7: // Review
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Review & Complete</h2>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold text-green-800">Congratulations!</h3>
              <p className="text-sm text-green-700">
                You're now a verified provider on our platform.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Identity Verified</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex justify-between text-sm">
                <span>Background Check</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex justify-between text-sm">
                <span>Payout Setup</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
            </div>
          </div>
        );

      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Progress Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  step.status === 'completed' 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : step.status === 'current'
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-gray-100 border-gray-300 text-gray-500'
                }`}>
                  {step.status === 'completed' ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-semibold">{step.id + 1}</span>
                  )}
                </div>
                <span className={`text-xs mt-1 ${
                  step.status === 'current' ? 'text-blue-600 font-semibold' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${
                  step.status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <div className="text-sm text-gray-500">
            Step {currentStep + 1} of {steps.length}
          </div>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={currentStep === steps.length - 1}
        >
          {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
        </Button>
      </div>
    </div>
  );
};
// SOL:END ProviderOnboard

export default ProviderOnboard;

// Helper functions (defined below component as requested)
const getStepStatus = (currentStep: number, stepIndex: number): 'pending' | 'current' | 'completed' => {
  if (stepIndex < currentStep) return 'completed';
  if (stepIndex === currentStep) return 'current';
  return 'pending';
};

const validateStep = (stepIndex: number, formData: Record<string, any>): boolean => {
  // Stub validation logic for each step
  switch (stepIndex) {
    case 1: // Basics
      return formData.legalName && formData.phone;
    case 2: // ID
      return formData.idDocument;
    case 3: // Background Check
      return formData.backgroundCheckStatus === 'passed';
    case 4: // Payout
      return formData.stripeAccountId;
    case 5: // Service Details
      return formData.serviceTypes && formData.serviceTypes.length > 0;
    case 6: // Terms
      return formData.termsAgreed && formData.providerAgreementAgreed;
    default:
      return true;
  }
};