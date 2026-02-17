import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ReportOptions {
  targetType: 'user' | 'post' | 'listing' | 'comment';
  targetId: string;
}

export function useReport({ targetType, targetId }: ReportOptions) {
  const { toast } = useToast();

  const { data: checkData, isLoading: checking } = useQuery({
    queryKey: ['/api/reports/check', targetType, targetId],
    queryFn: async () => {
      const res = await fetch(`/api/reports/check/${targetType}/${targetId}`, {
        credentials: 'include',
      });
      if (!res.ok) return { alreadyReported: false };
      return res.json();
    },
    enabled: !!targetId && !!targetType,
    staleTime: 60000,
  });

  const alreadyReported = checkData?.alreadyReported ?? false;

  const reportMutation = useMutation({
    mutationFn: async ({ reason, description }: { reason: string; description?: string }) => {
      const endpoint = `/api/reports/${targetType}`;
      const res = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          target_id: targetId,
          reason,
          description,
        }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.ok) {
        toast({
          title: 'Report submitted',
          description: 'Thank you for helping keep the community safe.',
        });
        queryClient.invalidateQueries({ queryKey: ['/api/reports/check', targetType, targetId] });
      }
    },
    onError: (error: any) => {
      const msg = error?.message || '';
      if (msg.includes('already reported') || msg.includes('409')) {
        toast({
          title: 'Already reported',
          description: 'You have already reported this content recently.',
        });
      } else {
        toast({
          title: 'Report failed',
          description: 'Something went wrong. Please try again.',
          variant: 'destructive',
        });
      }
    },
  });

  const submitReport = useCallback(
    (reason: string, description?: string) => {
      if (alreadyReported) {
        toast({
          title: 'Already reported',
          description: 'You have already reported this content recently.',
        });
        return;
      }
      reportMutation.mutate({ reason, description });
    },
    [alreadyReported, reportMutation, toast]
  );

  return {
    submitReport,
    alreadyReported,
    isSubmitting: reportMutation.isPending,
    checking,
  };
}
