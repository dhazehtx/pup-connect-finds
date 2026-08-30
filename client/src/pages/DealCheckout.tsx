import React, { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiRequest } from '@/lib/api';
import ProtectedPaymentForm from '@/components/payments/ProtectedPaymentForm';

/**
 * Breeder protected-payment (Deals) confirmation. Deposit is initiated from a
 * listing (?listingId=), the balance from an existing deal (?dealId=). The server
 * derives amount + seller + commission; this UI only confirms the PaymentIntent
 * and can never mark the deal paid/released (the webhook is authoritative).
 * "Protected payment" — not a regulated escrow service.
 */
export default function DealCheckout() {
  const [sp] = useSearchParams();
  const listingId = sp.get('listingId');
  const dealId = sp.get('dealId');

  const createIntent = useCallback(async () => {
    if (listingId) {
      const r = await apiRequest(`/api/deals/${listingId}/deposit`, { method: 'POST' });
      return { clientSecret: r.clientSecret, amountCents: r.depositCents };
    }
    if (dealId) {
      const r = await apiRequest(`/api/deals/${dealId}/balance`, { method: 'POST' });
      return { clientSecret: r.clientSecret, amountCents: r.balanceCents };
    }
    throw new Error('Missing listingId or dealId');
  }, [listingId, dealId]);

  const returnPath = listingId ? `/deals/pay?listingId=${listingId}` : `/deals/pay?dealId=${dealId}`;

  return (
    <ProtectedPaymentForm
      createIntent={createIntent}
      title="Protected payment"
      description="This is a protected transaction. Your payment is held and released to the seller only after the transaction is confirmed."
      returnPath={returnPath}
      ctaLabel="Pay securely"
      protectionNote="Payments are securely processed by Stripe. This is a protected payment — not a regulated escrow service. Funds are released to the seller only after the transaction is confirmed."
    />
  );
}
