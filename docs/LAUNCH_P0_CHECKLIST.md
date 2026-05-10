# Launch P0 Checklist

Use this checklist for final release sign-off.

## Routing & Navigation
- [ ] `/network` opens successfully for authenticated users.
- [ ] Footer links resolve to valid routes:
  - `/legal/terms`
  - `/legal/privacy`
  - `/legal/guidelines`
  - `/help-center`
  - `/contact`
  - `/messages`
  - `/qa`
- [ ] No dead-route navigation from primary user-facing menus.

## Provider Onboarding (Critical)
- [ ] `/services/onboarding?step=5` loads and saves without required weekly schedule friction.
- [ ] Service cards validate selected services before continue.
- [ ] Continue blocking toast appears for missing selected-service required fields.

## Booking + Calendar (Critical)
- [ ] Provider can open `/network` and create calendar events.
- [ ] Buyer booking modal loads slots from:
  - `GET /api/services/provider/:providerId/available-slots`
- [ ] Booking request submits through:
  - `POST /api/services/book/:providerId`
- [ ] Conflict path returns `409 slot_unavailable` and buyer sees conflict toast.
- [ ] Booking status update syncs linked scheduled event status.

## Payout/Stripe (Critical)
- [ ] Provider can start connect onboarding from Step 4 payout.
- [ ] Verify endpoint updates provider payout status:
  - `POST /api/payout/verify`
- [ ] Provider can proceed only after successful payout completion.

## Error Contract (Critical APIs)
- [ ] Booking APIs return normalized errors:
  - `{ success: false, code, error, details? }`
- [ ] Client shows user-readable errors for `400`, `404`, `409`, `500`.

## Smoke Tests
- [ ] Run API smoke script:
  - `npm run verify:bookings:phase2`
- [ ] Run e2e booking modal flow:
  - `e2e/booking-modal-flow.spec.ts`

## Launch Ops
- [ ] Production env vars validated.
- [ ] Rollback target commit identified.
- [ ] Monitoring window assigned (first 2-4 hours post-release).
