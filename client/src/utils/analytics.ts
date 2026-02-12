// Google Analytics 4 Integration
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

class AnalyticsService {
  private static isInitialized = false;
  private static GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

  static initialize() {
    if (this.isInitialized || !this.GA_ID) {
      return;
    }

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };

    // Load GA4 script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.GA_ID}`;
    document.head.appendChild(script);

    // Configure GA4
    window.gtag('js', new Date());
    window.gtag('config', this.GA_ID, {
      page_title: document.title,
      page_location: window.location.href,
    });

    this.isInitialized = true;
  }

  // Track page views
  static trackPageView(pagePath: string, pageTitle?: string) {
    if (!this.isInitialized || !window.gtag) return;

    window.gtag('config', this.GA_ID, {
      page_path: pagePath,
      page_title: pageTitle || document.title,
    });
  }

  // Track custom events
  static trackEvent(eventName: string, parameters: Record<string, any> = {}) {
    if (!this.isInitialized || !window.gtag) return;

    window.gtag('event', eventName, parameters);
  }

  // User Authentication Events
  static trackSignUp(method: string = 'email') {
    this.trackEvent('sign_up', {
      method,
      event_category: 'authentication',
    });
  }

  static trackLogin(method: string = 'email') {
    this.trackEvent('login', {
      method,
      event_category: 'authentication',
    });
  }

  static trackLogout() {
    this.trackEvent('logout', {
      event_category: 'authentication',
    });
  }

  // Marketplace Events
  static trackListingView(listingId: string, breed: string, price: number) {
    this.trackEvent('view_item', {
      item_id: listingId,
      item_name: `${breed} Puppy`,
      item_category: 'puppy_listing',
      value: price,
      currency: 'USD',
      event_category: 'marketplace',
    });
  }

  static trackListingContact(listingId: string, breed: string) {
    this.trackEvent('contact_seller', {
      item_id: listingId,
      item_name: `${breed} Puppy`,
      item_category: 'puppy_listing',
      event_category: 'marketplace',
    });
  }

  static trackListingFavorite(listingId: string, breed: string, action: 'add' | 'remove') {
    this.trackEvent('favorite_listing', {
      item_id: listingId,
      item_name: `${breed} Puppy`,
      item_category: 'puppy_listing',
      action,
      event_category: 'engagement',
    });
  }

  // Social Features
  static trackPostCreate(postType: string = 'text') {
    this.trackEvent('create_post', {
      post_type: postType,
      event_category: 'social',
    });
  }

  static trackPostLike(postId: string, action: 'like' | 'unlike') {
    this.trackEvent('post_engagement', {
      post_id: postId,
      engagement_type: action,
      event_category: 'social',
    });
  }

  static trackCommentCreate(postId: string) {
    this.trackEvent('create_comment', {
      post_id: postId,
      event_category: 'social',
    });
  }

  static trackGroupJoin(groupId: string, groupType: string) {
    this.trackEvent('join_group', {
      group_id: groupId,
      group_type: groupType,
      event_category: 'community',
    });
  }

  // Search and Discovery
  static trackSearch(searchTerm: string, category: string = 'listings') {
    this.trackEvent('search', {
      search_term: searchTerm,
      search_category: category,
      event_category: 'discovery',
    });
  }

  static trackFilterUse(filterType: string, filterValue: string) {
    this.trackEvent('use_filter', {
      filter_type: filterType,
      filter_value: filterValue,
      event_category: 'discovery',
    });
  }

  // Payment Events
  static trackPurchaseIntent(itemType: string, value: number) {
    this.trackEvent('begin_checkout', {
      item_type: itemType,
      value,
      currency: 'USD',
      event_category: 'ecommerce',
    });
  }

  static trackPurchaseComplete(transactionId: string, value: number, itemType: string) {
    this.trackEvent('purchase', {
      transaction_id: transactionId,
      value,
      currency: 'USD',
      item_type: itemType,
      event_category: 'ecommerce',
    });
  }

  // User Engagement
  static trackTimeOnSite(seconds: number) {
    this.trackEvent('session_duration', {
      value: seconds,
      event_category: 'engagement',
    });
  }

  static trackFeatureUse(featureName: string, context?: string) {
    this.trackEvent('feature_use', {
      feature_name: featureName,
      context,
      event_category: 'features',
    });
  }

  // Error Tracking
  static trackError(errorType: string, errorMessage: string, context?: string) {
    this.trackEvent('exception', {
      description: `${errorType}: ${errorMessage}`,
      fatal: false,
      context,
      event_category: 'errors',
    });
  }

  // Admin Actions (for analytics dashboard)
  static trackAdminAction(action: string, target: string) {
    this.trackEvent('admin_action', {
      action,
      target,
      event_category: 'admin',
    });
  }
}

export default AnalyticsService;