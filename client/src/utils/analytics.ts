// Google Analytics 4 integration
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const initializeAnalytics = () => {
  const gaId = import.meta.env.VITE_GA_ID;
  
  if (gaId && typeof window !== 'undefined') {
    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);

    // Initialize dataLayer and gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    
    window.gtag('js', new Date());
    window.gtag('config', gaId, {
      page_title: document.title,
      page_location: window.location.href,
    });
    
    console.log('Google Analytics initialized');
  } else {
    console.warn('Google Analytics ID not configured');
  }
};

// Track page views
export const trackPageView = (pagePath: string, pageTitle?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', import.meta.env.VITE_GA_ID, {
      page_path: pagePath,
      page_title: pageTitle || document.title,
    });
  }
};

// Track custom events
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      event_category: 'engagement',
      event_label: eventName,
      ...parameters,
    });
  }
};

// Predefined event tracking functions
export const analytics = {
  // User actions
  trackSignUp: (method: string = 'email') => {
    trackEvent('sign_up', { method });
  },
  
  trackLogin: (method: string = 'email') => {
    trackEvent('login', { method });
  },
  
  trackLogout: () => {
    trackEvent('logout');
  },

  // Content interactions
  trackPostLike: (postId: string) => {
    trackEvent('post_like', { post_id: postId });
  },
  
  trackPostShare: (postId: string, platform: string) => {
    trackEvent('share', { 
      content_type: 'post',
      content_id: postId,
      method: platform 
    });
  },
  
  trackCommentCreate: (postId: string) => {
    trackEvent('comment_create', { post_id: postId });
  },

  // Marketplace actions
  trackListingView: (listingId: string, breed: string, price: number) => {
    trackEvent('view_item', {
      item_id: listingId,
      item_category: breed,
      value: price,
      currency: 'USD'
    });
  },
  
  trackListingCreate: (breed: string, price: number) => {
    trackEvent('create_listing', {
      item_category: breed,
      value: price,
      currency: 'USD'
    });
  },
  
  trackListingFavorite: (listingId: string) => {
    trackEvent('add_to_wishlist', { item_id: listingId });
  },

  // Messaging
  trackMessageSent: (conversationId: string) => {
    trackEvent('message_sent', { conversation_id: conversationId });
  },
  
  trackConversationStart: (listingId: string) => {
    trackEvent('conversation_start', { listing_id: listingId });
  },

  // Search and discovery
  trackSearch: (query: string, results: number) => {
    trackEvent('search', {
      search_term: query,
      results_count: results
    });
  },
  
  trackFilterApply: (filterType: string, filterValue: string) => {
    trackEvent('filter_apply', {
      filter_type: filterType,
      filter_value: filterValue
    });
  },

  // Profile actions
  trackProfileView: (profileId: string, userType: string) => {
    trackEvent('profile_view', {
      profile_id: profileId,
      user_type: userType
    });
  },
  
  trackFollow: (profileId: string) => {
    trackEvent('follow_user', { profile_id: profileId });
  },

  // Error tracking
  trackError: (errorType: string, errorMessage: string) => {
    trackEvent('error', {
      error_type: errorType,
      error_message: errorMessage
    });
  },

  // Performance tracking
  trackPageLoadTime: (pageName: string, loadTime: number) => {
    trackEvent('page_load_time', {
      page_name: pageName,
      load_time: loadTime
    });
  }
};

// Hook for tracking page views in React Router
export const usePageTracking = () => {
  const trackPage = (pathname: string) => {
    trackPageView(pathname);
  };
  
  return trackPage;
};