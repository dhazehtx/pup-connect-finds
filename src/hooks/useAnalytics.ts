
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsEvent {
  event_type: string;
  user_id?: string;
  session_id: string;
  page_url: string;
  user_agent?: string;
  event_data: Record<string, any>;
}

interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  eventType?: string;
  userId?: string;
}

export const useAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const trackEvent = useCallback(async (event: Omit<AnalyticsEvent, 'session_id' | 'page_url' | 'user_agent'>) => {
    try {
      const sessionId = sessionStorage.getItem('session_id') || crypto.randomUUID();
      if (!sessionStorage.getItem('session_id')) {
        sessionStorage.setItem('session_id', sessionId);
      }

      const analyticsEvent: AnalyticsEvent = {
        ...event,
        session_id: sessionId,
        page_url: window.location.href,
        user_agent: navigator.userAgent
      };

      const { error } = await supabase
        .from('analytics_events')
        .insert(analyticsEvent);

      if (error) throw error;
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }, []);

  const getAnalytics = useCallback(async (filters: AnalyticsFilters = {}) => {
    setLoading(true);
    try {
      let query = supabase
        .from('analytics_events')
        .select('*')
        .order('timestamp', { ascending: false });

      if (filters.startDate) {
        query = query.gte('timestamp', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('timestamp', filters.endDate);
      }

      if (filters.eventType) {
        query = query.eq('event_type', filters.eventType);
      }

      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch analytics data",
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getEventStats = useCallback(async (eventType: string, timeRange: string = '7d') => {
    try {
      const startDate = new Date();
      const days = parseInt(timeRange.replace('d', ''));
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('analytics_events')
        .select('timestamp, event_data')
        .eq('event_type', eventType)
        .gte('timestamp', startDate.toISOString());

      if (error) throw error;

      // Group by day
      const stats = data.reduce((acc: Record<string, number>, event) => {
        const date = new Date(event.timestamp).toDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(stats).map(([date, count]) => ({
        date,
        count
      }));
    } catch (error) {
      console.error('Error fetching event stats:', error);
      return [];
    }
  }, []);

  const getUserJourney = useCallback(async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching user journey:', error);
      return [];
    }
  }, []);

  const trackPageView = useCallback((additionalData: Record<string, any> = {}) => {
    trackEvent({
      event_type: 'page_view',
      event_data: {
        title: document.title,
        referrer: document.referrer,
        ...additionalData
      }
    });
  }, [trackEvent]);

  const trackUserAction = useCallback((action: string, target?: string, additionalData: Record<string, any> = {}) => {
    trackEvent({
      event_type: 'user_action',
      event_data: {
        action,
        target,
        timestamp: new Date().toISOString(),
        ...additionalData
      }
    });
  }, [trackEvent]);

  const trackConversion = useCallback((type: string, value?: number, additionalData: Record<string, any> = {}) => {
    trackEvent({
      event_type: 'conversion',
      event_data: {
        conversion_type: type,
        value,
        timestamp: new Date().toISOString(),
        ...additionalData
      }
    });
  }, [trackEvent]);

  return {
    loading,
    trackEvent,
    trackPageView,
    trackUserAction,
    trackConversion,
    getAnalytics,
    getEventStats,
    getUserJourney
  };
};
