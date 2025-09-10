import { create } from "zustand";

type OnboardingState = {
  userId: string | null;
  providerId: string | null;
  applicationId: string | null;
  payoutSetupComplete: boolean;
  setIds: (userId: string, providerId: string) => void;
  setProviderId: (id: string) => void;
  setApplicationId: (id: string) => void;
  setPayoutSetupComplete: (v: boolean) => void;
  clear: () => void;
};

export const useOnboarding = create<OnboardingState>((set, get) => ({
  userId: null,
  providerId: null,
  applicationId: null,
  payoutSetupComplete: false,
  setIds: (userId: string, providerId: string) => {
    set({ userId, providerId });
    // Persist providerId to sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('providerId', providerId);
    }
  },
  setProviderId: (id: string) => {
    set({ providerId: id });
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('providerId', id);
    }
  },
  setApplicationId: (id: string) => {
    set({ applicationId: id });
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('applicationId', id);
    }
  },
  setPayoutSetupComplete: (v: boolean) => {
    set({ payoutSetupComplete: v });
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('payoutDone', v ? '1' : '0');
    }
  },
  clear: () => {
    set({ userId: null, providerId: null, applicationId: null, payoutSetupComplete: false });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('applicationId');
      sessionStorage.removeItem('providerId');
      sessionStorage.removeItem('payoutDone');
    }
  },
}));