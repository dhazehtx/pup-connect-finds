
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface VerificationUpdate {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_at?: string;
  rejection_reason?: string;
  verification_type?: string;
}

export const useRealtimeVerification = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [verificationRequests, setVerificationRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial verification requests
  useEffect(() => {
    const fetchVerificationRequests = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('verification_requests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setVerificationRequests(data || []);
      } catch (error) {
        console.error('Error fetching verification requests:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVerificationRequests();
  }, [user]);

  // Set up real-time subscription for verification updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('verification_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'verification_requests',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const updatedRequest = payload.new as VerificationUpdate;
          
          // Update local state
          setVerificationRequests(prev => 
            prev.map(req => 
              req.id === updatedRequest.id ? { ...req, ...updatedRequest } : req
            )
          );

          // Show enhanced notification based on status change
          if (updatedRequest.status === 'approved') {
            toast({
              title: "🎉 Verification Approved!",
              description: `Your ${updatedRequest.verification_type || 'account'} verification has been approved. You now have enhanced credibility and visibility.`,
            });
          } else if (updatedRequest.status === 'rejected') {
            toast({
              title: "❌ Verification Update",
              description: updatedRequest.rejection_reason || "Your verification request needs attention. Please review and resubmit.",
              variant: "destructive",
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'verification_requests',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newRequest = payload.new;
          setVerificationRequests(prev => [newRequest, ...prev]);
          
          toast({
            title: "📋 Verification Submitted",
            description: "Your verification request has been submitted for review. We'll notify you of updates.",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  // Set up profile verification status updates
  useEffect(() => {
    if (!user) return;

    const profileChannel = supabase
      .channel('profile_verification_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          const updatedProfile = payload.new;
          
          // If verification status changed to true
          if (updatedProfile.verified && !payload.old?.verified) {
            toast({
              title: "🏆 Account Verified!",
              description: "Congratulations! Your account is now verified. This enhances your credibility and gives you access to premium features.",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profileChannel);
    };
  }, [user, toast]);

  const submitVerificationRequest = async (verificationData: any) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('user-verification', {
        body: {
          action: 'submit_verification',
          user_id: user.id,
          verification_data: verificationData
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error submitting verification:', error);
      throw error;
    }
  };

  return {
    verificationRequests,
    isLoading,
    submitVerificationRequest
  };
};
