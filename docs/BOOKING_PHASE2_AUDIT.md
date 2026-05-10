# Phase 2 Safety & Usage Audit

## Usage map results
- `ServiceBookingDialog`:
  - Defined at `client/src/components/services/ServiceBookingDialog.tsx`
  - No active imports/usages in page routes.
- `CalendarScheduler`:
  - Defined at `client/src/components/scheduling/CalendarScheduler.tsx`
  - No active imports/usages in page routes.
- Active booking modal path:
  - `client/src/components/BookServiceModal.tsx`
  - Used by:
    - `client/src/pages/Services/ServicesTab.tsx`
    - `client/src/pages/VetGroomerDirectoryPage.tsx`
    - `client/src/components/home/HomeStudsServicesSections.tsx`
- Active calendar management path:
  - `client/src/components/scheduling/AdvancedCalendarScheduler.tsx`
  - Used by `client/src/pages/Network.tsx`

## Behavior parity checklist
- Required booking fields:
  - date, duration, available slot, terms agreement
- Validation:
  - minimum booking timing guard
  - `409 slot_unavailable` conflict handling with destructive toast
- Success path:
  - booking request created through unified API contract
- Failure path:
  - normalized error shape with `code` + `error`

## Rollback gate
- Legacy files were kept in-code with explicit deprecation headers through phase hardening.
- Fallback point for rollback release:
  - re-enable old component usage in route pages if needed.
