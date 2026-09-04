import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

/**
 * Reusable Stripe Elements confirmation for a server-created PaymentIntent
 * (service bookings and breeder Deals). The client only ever receives a
 * clientSecret — never a secret key, amount, or destination. The UI CANNOT mark
 * anything paid/released: it confirms the PaymentIntent with Stripe and the
 * canonical webhook remains the sole authority for financial state. Duplicate
 * initialization is guarded, and declined/processing/success are handled honestly.
 */

const pubKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY as string | undefined;
const stripePromise = pubKey ? loadStripe(pubKey) : null;

interface CreateIntentResult {
  clientSecret: string;
  amountCents?: number;
  /** Optional server-derived override for the post-confirmation return page
   *  (e.g. the deal detail screen, once the deal id is known). */
  returnPath?: string;
}

interface ProtectedPaymentFormProps {
  /** Server call that creates the PaymentIntent and returns its clientSecret. */
  createIntent: () => Promise<CreateIntentResult>;
  title: string;
  description?: string;
  /** Path Stripe redirects back to after confirmation (this page handles the return). */
  returnPath: string;
  ctaLabel?: string;
  /** Reassurance line; use "protected payment" language for breeder. */
  protectionNote?: string;
  /** Label the amount line (e.g. "20% deposit"), so a partial charge is never
   *  mistaken for the full price. */
  amountLabel?: string;
}

/** apiRequest errors read "API request failed 409: {json}" — surface the
 *  server's own message/code instead of a generic failure. */
function parseApiError(e: any): { message: string; code?: string; dealId?: string } {
  const fallback = { message: 'Could not start payment. Please try again.' };
  const raw = e?.message as string | undefined;
  if (!raw) return fallback;
  const jsonStart = raw.indexOf('{');
  if (jsonStart === -1) return fallback;
  try {
    const parsed = JSON.parse(raw.slice(jsonStart));
    return {
      message: typeof parsed.error === 'string' ? parsed.error : fallback.message,
      code: parsed.code,
      dealId: parsed.dealId,
    };
  } catch {
    return fallback;
  }
}

function StatusView({ status, dealId }: { status: string; dealId?: string | null }) {
  const map: Record<string, { title: string; body: string; tone: string }> = {
    succeeded: {
      title: 'Payment received',
      body: "We're finalizing your transaction. This updates automatically once Stripe confirms it — you don't need to pay again.",
      tone: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    },
    processing: {
      title: 'Payment processing',
      body: 'Your payment is processing. This page will reflect the final status once confirmed.',
      tone: 'border-amber-200 bg-amber-50 text-amber-900',
    },
  };
  const s = map[status] ?? {
    title: 'Payment not completed',
    body: 'Your payment was not completed. You can safely try again.',
    tone: 'border-red-200 bg-red-50 text-red-900',
  };
  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div role="status" className={`rounded-xl border p-5 ${s.tone}`}>
        <h1 className="text-lg font-semibold">{s.title}</h1>
        <p className="mt-1 text-sm">{s.body}</p>
      </div>
      <Link
        to={dealId ? `/deals/${dealId}` : '/deals'}
        className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
      >
        {dealId ? 'View your protected payment' : 'View your protected payments'}
      </Link>
    </div>
  );
}

function ConfirmForm({ returnPath, ctaLabel }: { returnPath: string; ctaLabel: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || processing) return; // guard against duplicate submits
    setProcessing(true);
    setError(null);
    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}${returnPath}` },
    });
    // Reaching here means an immediate error (e.g. card declined); otherwise Stripe redirects.
    if (confirmError) {
      setError(confirmError.message ?? 'Payment could not be completed. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4" aria-busy={processing}>
      <PaymentElement />
      {error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {processing ? 'Processing…' : ctaLabel}
      </button>
    </form>
  );
}

export default function ProtectedPaymentForm({
  createIntent,
  title,
  description,
  returnPath,
  ctaLabel = 'Pay securely',
  protectionNote,
  amountLabel = 'Amount',
}: ProtectedPaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [amountCents, setAmountCents] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [errorDealId, setErrorDealId] = useState<string | null>(null);
  const [resolvedReturnPath, setResolvedReturnPath] = useState<string>(returnPath);
  const initedRef = useRef(false);

  // If we're on the post-confirmation return leg, Stripe appends redirect_status;
  // show status and do NOT create a second PaymentIntent.
  const returnParams =
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const redirectStatus = returnParams?.get('redirect_status') ?? null;

  const init = useCallback(() => {
    if (initedRef.current) return;
    initedRef.current = true;
    createIntent()
      .then((r) => {
        setClientSecret(r.clientSecret);
        if (typeof r.amountCents === 'number') setAmountCents(r.amountCents);
        if (r.returnPath) setResolvedReturnPath(r.returnPath);
      })
      .catch((e) => {
        const parsed = parseApiError(e);
        setLoadError(parsed.message);
        if (parsed.dealId) setErrorDealId(parsed.dealId);
      });
  }, [createIntent]);

  useEffect(() => {
    if (redirectStatus) return; // return leg — never re-initialize payment
    init();
  }, [init, redirectStatus]);

  if (redirectStatus) return <StatusView status={redirectStatus} dealId={returnParams?.get('dealId')} />;

  if (!stripePromise) {
    return (
      <div className="mx-auto max-w-md px-4 py-10">
        <div role="alert" className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
          Payments are not available yet. Please check back soon.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <h1 className="mb-1 text-2xl font-semibold text-slate-900">{title}</h1>
      {description && <p className="mb-4 text-sm text-slate-600">{description}</p>}
      {amountCents != null && (
        <p className="mb-4 text-sm font-medium text-slate-800">
          {amountLabel}: ${(amountCents / 100).toFixed(2)}
        </p>
      )}
      {loadError && (
        <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {loadError}
          {errorDealId && (
            <Link to={`/deals/${errorDealId}`} className="mt-2 block font-semibold text-blue-700 hover:underline">
              View your existing protected payment
            </Link>
          )}
        </div>
      )}
      {!clientSecret && !loadError && <p className="text-sm text-slate-500">Preparing secure payment…</p>}
      {clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
          <ConfirmForm returnPath={resolvedReturnPath} ctaLabel={ctaLabel} />
        </Elements>
      )}
      <p className="mt-4 text-center text-xs text-slate-500">
        {protectionNote ?? 'Payments are securely processed by Stripe.'}
      </p>
    </div>
  );
}
