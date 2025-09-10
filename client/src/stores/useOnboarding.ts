import { create } from "zustand";

type OnboardingState = {
  userId: string | null;
  providerId: string | null;
  applicationId: string | null;
  setIds: (userId: string, providerId: string) => void;
  setApplicationId: (id: string) => void;
  hydrateApplicationId: () => void;
  hydrateProviderId: () => void;
  clear: () => void;
};

export const useOnboarding = create<OnboardingState>((set, get) => ({
  userId: null,
  providerId: null,
  applicationId: null,
  setIds: (userId: string, providerId: string) => {
    set({ userId, providerId });
    // Persist providerId to sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('providerId', providerId);
    }
  },
  setApplicationId: (id: string) => {
    set({ applicationId: id });
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('applicationId', id);
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
  clear: () => {
    set({ userId: null, providerId: null, applicationId: null });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('applicationId');
      sessionStorage.removeItem('providerId');
    }
  },
}));