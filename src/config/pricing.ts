
export const PRICING_CONFIG = {
  listingFees: {
    basic: 5,
    featured: 15,
    premium: 25
  },
  subscriptions: {
    basic: {
      monthly: 29,
      yearly: 299,
      features: [
        'Up to 10 listings per month',
        'Basic analytics',
        'Email support',
        'Profile verification badge'
      ]
    },
    pro: {
      monthly: 79,
      yearly: 799,
      features: [
        'Unlimited listings',
        'Featured listing slots (5/month)',
        'Advanced analytics',
        'Priority support',
        'Vet verification badge',
        'Custom profile themes'
      ]
    },
    enterprise: {
      monthly: 199,
      yearly: 1999,
      features: [
        'Unlimited everything',
        'Unlimited featured listings',
        'White-label options',
        'Dedicated account manager',
        'API access',
        'Custom integrations'
      ]
    }
  },
  transactionFee: 0.08, // 8%
  donationGoals: {
    monthly: 10000,
    quarterly: 30000,
    yearly: 100000
  }
};
