
import React from 'react';
import RippleButton from '@/components/ui/ripple-button';
import { Card, CardContent } from '@/components/ui/card';

interface OnboardingScreenProps {
  title: string;
  description: string;
  image: string;
  isLastScreen?: boolean;
  onNext: () => void;
  onSkip: () => void;
  onSkipAll: () => void;
  currentStep: number;
  totalSteps: number;
}

const OnboardingScreen = ({
  title,
  description,
  image,
  isLastScreen = false,
  onNext,
  onSkip,
  onSkipAll,
  currentStep,
  totalSteps
}: OnboardingScreenProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto bg-background border-border shadow-lg">
        <CardContent className="p-8 text-center">
          {/* Skip All Button */}
          <div className="flex justify-end mb-4">
            <RippleButton
              onClick={onSkipAll}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              Skip Tutorial
            </RippleButton>
          </div>

          {/* Progress indicators */}
          <div className="flex justify-center gap-2 mb-8">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index < currentStep ? 'bg-primary scale-110' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Image */}
          <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden bg-muted flex items-center justify-center">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <h2 className="text-2xl font-bold text-foreground mb-4">{title}</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">{description}</p>

          {/* Actions */}
          <div className="space-y-3">
            <RippleButton
              onClick={onNext}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLastScreen ? 'Get Started' : 'Continue'}
            </RippleButton>
            
            {!isLastScreen && (
              <RippleButton
                onClick={onSkip}
                variant="ghost"
                className="w-full text-muted-foreground hover:text-foreground"
              >
                Skip This Step
              </RippleButton>
            )}
          </div>

          {/* Step indicator */}
          <p className="text-xs text-muted-foreground mt-4">
            Step {currentStep} of {totalSteps}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingScreen;
