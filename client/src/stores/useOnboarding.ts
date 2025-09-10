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
  hydrateApplicationId: () => void;
  hydrateProviderId: () => void;
  hydratePayoutSetupComplete: () => void;
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
  hydrateApplicationId: () => {
    if (typeof window !== 'undefined') {
      const storedAppId = localStorage.getItem('applicationId');
      if (storedAppId && !get().applicationId) {
        set({ applicationId: storedAppId });
      }
    }
  },
  hydrateProviderId: () => {
    if (typeof window !== 'undefined') {
      const cached = sessionStorage.getItem('providerId');
      if (!get().providerId && cached) {
        set({ providerId: cached });
      }
    }
  },
  hydratePayoutSetupComplete: () => {
    if (typeof window !== 'undefined') {
      const cached = sessionStorage.getItem('payoutDone');
      if (cached === '1') {
        set({ payoutSetupComplete: true });
      }
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