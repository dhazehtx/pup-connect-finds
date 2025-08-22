import { create } from 'zustand';

interface OnboardingState {
  currentStep: number;
  providerId: string | null;
  setCurrentStep: (step: number) => void;
  setProviderId: (id: string) => void;
  loadFromStorage: () => void;
  clearOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  currentStep: 1,
  providerId: null,
  
  setCurrentStep: (step: number) => {
    set({ currentStep: step });
    sessionStorage.setItem('onboarding_step', step.toString());
  },
  
  setProviderId: (id: string) => {
    set({ providerId: id });
    sessionStorage.setItem('provider_id', id);
  },
  
  loadFromStorage: () => {
    const savedStep = sessionStorage.getItem('onboarding_step');
    const savedProviderId = sessionStorage.getItem('provider_id');
    
    set({
      currentStep: savedStep ? parseInt(savedStep) : 1,
      providerId: savedProviderId || null,
    });
  },
  
  clearOnboarding: () => {
    set({ currentStep: 1, providerId: null });
    sessionStorage.removeItem('onboarding_step');
    sessionStorage.removeItem('provider_id');
  },
}));