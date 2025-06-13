
export const PRICING_CONFIG = {
  subscriptions: {
    basic: {
      monthly: 0, // Free tier
      yearly: 0,
      features: [
        'Up to 2 dog listings',
        'Basic messaging (5 messages/day)',
        'Standard search results',
        'Community support',
        'Basic profile'
      ]
    },
    pro: {
      monthly: 14.99,
      yearly: 149.99, // Save $30/year
      features: [
        'Unlimited dog listings',
        'Unlimited messaging',
        'Priority search placement',
        'Advanced analytics dashboard',
        'Verification badge',
        'Priority customer support',
        'Featured listing (1/month)',
        'Advanced filters'
      ]
    },
    business: {
      monthly: 39.99,
      yearly: 399.99, // Save $80/year
      features: [
        'Everything in Pro',
        'Business profile with branding',
        'Multi-location management',
        'Team member access (up to 5)',
        'API access for integrations',
        'Custom analytics reports',
        'Dedicated account manager',
        'White-label options',
        'Unlimited featured listings'
      ]
    }
  },
  promotions: {
    basic: { price: 9.99, duration: 7 },
    featured: { price: 19.99, duration: 14 },
    premium: { price: 39.99, duration: 30 }
  },
  donations: {
    suggested: [5, 10, 25, 50, 100],
    customMin: 1,
    customMax: 1000
  }
};

export type SubscriptionTier = 'basic' | 'pro' | 'business';
export type PromotionTier = 'basic' | 'featured' | 'premium';
