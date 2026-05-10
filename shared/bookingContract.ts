import { z } from 'zod';

export const bookingErrorCodeSchema = z.enum([
  'slot_unavailable',
  'validation_error',
  'provider_not_found',
  'unauthorized',
  'internal_error',
]);

export const createServiceBookingRequestSchema = z.object({
  serviceTypeId: z.string().min(1),
  startAt: z.string().datetime(),
  durationMinutes: z.number().int().min(30).max(24 * 60),
  notes: z.string().max(1500).optional(),
});

export const createServiceBookingResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    bookingId: z.string().uuid(),
    eventId: z.string().uuid().optional(),
    status: z.string(),
    startAt: z.string().datetime(),
    endAt: z.string().datetime(),
  }),
});

export const bookingApiErrorSchema = z.object({
  success: z.literal(false).optional(),
  code: bookingErrorCodeSchema,
  error: z.string(),
  details: z.unknown().optional(),
});

export const availableSlotSchema = z.object({
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  available: z.boolean(),
});

export const listAvailableSlotsResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    providerId: z.string().uuid(),
    date: z.string(),
    durationMinutes: z.number().int(),
    slots: z.array(availableSlotSchema),
  }),
});

export type BookingErrorCode = z.infer<typeof bookingErrorCodeSchema>;
export type CreateServiceBookingRequest = z.infer<typeof createServiceBookingRequestSchema>;
export type CreateServiceBookingResponse = z.infer<typeof createServiceBookingResponseSchema>;
export type BookingApiError = z.infer<typeof bookingApiErrorSchema>;
export type AvailableSlot = z.infer<typeof availableSlotSchema>;
export type ListAvailableSlotsResponse = z.infer<typeof listAvailableSlotsResponseSchema>;
