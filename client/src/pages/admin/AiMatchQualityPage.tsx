import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/api';
import { ArrowLeft, RefreshCw, Play, Radio, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

type DailyRow = {
  metric_day: string;
  total_requests: number;
  visual_requests: number;
  fallback_requests: number;
  empty_requests: number;
  avg_top_match_score: number | null;
  fallback_rate: number | null;
  empty_rate: number | null;
};

type AlertRow = {
  metric_day: string;
  alert_type: string;
  severity: string;
  message: string;
  created_at: string;
};

export default function AiMatchQualityPage() {
  const { user, loading, profile } = useAuth();
  const [daily, setDaily] = React.useState<DailyRow[]>([]);
  const [alerts, setAlerts] = React.useState<AlertRow[]>([]);
  const [err, setErr] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [testResult, setTestResult] = React.useState<Record<string, unknown> | null>(null);

  const load = React.useCallback(async () => {
    setErr(null);
    try {
      const [d, a] = await Promise.all([
        apiRequest('/api/admin/ai-match-quality/daily?days=30') as Promise<{
          ok: boolean;
          metrics: DailyRow[];
        }>,
        apiRequest('/api/admin/ai-match-quality/alerts?days=30') as Promise<{
          ok: boolean;
          alerts: AlertRow[];
        }>,
      ]);
      setDaily(d.metrics || []);
      setAlerts(a.alerts || []);
    } catch (e: unknown) {
      setErr((e as Error)?.message || 'Failed to load');
    }
  }, []);

  React.useEffect(() => {
    if (!loading && user && profile?.is_admin) void load();
  }, [loading, user, profile?.is_admin, load]);

  if (loading || !user || !profile?.is_admin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <p className="text-gray-600">Loading…</p>
      </div>
    );
  }

  async function runNightly() {
    setBusy('nightly');
    setErr(null);
    try {
      await apiRequest('/api/admin/ai-match-quality/run-nightly', { method: 'POST' });
      await load();
    } catch (e: unknown) {
      setErr((e as Error)?.message || 'Run failed');
    } finally {
      setBusy(null);
    }
  }

  async function testOutbound() {
    setBusy('test');
    setErr(null);
    setTestResult(null);
    try {
      const r = (await apiRequest('/api/admin/ai-match-quality/test-outbound', {
        method: 'POST',
      })) as { ok: boolean; result: Record<string, unknown> };
      setTestResult(r.result || null);
    } catch (e: unknown) {
      setErr((e as Error)?.message || 'Test failed');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-blue-700 hover:underline mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Admin
          </Link>
          <div className="flex items-center gap-3">
            <Activity className="w-9 h-9 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Match — quality monitor</h1>
              <p className="text-gray-600 text-sm">
                Daily rollups, threshold alerts, and optional Slack/email pings. Configure{' '}
                <code className="text-xs bg-gray-100 px-1 rounded">AI_MATCH_MONITOR_WEBHOOK_URL</code> or email
                in server env.
              </p>
            </div>
          </div>
        </div>

        {err && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{err}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-6">
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={!!busy}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="default" size="sm" onClick={() => void runNightly()} disabled={!!busy}>
            <Play className="w-4 h-4 mr-2" />
            {busy === 'nightly' ? 'Running…' : 'Run nightly rollup'}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => void testOutbound()} disabled={!!busy}>
            <Radio className="w-4 h-4 mr-2" />
            {busy === 'test' ? 'Testing…' : 'Test webhook / email'}
          </Button>
        </div>

        {testResult && (
          <Card className="mb-6 border-blue-200 bg-blue-50/50">
            <CardHeader className="py-3">
              <CardTitle className="text-base">Test outbound result</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs overflow-auto bg-white p-3 rounded border">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Daily metrics (last 30 days)</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {daily.length === 0 ? (
                <p className="text-sm text-gray-500">No rows yet. Use AI Match traffic or “Run nightly rollup.”</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="pb-2 pr-2">Day (UTC)</th>
                      <th className="pb-2 pr-2">Requests</th>
                      <th className="pb-2 pr-2">Visual</th>
                      <th className="pb-2 pr-2">Fallback</th>
                      <th className="pb-2">Empty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {daily.map((row) => (
                      <tr key={row.metric_day} className="border-b border-gray-100">
                        <td className="py-2 pr-2 whitespace-nowrap">
                          {new Date(row.metric_day).toISOString().slice(0, 10)}
                        </td>
                        <td className="py-2 pr-2">{row.total_requests}</td>
                        <td className="py-2 pr-2">{row.visual_requests}</td>
                        <td className="py-2 pr-2">{row.fallback_requests}</td>
                        <td className="py-2">{row.empty_requests}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Threshold alerts</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {alerts.length === 0 ? (
                <p className="text-sm text-gray-500">No alerts yet (or thresholds not breached).</p>
              ) : (
                <ul className="space-y-3 text-sm">
                  {alerts.map((a) => (
                    <li key={`${a.alert_type}-${a.created_at}`} className="border-b border-gray-100 pb-2">
                      <div className="font-medium text-gray-900">{a.alert_type}</div>
                      <div className="text-gray-600">{a.message}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(a.created_at).toLocaleString()}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
