import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Shield, AlertTriangle, X, Eye, Check, Ban, Trash2,
  UserX, UserCheck, ChevronLeft, Clock, FileText,
  Search, Unlink, Activity, HardDrive, Loader2
} from 'lucide-react';

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

const statusColors: Record<string, string> = {
  open: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  reviewing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  dismissed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
};

const tabs = [
  { key: 'reports', label: 'Reports', icon: AlertTriangle },
  { key: 'blocks', label: 'Blocks', icon: Ban },
  { key: 'media', label: 'Media', icon: HardDrive },
  { key: 'ratelimits', label: 'Rate Limits', icon: Activity },
] as const;

type TabKey = typeof tabs[number]['key'];

function ReportsTab() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState('open');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [confirmAction, setConfirmAction] = useState<{ action: string; label: string } | null>(null);

  const reportsQuery = useQuery<{ ok: boolean; reports: Report[] }>({
    queryKey: ['/api/admin/moderation/reports', statusFilter],
    queryFn: () => fetch(`/api/admin/moderation/reports?status=${statusFilter}&limit=50`, { credentials: 'include' }).then(r => {
      if (r.status === 403 || r.status === 401) throw new Error('ADMIN_REQUIRED');
      return r.json();
    }),
  });

  const detailQuery = useQuery<{ ok: boolean; report: any; targetPreview: any }>({
    queryKey: ['/api/admin/moderation/reports', selectedReportId],
    queryFn: () => fetch(`/api/admin/moderation/reports/${selectedReportId}`, { credentials: 'include' }).then(r => r.json()),
    enabled: !!selectedReportId,
  });

  const resolveMutation = useMutation({
    mutationFn: ({ reportId, action, note }: { reportId: string; action: string; note?: string }) =>
      apiRequest(`/api/admin/moderation/reports/${reportId}/resolve`, { method: 'POST', body: { action, note } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/moderation/reports'] });
      toast({ title: 'Report resolved' });
      setSelectedReportId(null);
      setConfirmAction(null);
      setResolutionNote('');
    },
    onError: (err: any) => toast({ title: `Failed: ${err?.message || 'Unknown error'}`, variant: 'destructive' }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ reportId, status }: { reportId: string; status: string }) =>
      apiRequest(`/api/admin/moderation/reports/${reportId}`, { method: 'PATCH', body: { status } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/moderation/reports'] });
      toast({ title: 'Status updated' });
    },
    onError: () => toast({ title: 'Failed to update', variant: 'destructive' }),
  });

  const reportsList = reportsQuery.data?.reports || [];
  console.log('[PROOF:ADMIN:UI] loaded reports', reportsList.length);

  if (selectedReportId && detailQuery.data) {
    const report = detailQuery.data.report;
    const tp = detailQuery.data.targetPreview;

    if (confirmAction) {
      return (
        <div className="max-w-lg mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Confirm: {confirmAction.label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Are you sure you want to <strong>{confirmAction.label.toLowerCase()}</strong>? This action cannot be undone.</p>
              <Textarea placeholder="Resolution note (optional)" value={resolutionNote} onChange={(e) => setResolutionNote(e.target.value)} className="min-h-[80px]" />
              <div className="flex gap-2">
                <Button variant="destructive" onClick={() => resolveMutation.mutate({ reportId: selectedReportId!, action: confirmAction.action, note: resolutionNote || undefined })} disabled={resolveMutation.isPending}>
                  {resolveMutation.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
                  Confirm
                </Button>
                <Button variant="outline" onClick={() => setConfirmAction(null)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div>
        <Button variant="ghost" className="mb-4" onClick={() => { setSelectedReportId(null); setResolutionNote(''); }}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <Card className="mb-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Report Detail</CardTitle>
              <Badge className={statusColors[report.status] || ''}>{report.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="font-medium text-muted-foreground">Type:</span> <span className="capitalize">{report.target_type}</span></div>
              <div><span className="font-medium text-muted-foreground">Reason:</span> {report.reason}</div>
              <div><span className="font-medium text-muted-foreground">Reporter:</span> {report.reporter_name || report.reporter_username || 'Unknown'}</div>
              <div><span className="font-medium text-muted-foreground">Date:</span> {new Date(report.created_at).toLocaleString()}</div>
            </div>
            {report.description && <div className="bg-muted rounded-lg p-3 text-sm"><p className="font-medium text-muted-foreground mb-1">Description</p><p>{report.description}</p></div>}
          </CardContent>
        </Card>

        {tp && (
          <Card className="mb-4">
            <CardHeader><CardTitle className="text-sm">Target Preview</CardTitle></CardHeader>
            <CardContent>
              {report.target_type === 'user' && <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">{(tp.username || '?')[0].toUpperCase()}</div><div><p className="font-medium">{tp.full_name || tp.username}</p>{tp.is_suspended && <Badge variant="destructive" className="mt-1">Suspended</Badge>}</div></div>}
              {report.target_type === 'post' && <div><p className="text-sm">{tp.content?.slice(0, 300)}</p>{tp.status === 'removed' && <Badge variant="destructive" className="mt-1">Removed</Badge>}</div>}
              {report.target_type === 'listing' && <div><p className="font-medium">{tp.dog_name} - {tp.breed}</p>{tp.status === 'removed' && <Badge variant="destructive" className="mt-1">Removed</Badge>}</div>}
              {report.target_type === 'comment' && <p className="text-sm">{tp.content?.slice(0, 300)}</p>}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle className="text-sm">Actions</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {report.status !== 'reviewing' && (
                <Button variant="outline" size="sm" onClick={() => updateStatusMutation.mutate({ reportId: report.id, status: 'reviewing' })} disabled={updateStatusMutation.isPending}>
                  <Eye className="h-4 w-4 mr-1" /> Mark Reviewing
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setConfirmAction({ action: 'dismiss', label: 'Dismiss Report' })}>
                <X className="h-4 w-4 mr-1" /> Dismiss
              </Button>
              <Button variant="outline" size="sm" onClick={() => setConfirmAction({ action: 'warn', label: 'Warn User' })}>
                <AlertTriangle className="h-4 w-4 mr-1" /> Warn
              </Button>
              {report.target_type === 'post' && (
                <Button variant="destructive" size="sm" onClick={() => setConfirmAction({ action: 'remove_post', label: 'Remove Post' })}>
                  <Trash2 className="h-4 w-4 mr-1" /> Remove Post
                </Button>
              )}
              {report.target_type === 'listing' && (
                <Button variant="destructive" size="sm" onClick={() => setConfirmAction({ action: 'remove_listing', label: 'Remove Listing' })}>
                  <Trash2 className="h-4 w-4 mr-1" /> Remove Listing
                </Button>
              )}
              {report.target_type === 'user' && (
                <Button variant="destructive" size="sm" onClick={() => setConfirmAction({ action: 'ban_user', label: 'Ban User' })}>
                  <Ban className="h-4 w-4 mr-1" /> Ban User
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {['open', 'reviewing', 'resolved', 'dismissed', 'all'].map((s) => (
          <Button key={s} variant={statusFilter === s ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter(s)} className={statusFilter === s ? 'bg-blue-600 hover:bg-blue-700' : ''}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </Button>
        ))}
      </div>

      {reportsQuery.isLoading && <div className="text-center py-12 text-muted-foreground">Loading reports...</div>}
      {!reportsQuery.isLoading && reportsList.length === 0 && (
        <Card className="text-center py-12"><CardContent><Check className="h-12 w-12 text-green-500 mx-auto mb-3" /><p className="text-lg font-medium">No {statusFilter} reports</p></CardContent></Card>
      )}
      <div className="space-y-2">
        {reportsList.map((report) => (
          <Card key={report.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedReportId(report.id)}>
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-4 w-4 text-red-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium capitalize text-sm">{report.target_type}</span>
                      <span className="text-muted-foreground text-xs">·</span>
                      <span className="text-xs text-muted-foreground truncate">{report.reason}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(report.created_at).toLocaleDateString()}</span>
                      <span>by {report.reporter_name || report.reporter_username || 'Anon'}</span>
                    </div>
                  </div>
                </div>
                <Badge className={`${statusColors[report.status] || ''} flex-shrink-0 ml-2 text-xs`}>{report.status}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function BlocksTab() {
  const { toast } = useToast();
  const [searchUserId, setSearchUserId] = useState('');
  const [activeUserId, setActiveUserId] = useState('');

  const blocksQuery = useQuery<{ ok: boolean; blockedByUser: any[]; blockedByOthers: any[] }>({
    queryKey: ['/api/admin/moderation/blocks', activeUserId],
    queryFn: () => fetch(`/api/admin/moderation/blocks?userId=${activeUserId}&limit=50`, { credentials: 'include' }).then(r => r.json()),
    enabled: !!activeUserId,
  });

  const unblockMutation = useMutation({
    mutationFn: ({ blockerId, blockedId }: { blockerId: string; blockedId: string }) =>
      apiRequest('/api/admin/moderation/blocks/unblock', { method: 'POST', body: { blockerId, blockedId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/moderation/blocks'] });
      toast({ title: 'Block removed' });
    },
    onError: (err: any) => toast({ title: `Unblock failed: ${err?.message || 'error'}`, variant: 'destructive' }),
  });

  const blockedByUser = blocksQuery.data?.blockedByUser || [];
  const blockedByOthers = blocksQuery.data?.blockedByOthers || [];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input placeholder="Enter User ID to search..." value={searchUserId} onChange={(e) => setSearchUserId(e.target.value)} className="max-w-md" />
        <Button onClick={() => setActiveUserId(searchUserId.trim())} disabled={!searchUserId.trim()}>
          <Search className="h-4 w-4 mr-1" /> Search
        </Button>
      </div>

      {!activeUserId && <p className="text-muted-foreground text-sm py-8 text-center">Enter a User ID to view their block relationships.</p>}

      {blocksQuery.isLoading && <div className="text-center py-8 text-muted-foreground">Loading...</div>}

      {activeUserId && !blocksQuery.isLoading && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Blocked by this user ({blockedByUser.length})</CardTitle></CardHeader>
            <CardContent>
              {blockedByUser.length === 0 ? <p className="text-muted-foreground text-sm">None</p> : (
                <div className="space-y-2">
                  {blockedByUser.map((b: any) => (
                    <div key={b.id} className="flex items-center justify-between text-sm border rounded-lg p-2">
                      <div>
                        <span className="font-medium">{b.blocked_username || b.blocked_id}</span>
                        {b.blocked_name && <span className="text-muted-foreground ml-1">({b.blocked_name})</span>}
                        <div className="text-xs text-muted-foreground">{new Date(b.created_at).toLocaleDateString()}</div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => unblockMutation.mutate({ blockerId: b.blocker_id, blockedId: b.blocked_id })} disabled={unblockMutation.isPending}>
                        <Unlink className="h-3 w-3 mr-1" /> Unblock
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Blocked by others ({blockedByOthers.length})</CardTitle></CardHeader>
            <CardContent>
              {blockedByOthers.length === 0 ? <p className="text-muted-foreground text-sm">None</p> : (
                <div className="space-y-2">
                  {blockedByOthers.map((b: any) => (
                    <div key={b.id} className="flex items-center justify-between text-sm border rounded-lg p-2">
                      <div>
                        <span className="font-medium">{b.blocker_username || b.blocker_id}</span>
                        {b.blocker_name && <span className="text-muted-foreground ml-1">({b.blocker_name})</span>}
                        <div className="text-xs text-muted-foreground">{new Date(b.created_at).toLocaleDateString()}</div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => unblockMutation.mutate({ blockerId: b.blocker_id, blockedId: b.blocked_id })} disabled={unblockMutation.isPending}>
                        <Unlink className="h-3 w-3 mr-1" /> Unblock
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function MediaTab() {
  const { toast } = useToast();

  const orphansQuery = useQuery<{ ok: boolean; orphans: any[]; scanned: number }>({
    queryKey: ['/api/admin/moderation/media/orphans'],
    queryFn: () => fetch('/api/admin/moderation/media/orphans?limit=200', { credentials: 'include' }).then(r => r.json()),
  });

  const sweepMutation = useMutation({
    mutationFn: () => apiRequest('/api/admin/moderation/media/sweep-orphans', { method: 'POST' }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/moderation/media/orphans'] });
      toast({ title: `Sweep complete: ${data.deletedDb || 0} DB rows, ${data.deletedStorage || 0} storage files removed` });
    },
    onError: (err: any) => toast({ title: `Sweep failed: ${err?.message || 'error'}`, variant: 'destructive' }),
  });

  const orphans = orphansQuery.data?.orphans || [];
  const scanned = orphansQuery.data?.scanned || 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Scanned {scanned} media assets, found {orphans.length} orphans</p>
        </div>
        <Button variant="destructive" size="sm" onClick={() => sweepMutation.mutate()} disabled={sweepMutation.isPending || orphans.length === 0}>
          {sweepMutation.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Trash2 className="h-4 w-4 mr-1" />}
          Run Sweep
        </Button>
      </div>

      {orphansQuery.isLoading && <div className="text-center py-8 text-muted-foreground">Scanning...</div>}

      {!orphansQuery.isLoading && orphans.length === 0 && (
        <Card className="text-center py-12"><CardContent><Check className="h-12 w-12 text-green-500 mx-auto mb-3" /><p className="font-medium">No orphaned media found</p></CardContent></Card>
      )}

      {orphans.length > 0 && (
        <div className="space-y-2">
          {orphans.map((o: any) => (
            <Card key={o.id}>
              <CardContent className="py-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="min-w-0">
                    <p className="font-mono text-xs truncate">{o.path}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <span>Bucket: {o.bucket}</span>
                      <span>·</span>
                      <span>Type: {o.parent_type || 'none'}</span>
                      <span>·</span>
                      <span>Reason: {o.reason}</span>
                      {o.size_bytes && <><span>·</span><span>{Math.round(o.size_bytes / 1024)}KB</span></>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function RateLimitsTab() {
  const rateLimitsQuery = useQuery<{ ok: boolean; rateLimits: Record<string, { triggeredCount: number; lastTriggered: number | null; activeUsers: number }> }>({
    queryKey: ['/api/admin/moderation/rate-limits'],
    queryFn: () => fetch('/api/admin/moderation/rate-limits', { credentials: 'include' }).then(r => r.json()),
    refetchInterval: 15000,
  });

  const stats = rateLimitsQuery.data?.rateLimits || {};
  const keys = Object.keys(stats);

  return (
    <div className="space-y-4">
      {rateLimitsQuery.isLoading && <div className="text-center py-8 text-muted-foreground">Loading...</div>}

      {keys.length === 0 && !rateLimitsQuery.isLoading && (
        <Card className="text-center py-12"><CardContent><Activity className="h-12 w-12 text-blue-400 mx-auto mb-3" /><p className="font-medium">No rate limit activity yet</p><p className="text-sm text-muted-foreground">Stats appear once rate-limited routes are hit</p></CardContent></Card>
      )}

      {keys.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {keys.map((key) => {
            const s = stats[key];
            return (
              <Card key={key}>
                <CardContent className="pt-4">
                  <p className="font-medium capitalize mb-2">{key}</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Triggers</span>
                      <span className={s.triggeredCount > 0 ? 'text-red-600 font-medium' : ''}>{s.triggeredCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Active users</span>
                      <span>{s.activeUsers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last triggered</span>
                      <span className="text-xs">{s.lastTriggered ? new Date(s.lastTriggered).toLocaleString() : 'Never'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminConsolePage() {
  const [activeTab, setActiveTab] = useState<TabKey>('reports');

  const reportsCheck = useQuery<any>({
    queryKey: ['/api/admin/moderation/reports', '__auth_check'],
    queryFn: () => fetch('/api/admin/moderation/reports?status=open&limit=1', { credentials: 'include' }).then(r => {
      if (r.status === 403 || r.status === 401) throw new Error('ADMIN_REQUIRED');
      return r.json();
    }),
    retry: false,
  });

  if (reportsCheck.error?.message === 'ADMIN_REQUIRED') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Not Authorized</h2>
            <p className="text-muted-foreground">You do not have permission to access the admin console.</p>
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
          <h1 className="text-2xl font-bold">Admin Console</h1>
          <p className="text-muted-foreground text-sm">Reports, Blocks, Media & Rate Limits</p>
        </div>
      </div>

      <div className="flex gap-1 mb-6 border-b">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'reports' && <ReportsTab />}
      {activeTab === 'blocks' && <BlocksTab />}
      {activeTab === 'media' && <MediaTab />}
      {activeTab === 'ratelimits' && <RateLimitsTab />}
    </div>
  );
}
