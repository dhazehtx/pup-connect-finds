
export interface AnalyticsEvent {
  id: string;
  user_id?: string;
  event_type: 'page_view' | 'listing_view' | 'search' | 'message_sent' | 'favorite_added' | 'contact_seller' | 'purchase_intent';
  event_data: any;
  timestamp: string;
  session_id: string;
  page_url: string;
  user_agent?: string;
}

export interface UserActivityMetrics {
  user_id: string;
  total_sessions: number;
  total_page_views: number;
  total_listings_viewed: number;
  total_searches: number;
  total_messages_sent: number;
  total_favorites: number;
  avg_session_duration: number;
  last_active: string;
  conversion_rate: number;
}

export interface ListingPerformanceMetrics {
  listing_id: string;
  views: number;
  unique_views: number;
  favorites: number;
  inquiries: number;
  conversion_rate: number;
  avg_view_duration: number;
  bounce_rate: number;
  search_appearances: number;
  click_through_rate: number;
}

export interface PlatformMetrics {
  total_users: number;
  active_users_24h: number;
  active_users_7d: number;
  active_users_30d: number;
  total_listings: number;
  active_listings: number;
  total_messages: number;
  total_transactions: number;
  revenue_30d: number;
  conversion_rate: number;
}

export interface SearchAnalytics {
  query: string;
  search_count: number;
  result_count: number;
  click_count: number;
  conversion_count: number;
  avg_position_clicked: number;
  zero_result_rate: number;
}
