import { create } from "zustand";

type OnboardingState = {
  userId: string | null;
  providerId: string | null;
  applicationId: string | null;
  setIds: (userId: string, providerId: string) => void;
  setApplicationId: (id: string) => void;
  hydrateApplicationId: () => void;
  clear: () => void;
};

export const useOnboarding = create<OnboardingState>((set, get) => ({
  userId: null,
  providerId: null,
  applicationId: null,
  setIds: (userId: string, providerId: string) => 
    set({ userId, providerId }),
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
  clear: () => {
    set({ userId: null, providerId: null, applicationId: null });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('applicationId');
    }
  },
}));