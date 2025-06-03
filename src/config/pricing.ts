
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
      name: 'Pup Seeker',
      features: [
        'Create profile',
        'Browse all dog listings',
        'Save unlimited favorites',
        'Message sellers (up to 5/day)',
        'Access basic social feed (IG-style)',
        'Follow dogs/breeders',
        'View pet care tips & blogs',
        'Post dog content (1/day or 5/week)',
        'Basic support'
      ],
      limits: {
        dailyMessages: 5,
        dailyPosts: 1,
        weeklyPosts: 5
      }
    },
    pro: {
      monthly: 14.99,
      yearly: 149, // ~2 months free
      name: 'Pup Pro',
      features: [
        'Everything in Pup Seeker',
        'Unlimited messaging',
        'Priority placement in search',
        'Pro seller/breeder badge',
        'Add business/storefront profile',
        'Access analytics (views, clicks)',
        'Social post scheduler (basic)',
        'Up to 10 listings at a time',
        'Custom bio links',
        'Post unlimited dog content',
        'Moderate reviews'
      ],
      limits: {
        maxListings: 10
      }
    },
    business: {
      monthly: 39.99,
      yearly: 399, // ~2 months free
      name: 'Pup Partner',
      features: [
        'Everything in Pup Pro',
        'Verified business status',
        'Featured listings (homepage)',
        'Booking integrations (vet, grooming, walking)',
        'Flight nanny directory access',
        'Host virtual meet & greet events',
        'Priority support',
        'Run promotions & discounts',
        'API access (for syncing listings)',
        'Connect team members',
        'Unlimited listings',
        'Advanced analytics dashboard',
        'CRM-style messaging inbox'
      ],
      limits: {
        maxListings: 'unlimited'
      }
    },
    enterprise: {
      monthly: 99,
      yearly: 999,
      name: 'Pup Agency Dashboard',
      features: [
        'Everything in Pup Partner',
        'Multi-location account management',
        'Team user permissions',
        'Monthly performance reports',
        'API listing sync',
        'Advanced CRM messaging inbox',
        'Dedicated support manager',
        'White-label options',
        'Custom integrations'
      ],
      limits: {
        maxListings: 'unlimited',
        teamMembers: 'unlimited'
      }
    }
  },
  transactionFee: 0.05, // 5%
  donationGoals: {
    monthly: 10000,
    quarterly: 30000,
    yearly: 100000
  }
};
