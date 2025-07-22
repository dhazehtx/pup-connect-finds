// Early Access Configuration
export const EARLY_ACCESS_CONFIG = {
  // Enable early access mode
  isEarlyAccess: true,
  
  // Features to keep active during early access
  activeFeatures: {
    pupBoxSubscriptions: true,
    listingPromotions: true,
    donations: true,
    petProductStore: false, // Not implemented yet
  },
  
  // Features to hide/disable during early access
  hiddenFeatures: {
    subscriptionTiers: true,
    premiumRestrictions: true,
    escrowFees: true,
    paymentPlans: true,
    professionalServices: true,
    advertisements: true,
    businessUpgrades: true,
    verificationPaywalls: true,
  },
  
  // Early access messaging
  messages: {
    freeAccess: "All features are free during Early Access while we grow the community!",
    comingSoon: "Available Soon",
    freeDuringEarlyAccess: "Free during Early Access"
  }
};

export const isFeatureHidden = (feature: keyof typeof EARLY_ACCESS_CONFIG.hiddenFeatures): boolean => {
  return EARLY_ACCESS_CONFIG.isEarlyAccess && EARLY_ACCESS_CONFIG.hiddenFeatures[feature];
};

export const isFeatureActive = (feature: keyof typeof EARLY_ACCESS_CONFIG.activeFeatures): boolean => {
  return EARLY_ACCESS_CONFIG.activeFeatures[feature];
};
