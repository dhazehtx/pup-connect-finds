import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ChevronRight, PawPrint } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { DEAL_STATUS_LABELS, dealNextStep, formatDealAmount, type DealRole } from '@/lib/dealPresentation';

/**
 * My Deals — the authenticated user's Protected Payment transactions, both as
 * buyer and as seller. Read-only list over GET /api/deals (+ ?role=seller); the
 * server is authoritative for membership, amounts and state. Selecting a deal
 * opens its role-aware detail at /deals/:dealId.
 */

type DealRow = {
  id: string;
  status: string;
  total_price_cents: number;
  created_at: string;
  dog_name?: string | null;
  breed?: string | null;
  image_url?: string | null;
  buyer_username?: string | null;
  seller_username?: string | null;
  role: DealRole;
};

export default function MyDeals() {
  const { user } = useAuth();
  const [deals, setDeals] = useState<DealRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [asBuyer, asSeller] = await Promise.all([
          apiRequest('/api/deals'),
          apiRequest('/api/deals?role=seller'),
        ]);
        if (cancelled) return;
        const rows: DealRow[] = [
          ...(Array.isArray(asBuyer) ? asBuyer : []).map((d: any) => ({ ...d, role: 'buyer' as const })),
          ...(Array.isArray(asSeller) ? asSeller : []).map((d: any) => ({ ...d, role: 'seller' as const })),
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setDeals(rows);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Could not load your protected payments.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 pb-24">
      <div className="mb-6 flex items-center gap-3">
        <ShieldCheck className="h-7 w-7 text-emerald-600" aria-hidden />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Protected Payments</h1>
          <p className="text-sm text-gray-500">Your transactions as buyer and seller.</p>
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!error && deals === null && (
        <div className="space-y-3" aria-label="Loading deals">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      )}

      {!error && deals !== null && deals.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <PawPrint className="mx-auto mb-3 h-10 w-10 text-gray-300" aria-hidden />
          <p className="font-medium text-gray-700">No protected payments yet</p>
          <p className="mt-1 text-sm text-gray-500">
            When you buy or sell a pup with a Protected Payment, the transaction will appear here.
          </p>
          <Link
            to="/explore"
            className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Browse listings
          </Link>
        </div>
      )}

      {!error && deals !== null && deals.length > 0 && (
        <ul className="space-y-3">
          {deals.map((d) => {
            const status = DEAL_STATUS_LABELS[d.status]?.label ?? d.status;
            const next = dealNextStep(d.status, d.role);
            const other = d.role === 'buyer' ? d.seller_username : d.buyer_username;
            return (
              <li key={`${d.role}-${d.id}`}>
                <Link
                  to={`/deals/${d.id}`}
                  className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-emerald-300 hover:shadow"
                >
                  {d.image_url ? (
                    <img src={d.image_url} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                      <PawPrint className="h-7 w-7 text-gray-300" aria-hidden />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-semibold text-gray-900">{d.dog_name || 'Listing'}</span>
                      {d.breed && <span className="truncate text-sm text-gray-500">{d.breed}</span>}
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          d.role === 'buyer' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {d.role === 'buyer' ? 'Buying' : 'Selling'}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm">
                      <span className="font-medium text-emerald-700">{status}</span>
                      <span className="text-gray-700">{formatDealAmount(d.total_price_cents)}</span>
                      {other && <span className="truncate text-gray-500">with {other}</span>}
                    </div>
                    {next && <p className="mt-1 truncate text-xs text-gray-500">{next}</p>}
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-gray-400" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
