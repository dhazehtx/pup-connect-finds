# Booking + Calendar Architecture (Phase 2)

## Source of truth
- Provider schedule and booking slot conflicts are derived from `scheduled_events`.
- Booking records remain in `service_bookings`.

## Active flow
1. Client requests available slots: `GET /api/services/provider/:providerId/available-slots`.
2. Server builds default slots (centralized config) and removes overlaps from `scheduled_events`.
3. Client submits booking: `POST /api/services/book/:providerId`.
4. Server validates provider, service type, and overlap conflicts.
5. Server creates:
   - `service_bookings` row (commercial booking record)
   - `scheduled_events` row (calendar hold)

## Event metadata conventions
- `availability_block`
- `booking_hold`
- `confirmed_booking`

Booking-created events store metadata in `description` JSON, including `bookingId` and `eventType`.

## Status synchronization
- `PATCH /api/services/bookings/:id/status` updates `service_bookings.status`.
- Matching calendar event status is synchronized using `bookingId` metadata:
  - accepted -> confirmed
  - rejected -> cancelled
  - completed -> confirmed

## Centralized slot rules
- Shared config: `shared/bookingCalendarConfig.ts`
  - start/end working hours (UTC)
  - slot interval minutes

## Error contract
- API error shape:
  - `{ success: false, code, error, details? }`
- Primary codes:
  - `slot_unavailable` (409)
  - `validation_error` (400)
  - `provider_not_found` (404)
