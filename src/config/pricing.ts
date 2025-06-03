
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
        'Standard listing visibility',
        'Like and comment on posts',
        'View stories and profiles',
        'Basic profile creation',
        'Limited messaging (10 per day)'
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
        'Voice calls with sellers/providers',
        'Create and share stories',
        'Post photos & videos to profile',
        'Unlimited likes and comments',
        'Advanced messaging features',
        'Exclusive breeds & shelter partners',
        'Partner brand discounts (10-20%)',
        'Pro Pup trustworthiness badge',
        'Priority customer support',
        'Profile verification options',
        'Story highlights and saved content',
        'Advanced photo filters',
        'Message read receipts'
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
        'Custom branding options',
        'Live streaming capabilities',
        'Business insights and metrics',
        'Bulk messaging tools',
        'Professional content creation tools',
        'Priority placement in search',
        'Advanced video call features',
        'Multi-account management',
        'API access for integrations'
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
