import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminPageTracking } from '@/hooks/useAdminPageTracking';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Shield, CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getServiceCategoryLabel } from '@shared/serviceCategories';
import { VerificationStatusBadge } from '@/components/badges/VerificationStatusBadge';

type PendingRow = {
  id: string;
  user_id: string;
  service_type: string;
  verified: boolean;
  review_status: string;
  reviewed_at: string | null;
  updated_at: string | null;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  badge_label: string;
};

function isAdminProfile(profile: { is_admin?: boolean; role?: string } | null | undefined): boolean {
  if (!profile) return false;
  if (profile.is_admin) return true;
  const r = profile.role;
  return r === 'admin' || r === 'moderator';
}

export default function ServiceVerificationAdminPage() {
  const { user, loading, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  useAdminPageTracking('Admin — Service verification');

  useEffect(() => {
    if (!loading && (!user || !isAdminProfile(profile))) {
      navigate('/', { replace: true });
    }
  }, [user, loading, profile, navigate]);

  const pendingQuery = useQuery({
    queryKey: ['admin', 'service-verification', 'pending'],
    queryFn: async () => {
      const res = await apiRequest('/api/admin/service-verification/pending');
      return res as { success?: boolean; data?: PendingRow[]; error?: string };
    },
    enabled: Boolean(user && isAdminProfile(profile)),
  });

  const reviewMutation = useMutation({
    mutationFn: async (payload: { user_id: string; service_type: string; action: 'approve' | 'reject' }) => {
      return apiRequest('/api/admin/service-verification/review', {
        method: 'POST',
        body: payload,
      });
    },
    onSuccess: (res: { message?: string }) => {
      toast({
        title: res?.message === 'VERIFICATION SYSTEM COMPLETE' ? 'Saved' : 'Updated',
        description: 'Verification status has been updated.',
      });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'service-verification'] });
      void queryClient.invalidateQueries({ queryKey: ['profile-service-offerings'] });
      void queryClient.invalidateQueries({ queryKey: ['providers'] });
    },
    onError: (err: Error & { status?: number }) => {
      toast({
        title: 'Update failed',
        description: err.message || 'You may not have permission.',
        variant: 'destructive',
      });
    },
  });

  const assignBadgeMutation = useMutation({
    mutationFn: async (payload: { user_id: string; service_type: string }) => {
      return apiRequest('/api/admin/service-verification/assign-badge', {
        method: 'POST',
        body: payload,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Badge assigned',
        description: 'Service badge was assigned and verification marked approved.',
      });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'service-verification'] });
      void queryClient.invalidateQueries({ queryKey: ['profile-service-offerings'] });
      void queryClient.invalidateQueries({ queryKey: ['providers'] });
    },
    onError: (err: Error) => {
      toast({
        title: 'Badge assignment failed',
        description: err.message || 'You may not have permission.',
        variant: 'destructive',
      });
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user || !isAdminProfile(profile)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-3" />
            <p className="text-red-800 font-medium">Admin access required</p>
            <p className="text-sm text-muted-foreground mt-2">Redirecting…</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const rows = pendingQuery.data?.data ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/80 px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-start gap-3">
          <Shield className="h-10 w-10 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Service verification</h1>
            <p className="text-slate-600 text-sm mt-1">
              Review pending provider services. Approving assigns the service-specific verified badge and publishes the
              listing in search.
            </p>
          </div>
        </div>

        <Card className="border-blue-100 bg-blue-50/50">
          <CardContent className="py-3 text-sm text-blue-900">
            <strong>Admin only:</strong> This queue is loaded from{' '}
            <code className="text-xs bg-blue-100/80 px-1 rounded">/api/admin/service-verification/pending</code>. Non-admin
            requests receive 403.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending providers ({rows.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingQuery.isLoading && (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}

            {pendingQuery.isError && (
              <p className="text-center text-red-600 py-8">Could not load the queue. Try again.</p>
            )}

            {!pendingQuery.isLoading && rows.length === 0 && (
              <p className="text-center text-muted-foreground py-10">No pending service verifications.</p>
            )}

            {rows.map((row) => {
              return (
              <div
                key={row.id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Avatar className="h-12 w-12 shrink-0">
                    <AvatarImage src={row.avatar_url ?? undefined} alt="" />
                    <AvatarFallback>{row.full_name?.charAt(0) ?? '?'}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{row.full_name ?? 'User'}</p>
                    <p className="text-sm text-muted-foreground truncate">@{row.username ?? '—'}</p>
                    <p className="text-xs text-muted-foreground font-mono truncate mt-0.5">{row.user_id}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:items-end sm:text-right">
                  <div>
                    <span className="text-sm text-muted-foreground">Service</span>
                    <p className="font-medium">{getServiceCategoryLabel(row.service_type)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground block sm:text-right">Badge on approve</span>
                    <VerificationStatusBadge
                      status="verified"
                      serviceLabel={getServiceCategoryLabel(row.service_type)}
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 sm:ml-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    disabled={assignBadgeMutation.isPending || reviewMutation.isPending}
                    onClick={() =>
                      assignBadgeMutation.mutate({
                        user_id: row.user_id,
                        service_type: row.service_type,
                      })
                    }
                  >
                    <Shield className="h-4 w-4 mr-1.5" />
                    Assign badge
                  </Button>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700"
                    disabled={reviewMutation.isPending || assignBadgeMutation.isPending}
                    onClick={() =>
                      reviewMutation.mutate({
                        user_id: row.user_id,
                        service_type: row.service_type,
                        action: 'approve',
                      })
                    }
                  >
                    <CheckCircle className="h-4 w-4 mr-1.5" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={reviewMutation.isPending || assignBadgeMutation.isPending}
                    onClick={() =>
                      reviewMutation.mutate({
                        user_id: row.user_id,
                        service_type: row.service_type,
                        action: 'reject',
                      })
                    }
                  >
                    <XCircle className="h-4 w-4 mr-1.5" />
                    Reject
                  </Button>
                </div>
              </div>
            );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
