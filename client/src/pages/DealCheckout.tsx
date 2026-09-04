import React, { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiRequest } from '@/lib/api';
import ProtectedPaymentForm from '@/components/payments/ProtectedPaymentForm';

/**
 * Breeder protected-payment (Deals) confirmation. Deposit is initiated from a
 * listing (?listingId=), the balance from an existing deal (?dealId=). The server
 * derives amount + seller + commission; this UI only confirms the PaymentIntent
 * and can never mark the deal paid/released (the webhook is authoritative).
 * After confirmation Stripe returns the buyer to the DEAL DETAIL page (the
 * server's dealId decides the path), which shows webhook-authoritative state —
 * never a dead-end status screen. "Protected payment" — not a regulated escrow.
 */
export default function DealCheckout() {
  const [sp] = useSearchParams();
  const listingId = sp.get('listingId');
  const dealId = sp.get('dealId');

  const createIntent = useCallback(async () => {
    if (listingId) {
      const r = await apiRequest(`/api/deals/${listingId}/deposit`, { method: 'POST' });
      return {
        clientSecret: r.clientSecret,
        amountCents: r.depositCents,
        returnPath: `/deals/${r.dealId}`,
      };
    }
    if (dealId) {
      const r = await apiRequest(`/api/deals/${dealId}/balance`, { method: 'POST' });
      return {
        clientSecret: r.clientSecret,
        amountCents: r.balanceCents,
        returnPath: `/deals/${dealId}`,
      };
    }
    throw new Error('Missing listingId or dealId');
  }, [listingId, dealId]);

  // Fallback only — the server-derived returnPath above takes precedence.
  const returnPath = listingId ? `/deals/pay?listingId=${listingId}` : `/deals/pay?dealId=${dealId}`;

  return (
    <ProtectedPaymentForm
      createIntent={createIntent}
      title="Protected payment"
      description="This is a protected transaction. Your payment is held and released to the seller only after the transaction is confirmed."
      returnPath={returnPath}
      ctaLabel="Pay securely"
      amountLabel={listingId ? '20% deposit due now' : 'Remaining balance'}
      protectionNote="Payments are securely processed by Stripe. This is a protected payment — not a regulated escrow service. Funds are released to the seller only after the transaction is confirmed."
    />
  );
}
