import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CheckCircle, Circle } from 'lucide-react';

// SOL:START ProviderOnboard
interface Step {
  id: number;
  title: string;
  status: 'pending' | 'current' | 'completed';
}

const ProviderOnboard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  
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
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

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
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">ID Document</label>
                <Input type="file" accept="image/*" />
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  We'll verify your identity using liveness detection and document matching.
                  This process typically takes 1-2 minutes.
                </p>
              </div>
            </div>
          </div>
        );

      case 3: // Background Check
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Background Check</h2>
            <p className="text-gray-600">We'll run a background check to ensure platform safety</p>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                Background check in progress... This may take 1-3 business days.
              </p>
            </div>
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Processing...</p>
            </div>
          </div>
        );

      case 4: // Payout Setup
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Payout Setup</h2>
            <p className="text-gray-600">Connect your bank account to receive payments</p>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Button className="w-full">
                  Connect with Stripe
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  Secure payment processing powered by Stripe
                </p>
              </div>
            </div>
          </div>
        );

      case 5: // Service Details
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Service Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Service Types</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Dog Walking</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Pet Sitting</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Dog Training</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Service Radius (km)</label>
                <Input type="number" placeholder="10" min="1" max="50" />
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