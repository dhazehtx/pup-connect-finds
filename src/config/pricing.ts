
export const PRICING_CONFIG = {
  listingFees: {
    basic: 0, // Free for basic listings
    featured: 5, // Reduced from 15
    premium: 15 // Reduced from 25
  },
  subscriptions: {
    basic: {
      monthly: 0, // Free tier
      yearly: 0,
      name: 'Basic',
      features: [
        'Browse all dog listings & services',
        'Message sellers & providers',
        'Save up to 10 favorites',
        'Access basic support',
        'Standard listing visibility'
      ]
    },
    pro: {
      monthly: 6.99,
      yearly: 59, // ~2 months free
      name: 'Pro Pup',
      features: [
        'Everything in Basic',
        'See listings first (early access)',
        'Unlimited favorites & messages',
        'Video calls with sellers/providers',
        'Exclusive breeds & shelter partners',
        'Partner brand discounts (10-20%)',
        'Pro Pup trustworthiness badge',
        'Priority customer support'
      ]
    },
    business: {
      monthly: 19.99,
      yearly: 199, // ~2 months free
      name: 'Elite Handler',
      features: [
        'Everything in Pro Pup',
        'Verified breeder/business profile',
        '+5 featured listings per month',
        'Advanced booking & scheduling tools',
        'Detailed analytics dashboard',
        'Customer management system',
        'Elite Handler verification badge',
        'Dedicated account manager',
        'Custom branding options'
      ]
    }
  },
  transactionFee: 0.05, // Reduced from 8% to 5%
  donationGoals: {
    monthly: 10000,
    quarterly: 30000,
    yearly: 100000
  }
};
