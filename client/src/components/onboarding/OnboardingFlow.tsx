
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingScreen from './OnboardingScreen';
import AuthScreen from './AuthScreen';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();
  const { user, continueAsGuest } = useAuth();
  const navigate = useNavigate();

  const onboardingSteps = [
    {
      title: "Find Your Perfect Pup",
      description: "Discover verified breeders and rescue organizations with thousands of puppies waiting for their forever homes.",
      image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=300&fit=crop&crop=face"
    },
    {
      title: "Browse by Breed or Location",
      description: "Filter by breed, location, price range, and more to find exactly what you're looking for near you.",
      image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=300&fit=crop&crop=face"
    },
    {
      title: "Chat and Buy Safely",
      description: "Connect directly with verified breeders through our secure messaging system and complete transactions safely.",
      image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=300&fit=crop&crop=face"
    }
  ];

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Show auth screen after last onboarding step
      setCurrentStep(onboardingSteps.length);
    }
  };

  const handleSkip = () => {
    // Skip to auth screen
    setCurrentStep(onboardingSteps.length);
  };

  const handleSkipAll = () => {
    // Skip entire onboarding and go to auth
    navigate('/auth');
  };

  const handleSignIn = () => {
    // This will be handled by the auth context automatically
    onComplete();
  };

  const handleGuestBrowse = () => {
    continueAsGuest();
    onComplete();
  };

  // If user is logged in, complete onboarding
  if (user) {
    onComplete();
    return null;
  }

  // Show auth screen
  if (currentStep >= onboardingSteps.length) {
    return (
      <AuthScreen
        onSignIn={handleSignIn}
        onGuestBrowse={handleGuestBrowse}
        onSkip={handleSkipAll}
      />
    );
  }

  // Show onboarding screens
  const step = onboardingSteps[currentStep];
  
  return (
    <OnboardingScreen
      title={step.title}
      description={step.description}
      image={step.image}
      isLastScreen={currentStep === onboardingSteps.length - 1}
      onNext={handleNext}
      onSkip={handleSkip}
      onSkipAll={handleSkipAll}
      currentStep={currentStep + 1}
      totalSteps={onboardingSteps.length}
    />
  );
};

export default OnboardingFlow;
