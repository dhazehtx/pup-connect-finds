import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminPageTracking } from '@/hooks/useAdminPageTracking';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Loader2, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type WaitlistRow = {
  id: string;
  provider_id: string;
  user_id: string;
  expected_litter_date: string | null;
  puppy_preference: string | null;
  notes: string | null;
  deposit_amount: string;
  deposit_status: 'pending' | 'paid' | 'refunded';
  status: 'pending' | 'approved' | 'rejected' | 'withdrew';
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  policy_acknowledged: boolean;
  created_at: string | null;
  updated_at: string | null;
  service_type: string;
  provider_verification_status: string | null;
  provider_name: string | null;
  buyer_name: string | null;
  risk_flag: number;
};

function isAdminProfile(profile: { is_admin?: boolean; role?: string } | null | undefined): boolean {
  if (!profile) return false;
  if (profile.is_admin) return true;
  return profile.role === 'admin' || profile.role === 'moderator';
}

type SortKey = 'created_desc' | 'created_asc' | 'risk_first';

export default function WhelpingWaitlistAdminPage() {
  const { user, loading, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  useAdminPageTracking('Admin — Whelping waitlist');

  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<'all' | 'flagged' | 'clean'>('all');
  const [depositFilter, setDepositFilter] = useState<'all' | 'pending' | 'paid' | 'refunded'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'withdrew'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('risk_first');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkPending, setBulkPending] = useState(false);

  React.useEffect(() => {
    if (!loading && (!user || !isAdminProfile(profile))) {
      navigate('/', { replace: true });
    }
  }, [loading, user, profile, navigate]);

  const queueQuery = useQuery({
    queryKey: ['admin', 'whelping-waitlist', 'full-page'],
    queryFn: async () => {
      const res = await apiRequest('/api/admin/whelping-waitlist');
      return (res as { success?: boolean; data?: WaitlistRow[] }).data ?? [];
    },
    enabled: Boolean(user && isAdminProfile(profile)),
    refetchInterval: 30000,
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: {
      id: string;
      status?: WaitlistRow['status'];
      deposit_status?: WaitlistRow['deposit_status'];
    }) => {
      const { id, ...body } = payload;
      return apiRequest(`/api/admin/whelping-waitlist/${id}`, {
        method: 'PATCH',
        body,
      });
    },
    onSuccess: () => {
      toast({ title: 'Updated', description: 'Waitlist entry updated successfully.' });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'whelping-waitlist'] });
    },
    onError: (err: Error) => {
      toast({
        title: 'Update failed',
        description: err.message || 'Could not update entry.',
        variant: 'destructive',
      });
    },
  });

  const rows = queueQuery.data ?? [];
  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    let next = rows.filter((row) => {
      if (riskFilter === 'flagged' && Number(row.risk_flag) !== 1) return false;
      if (riskFilter === 'clean' && Number(row.risk_flag) !== 0) return false;
      if (depositFilter !== 'all' && row.deposit_status !== depositFilter) return false;
      if (statusFilter !== 'all' && row.status !== statusFilter) return false;
      if (!q) return true;

      const haystack = [
        row.id,
        row.provider_name || '',
        row.buyer_name || '',
        row.deposit_status,
        row.status,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });

    next = [...next].sort((a, b) => {
      const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
      const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
      if (sortKey === 'created_asc') return ta - tb;
      if (sortKey === 'created_desc') return tb - ta;
      if (Number(a.risk_flag) !== Number(b.risk_flag)) return Number(b.risk_flag) - Number(a.risk_flag);
      return tb - ta;
    });
    return next;
  }, [rows, search, riskFilter, depositFilter, statusFilter, sortKey]);

  const selectedInViewCount = useMemo(() => {
    const viewIds = new Set(filteredRows.map((r) => r.id));
    return selectedIds.filter((id) => viewIds.has(id)).length;
  }, [filteredRows, selectedIds]);

  const allFilteredSelected = filteredRows.length > 0 && selectedInViewCount === filteredRows.length;

  const toggleOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) => (checked ? Array.from(new Set([...prev, id])) : prev.filter((x) => x !== id)));
  };

  const toggleAllFiltered = (checked: boolean) => {
    if (!checked) {
      const filteredSet = new Set(filteredRows.map((r) => r.id));
      setSelectedIds((prev) => prev.filter((id) => !filteredSet.has(id)));
      return;
    }
    setSelectedIds((prev) => Array.from(new Set([...prev, ...filteredRows.map((r) => r.id)])));
  };

  const runBulkUpdate = async (patch: { status?: WaitlistRow['status']; deposit_status?: WaitlistRow['deposit_status'] }) => {
    const targets = filteredRows.filter((r) => selectedIds.includes(r.id));
    if (targets.length === 0) {
      toast({ title: 'No selection', description: 'Select one or more entries first.' });
      return;
    }
    setBulkPending(true);
    try {
      await Promise.all(
        targets.map((row) =>
          apiRequest(`/api/admin/whelping-waitlist/${row.id}`, {
            method: 'PATCH',
            body: patch,
          }),
        ),
      );
      toast({ title: 'Bulk update complete', description: `${targets.length} entries updated.` });
      setSelectedIds((prev) => prev.filter((id) => !targets.some((t) => t.id === id)));
      await queryClient.invalidateQueries({ queryKey: ['admin', 'whelping-waitlist'] });
    } catch (err: any) {
      toast({
        title: 'Bulk update failed',
        description: err?.message || 'One or more updates failed.',
        variant: 'destructive',
      });
    } finally {
      setBulkPending(false);
    }
  };

  const exportCsv = () => {
    const escapeCsv = (value: unknown) => {
      const raw = value == null ? '' : String(value);
      if (/[",\n]/.test(raw)) return `"${raw.replace(/"/g, '""')}"`;
      return raw;
    };
    const headers = [
      'id',
      'buyer_name',
      'provider_name',
      'deposit_amount',
      'deposit_status',
      'status',
      'risk_flag',
      'policy_acknowledged',
      'provider_verification_status',
      'expected_litter_date',
      'created_at',
      'updated_at',
    ];
    const lines = [
      headers.join(','),
      ...filteredRows.map((row) =>
        [
          row.id,
          row.buyer_name,
          row.provider_name,
          row.deposit_amount,
          row.deposit_status,
          row.status,
          row.risk_flag,
          row.policy_acknowledged,
          row.provider_verification_status,
          row.expected_litter_date,
          row.created_at,
          row.updated_at,
        ]
          .map(escapeCsv)
          .join(','),
      ),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `whelping-waitlist-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/80 px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-start gap-3">
          <Shield className="h-10 w-10 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Whelping waitlist queue</h1>
            <p className="text-slate-600 text-sm mt-1">
              High-risk review queue with full filtering, sorting, and action controls.
            </p>
          </div>
        </div>

        <Card className="border-rose-100 bg-rose-50/40">
          <CardContent className="py-4 grid gap-3 md:grid-cols-5">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by buyer/provider/entry id"
              className="md:col-span-2"
            />
            <Select value={riskFilter} onValueChange={(v: any) => setRiskFilter(v)}>
              <SelectTrigger><SelectValue placeholder="Risk filter" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All risk states</SelectItem>
                <SelectItem value="flagged">Risk flagged only</SelectItem>
                <SelectItem value="clean">Clean only</SelectItem>
              </SelectContent>
            </Select>
            <Select value={depositFilter} onValueChange={(v: any) => setDepositFilter(v)}>
              <SelectTrigger><SelectValue placeholder="Deposit filter" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All deposits</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
              <SelectTrigger><SelectValue placeholder="Status filter" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="withdrew">Withdrew</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortKey} onValueChange={(v: SortKey) => setSortKey(v)}>
              <SelectTrigger className="md:col-span-2"><SelectValue placeholder="Sort" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="risk_first">Risk first (then newest)</SelectItem>
                <SelectItem value="created_desc">Newest first</SelectItem>
                <SelectItem value="created_asc">Oldest first</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-slate-700">
              Selected: <strong>{selectedInViewCount}</strong> of {filteredRows.length} visible entries
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={bulkPending || updateMutation.isPending}
                onClick={() => runBulkUpdate({ status: 'approved' })}
              >
                Bulk approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={bulkPending || updateMutation.isPending}
                onClick={() => runBulkUpdate({ status: 'rejected' })}
              >
                Bulk reject
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={bulkPending || updateMutation.isPending}
                onClick={() => runBulkUpdate({ deposit_status: 'refunded' })}
              >
                Bulk refund
              </Button>
              <Button size="sm" variant="outline" onClick={exportCsv}>
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={allFilteredSelected}
                onChange={(e) => toggleAllFiltered(e.target.checked)}
                aria-label="Select all filtered entries"
              />
              <span>Entries ({filteredRows.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {queueQuery.isLoading && (
              <div className="flex justify-center py-10">
                <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
              </div>
            )}

            {!queueQuery.isLoading && filteredRows.length === 0 && (
              <p className="text-sm text-muted-foreground py-6 text-center">No entries match current filters.</p>
            )}

            {filteredRows.map((row) => (
              <div key={row.id} className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
                  <div className="min-w-0 flex items-start gap-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4 mt-1"
                      checked={selectedIds.includes(row.id)}
                      onChange={(e) => toggleOne(row.id, e.target.checked)}
                      aria-label={`Select waitlist entry ${row.id}`}
                    />
                    <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">
                      Buyer: {row.buyer_name || 'Unknown'} · Provider: {row.provider_name || 'Unknown'}
                    </p>
                    <p className="text-xs text-slate-600 truncate">
                      Entry {row.id} · Created {row.created_at ? new Date(row.created_at).toLocaleString() : 'N/A'}
                    </p>
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-1 rounded ${row.risk_flag ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      {row.risk_flag ? 'Risk flagged' : 'Clean'}
                    </span>
                    <span className="px-2 py-1 rounded bg-slate-100 text-slate-800">Deposit: {row.deposit_status}</span>
                    <span className="px-2 py-1 rounded bg-slate-100 text-slate-800">Status: {row.status}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-600">
                  Amount: ${row.deposit_amount} · Policy ack: {row.policy_acknowledged ? 'yes' : 'no'} · Provider verification:{' '}
                  {row.provider_verification_status || 'unknown'}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700"
                    disabled={updateMutation.isPending}
                    onClick={() => updateMutation.mutate({ id: row.id, status: 'approved' })}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={updateMutation.isPending}
                    onClick={() => updateMutation.mutate({ id: row.id, status: 'rejected' })}
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={updateMutation.isPending}
                    onClick={() => updateMutation.mutate({ id: row.id, status: 'pending' })}
                  >
                    Mark pending
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={updateMutation.isPending}
                    onClick={() => updateMutation.mutate({ id: row.id, deposit_status: 'refunded' })}
                  >
                    Mark refunded
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

