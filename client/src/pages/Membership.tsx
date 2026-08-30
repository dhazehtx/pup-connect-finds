import React, { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';

/**
 * PAWS Membership — the single reachable membership purchase/management page.
 * Membership is granted by the Stripe webhook, NOT by this page or the success
 * redirect; here we only show plans + the caller's authoritative status (fetched
 * from the server) and start Stripe TEST checkout / manage the caller's own plan.
 */

interface Plan {
  tier: string;
  entitlement: string;
  interval: string;
}
interface MembershipStatus {
  tier: string | null;
  status: string;
  active: boolean;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
}

const TIER_LABELS: Record<string, string> = { pro: 'Pup Pro', business: 'Pup Partner' };

const Membership = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [configured, setConfigured] = useState(true);
  const [status, setStatus] = useState<MembershipStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [plansRes, statusRes] = await Promise.all([
        apiRequest('/api/membership/plans'),
        apiRequest('/api/membership/status'),
      ]);
      setPlans(plansRes.plans || []);
      setConfigured(Boolean(plansRes.configured));
      setStatus(statusRes);
    } catch {
      setError('Could not load membership information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const subscribe = async (tier: string) => {
    setBusy(tier);
    setError(null);
    try {
      const res = await apiRequest('/api/membership/checkout', { method: 'POST', body: { tier } });
      if (res?.url) window.location.href = res.url; // to Stripe TEST checkout
      else setError('Membership is not available right now.');
    } catch {
      setError('Could not start checkout. Please try again.');
      setBusy(null);
    }
  };

  const cancel = async () => {
    setBusy('cancel');
    setError(null);
    try {
      await apiRequest('/api/membership/cancel', { method: 'POST' });
      await load();
    } catch {
      setError('Could not cancel membership. Please try again.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-semibold text-slate-900">PAWS Membership</h1>
      <p className="mb-6 text-sm text-slate-600">
        Upgrade your PAWS account. Billing is handled securely by Stripe.
      </p>

      {error && (
        <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : (
        <>
          {status?.active && (
            <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="font-medium text-emerald-900">
                Active membership: {TIER_LABELS[status.tier || ''] || status.tier}
              </p>
              <p className="mt-1 text-sm text-emerald-800">
                Status: {status.status}
                {status.cancelAtPeriodEnd ? ' · cancels at period end' : ''}
                {status.currentPeriodEnd
                  ? ` · renews/ends ${new Date(status.currentPeriodEnd).toLocaleDateString()}`
                  : ''}
              </p>
              {!status.cancelAtPeriodEnd && (
                <button
                  type="button"
                  onClick={cancel}
                  disabled={busy === 'cancel'}
                  className="mt-3 rounded-lg border border-emerald-300 px-3 py-1.5 text-sm font-medium text-emerald-900 hover:bg-emerald-100 disabled:opacity-50"
                >
                  {busy === 'cancel' ? 'Cancelling…' : 'Cancel at period end'}
                </button>
              )}
            </div>
          )}

          {!configured || plans.length === 0 ? (
            <p className="text-sm text-slate-500">
              Membership plans are not available yet. Please check back soon.
            </p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {plans.map((p) => {
                const isCurrent = status?.active && status.tier === p.tier;
                return (
                  <li key={p.tier} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-900">
                      {TIER_LABELS[p.tier] || p.tier}
                    </h2>
                    <p className="mb-4 text-sm text-slate-500">Billed per {p.interval}</p>
                    <button
                      type="button"
                      onClick={() => subscribe(p.tier)}
                      disabled={!!busy || isCurrent}
                      className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isCurrent ? 'Current plan' : busy === p.tier ? 'Starting…' : 'Subscribe'}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default Membership;
