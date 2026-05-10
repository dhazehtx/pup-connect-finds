export const BOOKING_SLOT_CONFIG = {
  startHourUtc: 9,
  endHourUtc: 18,
  intervalMinutes: 30,
} as const;

export const BOOKING_EVENT_TYPES = {
  availabilityBlock: "availability_block",
  bookingHold: "booking_hold",
  confirmedBooking: "confirmed_booking",
} as const;

export type BookingEventType = (typeof BOOKING_EVENT_TYPES)[keyof typeof BOOKING_EVENT_TYPES];
