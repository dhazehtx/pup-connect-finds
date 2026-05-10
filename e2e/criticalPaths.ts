/**
 * Centralized P0 critical user flows — testing / QA only (no runtime UI coupling).
 * Import in Playwright specs, scripts, or docs generators.
 */

export type CriticalPathStep = {
  /** Stable id for filtering or test.step() labels */
  id: string;
  /** What the user or system does */
  action: string;
  /** Observable success criterion (optional) */
  expect?: string;
};

export type CriticalPath = {
  /** Machine id: auth | create_post | message | booking_payment | provider_onboarding | notifications */
  id: string;
  /** Short title */
  name: string;
  /** One-line scope */
  description?: string;
  steps: readonly CriticalPathStep[];
};

export const CRITICAL_PATHS = [
  {
    id: 'auth',
    name: 'Auth (signup / login / logout)',
    description: 'End-to-end session lifecycle with Supabase-backed auth.',
    steps: [
      { id: 'auth-1', action: 'Open /auth as a logged-out visitor.' },
      { id: 'auth-2', action: 'Choose Sign up; enter email and password (and any required fields).' },
      {
        id: 'auth-3',
        action: 'Submit signup; complete email confirmation if the project requires it (link in inbox).',
        expect: 'User reaches a signed-in state or explicit “check your email” confirmation.',
      },
      { id: 'auth-4', action: 'Sign out from the app UI.' },
      { id: 'auth-5', action: 'Open /auth; choose Sign in with the same account.' },
      {
        id: 'auth-6',
        action: 'Submit credentials.',
        expect: 'Redirect into the app with an active session (no stuck login spinner).',
      },
      {
        id: 'auth-7',
        action: 'Hard refresh the page.',
        expect: 'Session still present (still signed in).',
      },
      { id: 'auth-8', action: 'Sign out again.', expect: 'Protected areas no longer show authenticated content.' },
    ],
  },
  {
    id: 'create_post',
    name: 'Create post',
    description: 'Publish content to the main social feed.',
    steps: [
      { id: 'post-1', action: 'Sign in.', expect: 'Session active.' },
      { id: 'post-2', action: 'Navigate to home/feed or the create-post entry point (e.g. composer or /post).' },
      { id: 'post-3', action: 'Enter post body text and attach media if applicable.' },
      { id: 'post-4', action: 'Submit/publish the post.' },
      {
        id: 'post-5',
        action: 'Confirm the post appears in the feed or open its permalink.',
        expect: 'Post content matches what was submitted; no 500 or silent failure.',
      },
    ],
  },
  {
    id: 'message',
    name: 'Send message',
    description: 'Direct or thread messaging between users.',
    steps: [
      { id: 'msg-1', action: 'Sign in as User A.', expect: 'Session active.' },
      { id: 'msg-2', action: 'Open /messages (or start a conversation from a profile/listing).' },
      {
        id: 'msg-3',
        action: 'Open an existing thread or start a new conversation with User B (test account or fixture).',
      },
      { id: 'msg-4', action: 'Type a short message and send.' },
      {
        id: 'msg-5',
        action: 'As User B (second session or device), open the same thread.',
        expect: 'Message from User A is visible; reply optional for round-trip check.',
      },
    ],
  },
  {
    id: 'booking_payment',
    name: 'Booking / payment flow',
    description: 'Commerce path through checkout; use Stripe test mode on staging.',
    steps: [
      { id: 'pay-1', action: 'Sign in as a buyer.', expect: 'Session active.' },
      {
        id: 'pay-2',
        action: 'Navigate to a bookable or purchasable offer (listing, service, or cart).',
      },
      { id: 'pay-3', action: 'Add item to cart or start booking/checkout as the UI requires.' },
      { id: 'pay-4', action: 'Proceed to payment/checkout.' },
      {
        id: 'pay-5',
        action: 'Complete Stripe Checkout or Payment Element using test card details (staging: test keys only).',
        expect: 'Success or cancel URL behaves correctly; order/booking record exists or UI confirms state.',
      },
      {
        id: 'pay-6',
        action: 'Open order history or bookings (if applicable).',
        expect: 'Transaction appears consistent with checkout outcome.',
      },
    ],
  },
  {
    id: 'provider_onboarding',
    name: 'Provider onboarding',
    description: 'Become a service provider and persist offerings.',
    steps: [
      { id: 'prov-1', action: 'Sign in.', expect: 'Session active.' },
      {
        id: 'prov-2',
        action: 'Open provider onboarding (e.g. Become a provider modal, /services/onboarding, or provider dashboard entry).',
      },
      { id: 'prov-3', action: 'Select at least one service type.' },
      { id: 'prov-4', action: 'Complete required fields per service (bio, rate, availability, conditional transport/stud/boarding fields).' },
      { id: 'prov-5', action: 'Submit/save all services.' },
      {
        id: 'prov-6',
        action: 'Reload or return to provider dashboard.',
        expect: 'Offerings saved without error; listings visible to the user.',
      },
    ],
  },
  {
    id: 'notifications',
    name: 'Notifications',
    description: 'In-app notification surface for a signed-in user.',
    steps: [
      { id: 'notif-1', action: 'Sign in.', expect: 'Session active.' },
      { id: 'notif-2', action: 'Open /notifications (or the notification panel from the shell/header).' },
      {
        id: 'notif-3',
        action: 'Load the list.',
        expect: 'Page renders (empty state or list); no unhandled error boundary.',
      },
      {
        id: 'notif-4',
        action: 'Optional: trigger a notifiable event elsewhere (reply, booking) and refresh.',
        expect: 'New item appears if the feature is wired in the environment.',
      },
    ],
  },
] as const satisfies readonly CriticalPath[];

export type CriticalPathId = (typeof CRITICAL_PATHS)[number]['id'];
