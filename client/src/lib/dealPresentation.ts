/**
 * Presentation-only mapping for Protected Payment (Deals) UI.
 *
 * Translates the AUTHORITATIVE backend state machine (server/routes/deals.ts)
 * into user-facing language and decides which role-appropriate actions the UI
 * may OFFER. This module never changes state, never computes authoritative
 * amounts/commission, and offering an action is only a UX courtesy — the server
 * enforces every transition and role check regardless.
 */

export type DealRole = 'buyer' | 'seller';

export const DEAL_STATUS_LABELS: Record<string, { label: string; tone: 'progress' | 'action' | 'done' | 'warn' }> = {
  DRAFT: { label: 'Draft', tone: 'progress' },
  RESERVED: { label: 'Deposit processing', tone: 'progress' },
  DEPOSIT_PAID: { label: 'Deposit paid', tone: 'action' },
  PAID_IN_FULL: { label: 'Paid in full — ready for handoff', tone: 'action' },
  DELIVERED_PENDING_CONFIRM: { label: 'Delivered — awaiting confirmation', tone: 'action' },
  DELIVERED_CONFIRMED: { label: 'Confirmed — in protection window', tone: 'progress' },
  RELEASING: { label: 'Releasing funds', tone: 'progress' },
  RELEASED: { label: 'Complete — funds released', tone: 'done' },
  DISPUTED: { label: 'Dispute open', tone: 'warn' },
  REFUNDED: { label: 'Refunded', tone: 'done' },
  CANCELED: { label: 'Canceled', tone: 'done' },
  EXPIRED: { label: 'Expired', tone: 'done' },
};

/** Ordered progress milestones shown to both parties. */
export const DEAL_PROGRESS_STEPS = ['Deposit', 'Paid in full', 'Handoff', 'Confirmed', 'Released'] as const;

export function dealProgressIndex(status: string): number {
  switch (status) {
    case 'RESERVED':
      return 0;
    case 'DEPOSIT_PAID':
      return 1;
    case 'PAID_IN_FULL':
      return 2;
    case 'DELIVERED_PENDING_CONFIRM':
      return 3;
    case 'DELIVERED_CONFIRMED':
    case 'RELEASING':
      return 4;
    case 'RELEASED':
      return 5;
    default:
      return -1; // disputed/refunded/canceled/expired render their own banner
  }
}

/**
 * Which actions the UI may OFFER for a role in a state. The server remains the
 * authority; anything offered here can still be refused server-side.
 * Buyer dispute availability mirrors the server's validStatuses list exactly.
 */
export function dealActions(status: string, role: DealRole): string[] {
  if (role === 'buyer') {
    switch (status) {
      case 'DEPOSIT_PAID':
        return ['pay_balance'];
      case 'PAID_IN_FULL':
        return ['open_dispute'];
      case 'DELIVERED_PENDING_CONFIRM':
        return ['confirm_received', 'open_dispute'];
      case 'DELIVERED_CONFIRMED':
        return ['open_dispute'];
      default:
        return [];
    }
  }
  // seller
  switch (status) {
    case 'PAID_IN_FULL':
      return ['generate_handoff_code', 'mark_delivered'];
    default:
      return [];
  }
}

/** Short "what happens next" copy for the list view. */
export function dealNextStep(status: string, role: DealRole): string | null {
  const map: Record<string, { buyer: string | null; seller: string | null }> = {
    RESERVED: { buyer: 'Your deposit is processing.', seller: 'Waiting for the buyer’s deposit.' },
    DEPOSIT_PAID: { buyer: 'Next: pay the remaining balance.', seller: 'Waiting for the remaining balance.' },
    PAID_IN_FULL: { buyer: 'Next: meet for handoff.', seller: 'Next: generate a handoff code and deliver.' },
    DELIVERED_PENDING_CONFIRM: { buyer: 'Next: confirm you received your pup.', seller: 'Waiting for the buyer to confirm.' },
    DELIVERED_CONFIRMED: { buyer: 'Protection window in progress.', seller: 'Funds release after the protection window.' },
    RELEASING: { buyer: null, seller: 'Funds are on the way.' },
    RELEASED: { buyer: null, seller: null },
    DISPUTED: { buyer: 'Our team will follow up on your dispute.', seller: 'A dispute is open on this transaction.' },
  };
  return map[status]?.[role] ?? null;
}

/** Display-only formatting of a server-provided cents amount. */
export function formatDealAmount(cents: number | null | undefined): string {
  if (typeof cents !== 'number' || !Number.isFinite(cents)) return '—';
  return `$${(cents / 100).toFixed(2)}`;
}
