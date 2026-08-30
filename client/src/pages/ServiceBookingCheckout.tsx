import React, { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { apiRequest } from '@/lib/api';
import ProtectedPaymentForm from '@/components/payments/ProtectedPaymentForm';

/**
 * Service-booking payment. The server derives the amount from the booking and
 * returns only a clientSecret; the webhook remains authoritative for "paid".
 */
export default function ServiceBookingCheckout() {
  const { bookingId } = useParams<{ bookingId: string }>();

  const createIntent = useCallback(async () => {
    const r = await apiRequest(`/api/service-bookings/${bookingId}/pay`, { method: 'POST' });
    return { clientSecret: r.clientSecret, amountCents: r.amountCents };
  }, [bookingId]);

  return (
    <ProtectedPaymentForm
      createIntent={createIntent}
      title="Pay for your booking"
      description="Your payment is held securely and released to the provider after the service is completed."
      returnPath={`/service-bookings/${bookingId}/pay`}
      ctaLabel="Pay securely"
      protectionNote="Payments are securely processed by Stripe. Funds are released to the provider only after the service is completed."
    />
  );
}
