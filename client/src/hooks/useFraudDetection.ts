
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { FraudDetectionResult } from '@/types/security';

export const useFraudDetection = () => {
  const [loading, setLoading] = useState(false);
  const [riskScore, setRiskScore] = useState<number | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const analyzeTransaction = useCallback(async (
    transactionId: string,
    userBehavior?: any,
    transactionDetails?: any
  ): Promise<FraudDetectionResult | null> => {
    if (!user || !transactionId) return null;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fraud-detection', {
        body: {
          transactionId,
          eventType: 'transaction_analysis',
          userBehavior: {
            rapidClicks: userBehavior?.rapidClicks || 0,
            multiplePaymentAttempts: userBehavior?.multiplePaymentAttempts || 0,
            unusualHours: userBehavior?.unusualHours || false,
            ...userBehavior
          },
          transactionDetails: {
            ipLocation: transactionDetails?.ipLocation,
            userLocation: transactionDetails?.userLocation,
            locationMismatch: transactionDetails?.locationMismatch || false,
            ...transactionDetails
          }
        }
      });

      if (error) throw error;

      setRiskScore(data.risk_score);
      
      if (data.risk_score >= 0.6) {
        toast({
          title: "Security Alert",
          description: `Transaction flagged for review (Risk: ${(data.risk_score * 100).toFixed(0)}%)`,
          variant: "destructive",
        });
      }

      return data;
    } catch (error) {
      console.error('Error analyzing transaction:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze transaction security",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const reportSuspiciousActivity = useCallback(async (
    activityType: string,
    details: any
  ) => {
    if (!user) return;

    try {
      await supabase
        .from('security_events')
        .insert({
          user_id: user.id,
          event_type: 'suspicious_activity',
          severity: 'medium',
          details: {
            activity_type: activityType,
            ...details,
            reported_at: new Date().toISOString()
          }
        });

      toast({
        title: "Report Submitted",
        description: "Suspicious activity has been reported to our security team",
      });
    } catch (error) {
      console.error('Error reporting suspicious activity:', error);
    }
  }, [user, toast]);

  const checkUserRisk = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('security_events')
        .select('*')
        .eq('user_id', userId)
        .eq('resolved', false)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Calculate risk based on recent events
      const highSeverityEvents = data.filter(e => e.severity === 'high' || e.severity === 'critical');
      const recentEvents = data.filter(e => 
        new Date(e.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
      );

      return {
        riskLevel: highSeverityEvents.length > 0 ? 'high' : 
                  recentEvents.length > 3 ? 'medium' : 'low',
        eventCount: data.length,
        recentEventCount: recentEvents.length
      };
    } catch (error) {
      console.error('Error checking user risk:', error);
      return { riskLevel: 'unknown', eventCount: 0, recentEventCount: 0 };
    }
  }, []);

  return {
    loading,
    riskScore,
    analyzeTransaction,
    reportSuspiciousActivity,
    checkUserRisk
  };
};
