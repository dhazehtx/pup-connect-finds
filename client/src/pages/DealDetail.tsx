import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, KeyRound, PawPrint, AlertTriangle, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  DEAL_PROGRESS_STEPS,
  DEAL_STATUS_LABELS,
  dealActions,
  dealNextStep,
  dealProgressIndex,
  formatDealAmount,
  type DealRole,
} from '@/lib/dealPresentation';

/**
 * Deal Detail — ONE role-aware Protected Payment surface for buyer and seller.
 * Reads GET /api/deals/:dealId (server enforces party membership) and offers
 * only role/state-appropriate actions, each of which is executed EXCLUSIVELY by
 * the existing authenticated Deals API. The server owns the state machine,
 * amounts and commission; the balance payment reuses the existing
 * /deals/pay?dealId= Elements leg. No admin controls are surfaced here.
 * "Protected payment" — not a regulated escrow service.
 */

type Deal = {
  id: string;
  status: string;
  buyer_id: string;
  seller_id: string;
  total_price_cents: number;
  deposit_cents: number;
  balance_cents: number;
  handoff_code?: string | null;
  dispute_window_ends?: string | null;
  dog_name?: string | null;
  breed?: string | null;
  image_url?: string | null;
  buyer_username?: string | null;
  seller_username?: string | null;
  payments?: Array<{ id: string; kind: string; amount_cents: number; status: string }>;
  payouts?: Array<{ id: string; amount_cents: number; status: string }>;
};

export default function DealDetail() {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [handoffInput, setHandoffInput] = useState('');
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeDescription, setDisputeDescription] = useState('');
  // Stripe return leg (?redirect_status=...) — informational only; the webhook
  // remains authoritative, so we show a banner and poll for the real state.
  const [paymentReturn, setPaymentReturn] = useState<string | null>(null);
  const pollTriesRef = useRef(0);
  // Seller payout readiness (server-authoritative via /api/stripe/account/status).
  const [payoutStatus, setPayoutStatus] = useState<{ payouts_enabled?: boolean } | null>(null);
  const [payoutSetupBusy, setPayoutSetupBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const d = await apiRequest(`/api/deals/${dealId}`);
      setDeal(d);
      setError(null);
      return d;
    } catch (e: any) {
      setError(e?.message || 'Could not load this transaction.');
      return null;
    }
  }, [dealId]);

  useEffect(() => {
    load();
  }, [load]);

  // Capture Stripe's redirect params once, then clean the URL. NEVER treated as
  // proof of payment — the status card only changes when the server says so.
  useEffect(() => {
    const rs = searchParams.get('redirect_status');
    if (!rs) return;
    setPaymentReturn(rs);
    pollTriesRef.current = 0;
    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);

  // While a payment is settling on the return leg, poll briefly so the
  // webhook's state lands without a manual refresh. "Settled" = the deal has
  // left RESERVED and no payment row is still pending; the banner then clears.
  useEffect(() => {
    if (!paymentReturn || paymentReturn === 'failed') return;
    const settled =
      deal && deal.status !== 'RESERVED' && !(deal.payments ?? []).some((p) => p.status === 'pending');
    if (settled) {
      setPaymentReturn(null);
      return;
    }
    if (pollTriesRef.current >= 10) return;
    const t = setTimeout(() => {
      pollTriesRef.current += 1;
      load();
    }, 3000);
    return () => clearTimeout(t);
  }, [paymentReturn, deal, load]);

  // Seller-side payout readiness: fetched once per deal so an unpayable seller
  // learns it HERE (with a fix-it path) instead of at release time.
  const isSeller = !!deal && user?.id === deal.seller_id;
  useEffect(() => {
    if (!isSeller) return;
    if (['RELEASED', 'REFUNDED', 'CANCELED', 'EXPIRED'].includes(deal!.status)) return;
    apiRequest('/api/stripe/account/status')
      .then((s) => setPayoutStatus(s))
      .catch(() => setPayoutStatus(null));
  }, [isSeller, deal?.id]);

  const startPayoutSetup = async () => {
    setPayoutSetupBusy(true);
    try {
      const r = await apiRequest('/api/payout/start', {
        method: 'POST',
        body: { returnTo: `/deals/${dealId}` },
      });
      if (r?.url) {
        window.location.href = r.url; // Stripe-hosted onboarding (no KYC in PAWS)
        return;
      }
      throw new Error('No onboarding link returned');
    } catch (e: any) {
      toast({ title: 'Could not start payout setup', description: e?.message || 'Please try again.', variant: 'destructive' });
      setPayoutSetupBusy(false);
    }
  };

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
        <Link to="/deals" className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline">
          Back to Protected Payments
        </Link>
      </div>
    );
  }
  if (!deal) {
    return (
      <div className="mx-auto max-w-2xl space-y-3 px-4 py-10" aria-label="Loading deal">
        <div className="h-40 animate-pulse rounded-xl bg-gray-100" />
        <div className="h-24 animate-pulse rounded-xl bg-gray-100" />
      </div>
    );
  }

  // Display role only — the server independently enforces party authorization.
  const role: DealRole = user?.id === deal.seller_id ? 'seller' : 'buyer';
  const statusInfo = DEAL_STATUS_LABELS[deal.status] ?? { label: deal.status, tone: 'progress' as const };
  const actions = dealActions(deal.status, role);
  const next = dealNextStep(deal.status, role);
  const progress = dealProgressIndex(deal.status);
  const other = role === 'buyer' ? deal.seller_username : deal.buyer_username;

  const act = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
      await load();
    } catch (e: any) {
      toast({ title: 'Action failed', description: e?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const confirmReceived = () =>
    act(async () => {
      await apiRequest(`/api/deals/${deal.id}/confirm-received`, { method: 'POST' });
      toast({ title: 'Confirmed', description: 'Thanks — your protection window has started.' });
    });

  const generateHandoffCode = () =>
    act(async () => {
      await apiRequest(`/api/deals/${deal.id}/handoff-code`, { method: 'POST' });
      toast({ title: 'Handoff code ready', description: 'Share it with the buyer at handoff.' });
    });

  const markDelivered = () =>
    act(async () => {
      await apiRequest(`/api/deals/${deal.id}/mark-delivered`, {
        method: 'POST',
        body: { code: handoffInput.trim().toUpperCase() },
      });
      toast({ title: 'Marked delivered', description: 'Waiting for the buyer to confirm.' });
      setHandoffInput('');
    });

  const openDispute = () =>
    act(async () => {
      await apiRequest(`/api/deals/${deal.id}/dispute`, {
        method: 'POST',
        body: { reason: disputeReason.trim(), description: disputeDescription.trim() || undefined },
      });
      toast({ title: 'Dispute opened', description: 'Our team will follow up with you.' });
      setDisputeOpen(false);
      setDisputeReason('');
      setDisputeDescription('');
    });

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 pb-24">
      <button
        type="button"
        onClick={() => navigate('/deals')}
        className="mb-4 flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={16} aria-hidden /> Protected Payments
      </button>

      {/* Stripe return-leg banner — informational; the status card below only
          changes when the server (webhook) confirms. */}
      {paymentReturn && (
        <div
          role="status"
          className={`mb-4 rounded-xl border p-4 text-sm ${
            paymentReturn === 'succeeded'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : paymentReturn === 'processing'
                ? 'border-amber-200 bg-amber-50 text-amber-900'
                : 'border-red-200 bg-red-50 text-red-900'
          }`}
        >
          {paymentReturn === 'succeeded' && (
            <>Payment received — waiting for confirmation. This page updates automatically; you don't need to pay again.</>
          )}
          {paymentReturn === 'processing' && (
            <>Your payment is processing. This page updates automatically once it's confirmed.</>
          )}
          {paymentReturn !== 'succeeded' && paymentReturn !== 'processing' && (
            <>Your payment was not completed. You can safely try again below.</>
          )}
        </div>
      )}

      {/* Listing identity */}
      <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        {deal.image_url ? (
          <img src={deal.image_url} alt="" className="h-20 w-20 shrink-0 rounded-lg object-cover" />
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-gray-100">
            <PawPrint className="h-8 w-8 text-gray-300" aria-hidden />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-gray-900">{deal.dog_name || 'Listing'}</h1>
          {deal.breed && <p className="truncate text-sm text-gray-500">{deal.breed}</p>}
          <p className="mt-1 text-sm text-gray-600">
            {role === 'buyer' ? 'Buying' : 'Selling'}
            {other ? ` · with ${other}` : ''} · <span className="font-semibold">{formatDealAmount(deal.total_price_cents)}</span>
          </p>
        </div>
      </div>

      {/* Status + progress */}
      <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldCheck className={`h-5 w-5 ${statusInfo.tone === 'warn' ? 'text-red-500' : 'text-emerald-600'}`} aria-hidden />
          <span className="font-semibold text-gray-900">{statusInfo.label}</span>
        </div>
        {progress >= 0 && (
          <ol className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs" aria-label="Transaction progress">
            {DEAL_PROGRESS_STEPS.map((step, i) => (
              <li key={step} className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 font-medium ${
                    i < progress ? 'bg-emerald-100 text-emerald-700' : i === progress ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {step}
                </span>
                {i < DEAL_PROGRESS_STEPS.length - 1 && <span className="text-gray-300">›</span>}
              </li>
            ))}
          </ol>
        )}
        {next && <p className="mt-3 text-sm text-gray-600">{next}</p>}
        {deal.status === 'DELIVERED_CONFIRMED' && deal.dispute_window_ends && (
          <p className="mt-1 text-xs text-gray-500">
            Protection window ends {new Date(deal.dispute_window_ends).toLocaleString()}.
          </p>
        )}
        {/* Payment progress (no Stripe identifiers exposed) */}
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
          <div className="rounded-lg bg-gray-50 p-2">
            <p className="text-xs text-gray-500">Deposit</p>
            <p className="font-medium text-gray-900">{formatDealAmount(deal.deposit_cents)}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-2">
            <p className="text-xs text-gray-500">Balance</p>
            <p className="font-medium text-gray-900">{formatDealAmount(deal.balance_cents)}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-2">
            <p className="text-xs text-gray-500">Total</p>
            <p className="font-medium text-gray-900">{formatDealAmount(deal.total_price_cents)}</p>
          </div>
        </div>
      </div>

      {/* Handoff code — shown to BOTH parties once generated */}
      {deal.handoff_code && ['PAID_IN_FULL', 'DELIVERED_PENDING_CONFIRM'].includes(deal.status) && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-amber-800">
            <KeyRound className="h-4 w-4" aria-hidden />
            <span className="text-sm font-semibold">Handoff code</span>
          </div>
          <p className="mt-2 font-mono text-2xl font-bold tracking-widest text-amber-900">{deal.handoff_code}</p>
          <p className="mt-1 text-xs text-amber-700">
            {role === 'buyer'
              ? 'Show this code to the seller when you receive your pup.'
              : 'Enter this code below when you hand the pup to the buyer.'}
          </p>
        </div>
      )}

      {/* Seller payout readiness + payout records. The server independently
          blocks release for unpayable sellers; this surfaces it with a fix. */}
      {role === 'seller' && payoutStatus && payoutStatus.payouts_enabled !== true &&
        !['RELEASED', 'REFUNDED', 'CANCELED', 'EXPIRED'].includes(deal.status) && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-2 text-amber-800">
              <Banknote className="h-4 w-4" aria-hidden />
              <span className="text-sm font-semibold">Payout setup needed</span>
            </div>
            <p className="mt-1 text-sm text-amber-800">
              Your funds can't be released until your payout account is set up with Stripe. It only takes a few
              minutes and you'll come right back here.
            </p>
            <Button
              className="mt-3 min-h-[44px] w-full bg-amber-600 font-semibold text-white hover:bg-amber-700"
              disabled={payoutSetupBusy}
              onClick={startPayoutSetup}
            >
              {payoutSetupBusy ? 'Opening Stripe…' : 'Set up payouts with Stripe'}
            </Button>
          </div>
        )}

      {role === 'seller' && (deal.payouts?.length ?? 0) > 0 && (
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-900">Your payout</p>
          {deal.payouts!.map((p) => (
            <div key={p.id} className="mt-2 flex items-center justify-between text-sm">
              <span className="font-medium text-gray-900">{formatDealAmount(p.amount_cents)}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  p.status === 'completed'
                    ? 'bg-emerald-100 text-emerald-700'
                    : p.status === 'reversed' || p.status === 'failed'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-600'
                }`}
              >
                {p.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Role-aware actions (server enforces every transition) */}
      <div className="mt-4 space-y-3">
        {role === 'buyer' && actions.includes('pay_balance') && (
          <Button
            className="min-h-[44px] w-full bg-emerald-600 font-semibold text-white hover:bg-emerald-700"
            onClick={() => navigate(`/deals/pay?dealId=${deal.id}`)}
          >
            Pay remaining balance ({formatDealAmount(deal.balance_cents)})
          </Button>
        )}

        {role === 'buyer' && actions.includes('confirm_received') && (
          <Button
            className="min-h-[44px] w-full bg-blue-600 font-semibold text-white hover:bg-blue-700"
            disabled={busy}
            onClick={confirmReceived}
          >
            Confirm received
          </Button>
        )}

        {role === 'seller' && actions.includes('generate_handoff_code') && !deal.handoff_code && (
          <Button
            className="min-h-[44px] w-full bg-blue-600 font-semibold text-white hover:bg-blue-700"
            disabled={busy}
            onClick={generateHandoffCode}
          >
            Generate handoff code
          </Button>
        )}

        {role === 'seller' && actions.includes('mark_delivered') && deal.handoff_code && (
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <label htmlFor="handoff-code" className="text-sm font-medium text-gray-700">
              Enter the handoff code to mark delivered
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="handoff-code"
                value={handoffInput}
                onChange={(e) => setHandoffInput(e.target.value)}
                placeholder="e.g. 1A2B3C4D"
                className="min-h-[44px] flex-1 rounded-lg border border-gray-300 px-3 font-mono uppercase tracking-widest"
                autoComplete="off"
              />
              <Button
                className="min-h-[44px] bg-blue-600 font-semibold text-white hover:bg-blue-700"
                disabled={busy || handoffInput.trim().length === 0}
                onClick={markDelivered}
              >
                Mark delivered
              </Button>
            </div>
          </div>
        )}

        {role === 'buyer' && actions.includes('open_dispute') && !disputeOpen && (
          <Button
            variant="outline"
            className="min-h-[44px] w-full border-red-200 font-medium text-red-600 hover:bg-red-50"
            onClick={() => setDisputeOpen(true)}
          >
            <AlertTriangle size={16} className="mr-2" aria-hidden />
            Open a dispute
          </Button>
        )}

        {disputeOpen && (
          <div className="rounded-xl border border-red-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-gray-900">Open a dispute</p>
            <label htmlFor="dispute-reason" className="mt-3 block text-sm text-gray-700">
              Reason (required)
            </label>
            <input
              id="dispute-reason"
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="What went wrong?"
              className="mt-1 min-h-[44px] w-full rounded-lg border border-gray-300 px-3"
            />
            <label htmlFor="dispute-description" className="mt-3 block text-sm text-gray-700">
              Details (optional)
            </label>
            <textarea
              id="dispute-description"
              value={disputeDescription}
              onChange={(e) => setDisputeDescription(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            />
            <div className="mt-3 flex gap-2">
              <Button
                className="min-h-[44px] flex-1 bg-red-600 font-semibold text-white hover:bg-red-700"
                disabled={busy || disputeReason.trim().length === 0}
                onClick={openDispute}
              >
                Submit dispute
              </Button>
              <Button variant="outline" className="min-h-[44px]" disabled={busy} onClick={() => setDisputeOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      <p className="mt-6 text-xs text-gray-400">
        Payments are securely processed by Stripe. This is a protected payment — not a regulated escrow
        service. Funds are released to the seller only after the transaction is confirmed.
      </p>
    </div>
  );
}
