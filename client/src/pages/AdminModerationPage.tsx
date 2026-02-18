import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Shield, AlertTriangle, X, Eye, Check, Ban, Trash2, UserX, UserCheck, ChevronLeft, Clock, FileText } from 'lucide-react';

type Report = {
  id: string;
  reporter_id: string;
  target_id: string;
  target_type: string;
  reason: string;
  description: string | null;
  status: string;
  resolved_by: string | null;
  resolved_at: string | null;
  resolution_note: string | null;
  created_at: string;
  reporter_username: string | null;
  reporter_name: string | null;
  reporter_avatar: string | null;
};

type ReportDetail = Report & {
  targetPreview: any;
};

const statusColors: Record<string, string> = {
  open: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  reviewing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  dismissed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
};

const targetTypeIcons: Record<string, typeof AlertTriangle> = {
  user: UserX,
  post: FileText,
  listing: FileText,
  comment: FileText,
};

export default function AdminModerationPage() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState('open');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');

  const reportsQuery = useQuery<{ ok: boolean; reports: Report[]; nextCursor: string | null }>({
    queryKey: ['/api/admin/moderation/reports', statusFilter],
    queryFn: () => fetch(`/api/admin/moderation/reports?status=${statusFilter}&limit=50`, { credentials: 'include' }).then(r => {
      if (r.status === 403) throw new Error('ADMIN_REQUIRED');
      return r.json();
    }),
  });

  const detailQuery = useQuery<{ ok: boolean; report: ReportDetail; targetPreview: any }>({
    queryKey: ['/api/admin/moderation/reports', selectedReportId],
    queryFn: () => fetch(`/api/admin/moderation/reports/${selectedReportId}`, { credentials: 'include' }).then(r => r.json()),
    enabled: !!selectedReportId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ reportId, status, resolution_note }: { reportId: string; status: string; resolution_note?: string }) =>
      apiRequest(`/api/admin/moderation/reports/${reportId}`, { method: 'PATCH', body: { status, resolution_note } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/moderation/reports'] });
      toast({ title: 'Report updated' });
    },
    onError: () => toast({ title: 'Failed to update report', variant: 'destructive' }),
  });

  const removeContentMutation = useMutation({
    mutationFn: ({ target_type, target_id, reason }: { target_type: string; target_id: string; reason: string }) =>
      apiRequest('/api/admin/moderation/actions/remove', { method: 'POST', body: { target_type, target_id, reason } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/moderation/reports'] });
      toast({ title: 'Content removed' });
    },
    onError: () => toast({ title: 'Failed to remove content', variant: 'destructive' }),
  });

  const suspendUserMutation = useMutation({
    mutationFn: ({ user_id, reason }: { user_id: string; reason: string }) =>
      apiRequest('/api/admin/moderation/actions/suspend-user', { method: 'POST', body: { user_id, reason } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/moderation/reports'] });
      toast({ title: 'User suspended' });
    },
    onError: () => toast({ title: 'Failed to suspend user', variant: 'destructive' }),
  });

  const unsuspendUserMutation = useMutation({
    mutationFn: ({ user_id }: { user_id: string }) =>
      apiRequest('/api/admin/moderation/actions/unsuspend-user', { method: 'POST', body: { user_id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/moderation/reports'] });
      toast({ title: 'User unsuspended' });
    },
    onError: () => toast({ title: 'Failed to unsuspend user', variant: 'destructive' }),
  });

  if (reportsQuery.error?.message === 'ADMIN_REQUIRED' || reportsQuery.error?.message?.includes('401')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Not Authorized</h2>
            <p className="text-muted-foreground">You do not have permission to access the moderation panel.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const reports = reportsQuery.data?.reports || [];
  console.log('[PROOF:ADMIN:UI] loaded reports', reports.length);

  const detail = detailQuery.data;
  const targetPreview = detail?.targetPreview;

  if (selectedReportId && detail) {
    const report = detail.report;
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <Button variant="ghost" className="mb-4" onClick={() => { setSelectedReportId(null); setResolutionNote(''); }}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Reports
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Report Detail</CardTitle>
              <Badge className={statusColors[report.status] || ''}>{report.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="font-medium text-muted-foreground">Type:</span> <span className="capitalize">{report.target_type}</span></div>
              <div><span className="font-medium text-muted-foreground">Reason:</span> {report.reason}</div>
              <div><span className="font-medium text-muted-foreground">Reporter:</span> {report.reporter_name || report.reporter_username || 'Unknown'}</div>
              <div><span className="font-medium text-muted-foreground">Date:</span> {new Date(report.created_at).toLocaleString()}</div>
            </div>
            {report.description && (
              <div className="bg-muted rounded-lg p-3 text-sm">
                <p className="font-medium text-muted-foreground mb-1">Description</p>
                <p>{report.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {targetPreview && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Target Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {report.target_type === 'user' && (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                    {(targetPreview.username || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{targetPreview.full_name || targetPreview.username}</p>
                    <p className="text-sm text-muted-foreground">@{targetPreview.username}</p>
                    {targetPreview.is_suspended && <Badge variant="destructive" className="mt-1">Suspended</Badge>}
                  </div>
                </div>
              )}
              {report.target_type === 'post' && (
                <div className="space-y-2">
                  <p className="text-sm">{targetPreview.content?.slice(0, 300)}{targetPreview.content?.length > 300 ? '...' : ''}</p>
                  {targetPreview.status === 'removed' && <Badge variant="destructive">Removed</Badge>}
                </div>
              )}
              {report.target_type === 'listing' && (
                <div className="space-y-2">
                  <p className="font-medium">{targetPreview.dog_name} - {targetPreview.breed}</p>
                  {targetPreview.status === 'removed' && <Badge variant="destructive">Removed</Badge>}
                </div>
              )}
              {report.target_type === 'comment' && (
                <div className="space-y-2">
                  <p className="text-sm">{targetPreview.content?.slice(0, 300)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {report.status !== 'reviewing' && (
                <Button variant="outline" size="sm" onClick={() => updateStatusMutation.mutate({ reportId: report.id, status: 'reviewing' })} disabled={updateStatusMutation.isPending}>
                  <Eye className="h-4 w-4 mr-1" /> Mark Reviewing
                </Button>
              )}
              {['post', 'listing', 'comment'].includes(report.target_type) && targetPreview?.status !== 'removed' && (
                <Button variant="destructive" size="sm" onClick={() => removeContentMutation.mutate({ target_type: report.target_type, target_id: report.target_id, reason: report.reason })} disabled={removeContentMutation.isPending}>
                  <Trash2 className="h-4 w-4 mr-1" /> Remove Content
                </Button>
              )}
              {report.target_type === 'user' && targetPreview && !targetPreview.is_suspended && (
                <Button variant="destructive" size="sm" onClick={() => suspendUserMutation.mutate({ user_id: report.target_id, reason: report.reason })} disabled={suspendUserMutation.isPending}>
                  <Ban className="h-4 w-4 mr-1" /> Suspend User
                </Button>
              )}
              {report.target_type === 'user' && targetPreview?.is_suspended && (
                <Button variant="outline" size="sm" onClick={() => unsuspendUserMutation.mutate({ user_id: report.target_id })} disabled={unsuspendUserMutation.isPending}>
                  <UserCheck className="h-4 w-4 mr-1" /> Unsuspend User
                </Button>
              )}
            </div>

            <div className="border-t pt-4 space-y-3">
              <Textarea
                placeholder="Resolution note (optional)"
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                className="min-h-[80px]"
              />
              <div className="flex gap-2">
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                  onClick={() => updateStatusMutation.mutate({ reportId: report.id, status: 'resolved', resolution_note: resolutionNote || undefined })}
                  disabled={updateStatusMutation.isPending}
                >
                  <Check className="h-4 w-4 mr-1" /> Resolve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateStatusMutation.mutate({ reportId: report.id, status: 'dismissed', resolution_note: resolutionNote || undefined })}
                  disabled={updateStatusMutation.isPending}
                >
                  <X className="h-4 w-4 mr-1" /> Dismiss
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold">Moderation Panel</h1>
          <p className="text-muted-foreground text-sm">Review and process user reports</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['open', 'reviewing', 'resolved', 'dismissed', 'all'].map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(s)}
            className={statusFilter === s ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </Button>
        ))}
      </div>

      {reportsQuery.isLoading && (
        <div className="text-center py-12 text-muted-foreground">Loading reports...</div>
      )}

      {!reportsQuery.isLoading && reports.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Check className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-lg font-medium">No {statusFilter} reports</p>
            <p className="text-muted-foreground text-sm">All clear!</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {reports.map((report) => {
          const Icon = targetTypeIcons[report.target_type] || AlertTriangle;
          return (
            <Card
              key={report.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedReportId(report.id)}
            >
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium capitalize">{report.target_type}</span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-sm text-muted-foreground truncate">{report.reason}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(report.created_at).toLocaleString()}</span>
                        <span>by {report.reporter_name || report.reporter_username || 'Anonymous'}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className={`${statusColors[report.status] || ''} flex-shrink-0 ml-2`}>{report.status}</Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
