
import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsData {
  total_views: number;
  unique_views: number;
  total_favorites: number;
  total_inquiries: number;
  views_by_day: Record<string, number>;
}

export interface NotificationData {
  user_id: string;
  type: string;
  title: string;
  message: string;
  related_id?: string;
  sender_id?: string;
}

export interface SearchFilters {
  query?: string;
  breeds?: string[];
  price_range?: { min?: number; max?: number };
  age_range?: { min?: number; max?: number };
  location?: string;
  verified_sellers_only?: boolean;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface VerificationData {
  business_license?: string;
  id_document?: string;
  address_proof?: string;
  contact_verification?: string;
  experience_details?: string;
}

export const edgeFunctions = {
  // Listing Analytics
  async trackListingView(listingId: string): Promise<void> {
    const { error } = await supabase.functions.invoke('listing-analytics', {
      body: {
        listingId,
        action: 'track_view'
      }
    });

    if (error) throw error;
  },

  async getListingAnalytics(listingId: string): Promise<AnalyticsData> {
    const { data, error } = await supabase.functions.invoke('listing-analytics', {
      body: {
        listingId,
        action: 'get_analytics'
      }
    });

    if (error) throw error;
    return data;
  },

  // Notification System
  async sendNotification(notificationData: NotificationData): Promise<void> {
    const { error } = await supabase.functions.invoke('notification-system', {
      body: {
        action: 'send_notification',
        notification_data: notificationData
      }
    });

    if (error) throw error;
  },

  async sendBulkNotifications(userIds: string[], notificationData: Omit<NotificationData, 'user_id'>): Promise<void> {
    const { error } = await supabase.functions.invoke('notification-system', {
      body: {
        action: 'send_bulk_notifications',
        notification_data: {
          user_ids: userIds,
          ...notificationData
        }
      }
    });

    if (error) throw error;
  },

  // Advanced Search
  async advancedSearch(filters: SearchFilters): Promise<{
    listings: any[];
    total_count: number;
    has_more: boolean;
  }> {
    const { data, error } = await supabase.functions.invoke('advanced-search', {
      body: filters
    });

    if (error) throw error;
    return data;
  },

  // User Verification
  async submitVerificationRequest(userId: string, verificationData: VerificationData): Promise<void> {
    const { error } = await supabase.functions.invoke('user-verification', {
      body: {
        action: 'submit_verification',
        user_id: userId,
        verification_data: verificationData
      }
    });

    if (error) throw error;
  },

  async approveVerification(requestId: string): Promise<void> {
    const { error } = await supabase.functions.invoke('user-verification', {
      body: {
        action: 'approve_verification',
        verification_data: { request_id: requestId }
      }
    });

    if (error) throw error;
  }
};
