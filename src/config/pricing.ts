
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
        'Unlimited messaging with sellers & providers',
        'Unlimited video & voice calls',
        'Create and share stories',
        'Post photos & videos to profile',
        'Unlimited likes and comments',
        'Save unlimited favorites',
        'Access basic support',
        'Standard listing visibility',
        'View stories and profiles',
        'Basic profile creation',
        'Advanced messaging features',
        'Message read receipts',
        'Story highlights and saved content',
        'Advanced photo filters'
      ]
    },
    pro: {
      monthly: 6.99,
      yearly: 59, // ~2 months free
      name: 'Pro Pup',
      features: [
        'Everything in Basic',
        'See listings first (early access)',
        'HD video & voice calls',
        'Premium story templates & effects',
        'Enhanced profile customization',
        'Live streaming capabilities',
        'Exclusive breeds & shelter partners',
        'Partner brand discounts (10-20%)',
        'Pro Pup trustworthiness badge',
        'Priority customer support',
        'Profile verification options',
        'Advanced analytics for your posts',
        'Custom story highlights',
        'Professional photo editing tools',
        'Message scheduling & templates',
        'Group video calls (up to 8 people)',
        'Premium filters & AR effects'
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
        'Business live streaming studio',
        'Business insights and metrics',
        'Bulk messaging tools',
        'Professional content creation suite',
        'Priority placement in search',
        'Advanced business video tools',
        'Multi-account management',
        'API access for integrations',
        'White-label customer portal'
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
