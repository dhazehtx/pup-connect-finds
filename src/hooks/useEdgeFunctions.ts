
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { edgeFunctions, AnalyticsData, NotificationData, SearchFilters, VerificationData } from '@/services/edgeFunctions';

export const useListingAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const trackView = async (listingId: string) => {
    try {
      await edgeFunctions.trackListingView(listingId);
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const getAnalytics = async (listingId: string) => {
    try {
      setLoading(true);
      const data = await edgeFunctions.getListingAnalytics(listingId);
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { analytics, loading, trackView, getAnalytics };
};

export const useNotifications = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const sendNotification = async (notificationData: NotificationData) => {
    try {
      setLoading(true);
      await edgeFunctions.sendNotification(notificationData);
      toast({
        title: "Success",
        description: "Notification sent successfully",
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: "Error",
        description: "Failed to send notification",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendBulkNotifications = async (userIds: string[], notificationData: Omit<NotificationData, 'user_id'>) => {
    try {
      setLoading(true);
      await edgeFunctions.sendBulkNotifications(userIds, notificationData);
      toast({
        title: "Success",
        description: `Notifications sent to ${userIds.length} users`,
      });
    } catch (error) {
      console.error('Error sending bulk notifications:', error);
      toast({
        title: "Error",
        description: "Failed to send notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { loading, sendNotification, sendBulkNotifications };
};

export const useAdvancedSearch = () => {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const search = async (filters: SearchFilters) => {
    try {
      setLoading(true);
      const data = await edgeFunctions.advancedSearch(filters);
      setSearchResults(data.listings);
      setTotalCount(data.total_count);
      setHasMore(data.has_more);
    } catch (error) {
      console.error('Error performing search:', error);
      toast({
        title: "Error",
        description: "Search failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { searchResults, totalCount, hasMore, loading, search };
};

export const useVerification = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const submitVerification = async (userId: string, verificationData: VerificationData) => {
    try {
      setLoading(true);
      await edgeFunctions.submitVerificationRequest(userId, verificationData);
      toast({
        title: "Success",
        description: "Verification request submitted successfully",
      });
    } catch (error) {
      console.error('Error submitting verification:', error);
      toast({
        title: "Error",
        description: "Failed to submit verification request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const approveVerification = async (requestId: string) => {
    try {
      setLoading(true);
      await edgeFunctions.approveVerification(requestId);
      toast({
        title: "Success",
        description: "Verification approved successfully",
      });
    } catch (error) {
      console.error('Error approving verification:', error);
      toast({
        title: "Error",
        description: "Failed to approve verification",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { loading, submitVerification, approveVerification };
};
