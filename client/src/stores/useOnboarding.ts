import { create } from "zustand";

type OnboardingState = {
  userId: string | null;
  providerId: string | null;
  applicationId: string | null;
  setIds: (userId: string, providerId: string) => void;
  setApplicationId: (id: string) => void;
  clear: () => void;
};

export const useOnboarding = create<OnboardingState>((set) => ({
  userId: null,
  providerId: null,
  applicationId: null,
  setIds: (userId: string, providerId: string) => 
    set({ userId, providerId }),
  setApplicationId: (id: string) => 
    set({ applicationId: id }),
  clear: () => 
    set({ userId: null, providerId: null, applicationId: null }),
}));