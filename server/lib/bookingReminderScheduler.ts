import { and, eq, inArray, sql } from 'drizzle-orm';
import { db } from '../db';
import { serviceBookings, notifications } from '@shared/schema';
import { emitToUser } from '../socket';

type ReminderKind = '24h' | 'soon';

/** ±30m around the 24h-before instant */
const TWENTY_FOUR_HOUR_WINDOW_MS = 30 * 60 * 1000;
/** 2–3 hours before appointment (same-day / short lead window) */
const SOON_MIN_MS = 2 * 60 * 60 * 1000;
const SOON_MAX_MS = 3 * 60 * 60 * 1000;

const DEFAULT_INTERVAL_MS = 5 * 60 * 1000;
const DEFAULT_FIRST_TICK_MS = 15_000;

function intervalMs(): number {
  const raw = process.env.BOOKING_REMINDER_INTERVAL_MS;
  const n = raw ? parseInt(raw, 10) : NaN;
  return Number.isFinite(n) && n >= 60_000 ? n : DEFAULT_INTERVAL_MS;
}

function firstTickMs(): number {
  const raw = process.env.BOOKING_REMINDER_FIRST_DELAY_MS;
  const n = raw ? parseInt(raw, 10) : NaN;
  return Number.isFinite(n) && n >= 0 ? n : DEFAULT_FIRST_TICK_MS;
}

let reminderSchedulerStarted = false;

type BookingReminderRow = {
  id: string;
  user_id: string;
  provider_id: string;
  service_date: Date;
  booking_at: Date;
};

function isValidUuid(value: string | null | undefined): value is string {
  return !!value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function formatBookingDateTime(serviceDate: Date): { booking_date: string; booking_time: string } {
  const date = new Date(serviceDate);
  const booking_date = date.toISOString().slice(0, 10);
  const booking_time = date.toISOString().slice(11, 16);
  return { booking_date, booking_time };
}

/** Upcoming bookings only; excludes cancelled/completed via status filter and booking_at > now. */
async function fetchReminderCandidates(start: Date, end: Date): Promise<BookingReminderRow[]> {
  const rows = await db
    .select({
      id: serviceBookings.id,
      user_id: serviceBookings.user_id,
      provider_id: serviceBookings.provider_id,
      service_date: serviceBookings.service_date,
      booking_at: serviceBookings.service_date,
    })
    .from(serviceBookings)
    .where(
      and(
        inArray(serviceBookings.status, ['pending', 'accepted']),
        sql`${serviceBookings.service_date} > ${new Date()}`,
        sql`${serviceBookings.service_date} >= ${start}`,
        sql`${serviceBookings.service_date} < ${end}`,
      ),
    );

  return rows.filter((r) => isValidUuid(r.user_id) && isValidUuid(r.provider_id));
}

async function notificationExistsTx(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  toUserId: string,
  bookingId: string,
  kind: ReminderKind,
): Promise<boolean> {
  const existing = await tx
    .select({ id: notifications.id })
    .from(notifications)
    .where(
      and(
        eq(notifications.type, 'booking_reminder'),
        eq(notifications.toUserId, toUserId),
        eq(notifications.relatedId, bookingId),
        sql`${notifications.meta}->>'reminder_kind' = ${kind}`,
      ),
    )
    .limit(1);

  return existing.length > 0;
}

function buildReminderMeta(booking: BookingReminderRow, kind: ReminderKind) {
  const { booking_date, booking_time } = formatBookingDateTime(booking.service_date);
  return {
    booking_id: booking.id,
    booking_date,
    booking_time,
    reminder_kind: kind,
    /** Explicit nested copy for clients expecting `metadata.*` */
    metadata: {
      booking_id: booking.id,
      booking_date,
      booking_time,
    },
  };
}

async function createReminderNotification(
  toUserId: string,
  fromUserId: string,
  booking: BookingReminderRow,
  kind: ReminderKind,
): Promise<boolean> {
  if (toUserId === fromUserId) return false;
  if (!isValidUuid(toUserId) || !isValidUuid(fromUserId)) return false;

  const lockKey = `booking_reminder:${booking.id}:${kind}:${toUserId}`;

  try {
    return await db.transaction(async (tx) => {
      await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${lockKey}::text))`);

      const [current] = await tx
        .select({
          id: serviceBookings.id,
          status: serviceBookings.status,
          service_date: serviceBookings.service_date,
        })
        .from(serviceBookings)
        .where(eq(serviceBookings.id, booking.id))
        .limit(1);

      if (!current) {
        console.warn('[BOOKING_REMINDER] skip missing booking', JSON.stringify({ bookingId: booking.id, kind }));
        return false;
      }
      if (!['pending', 'accepted'].includes(current.status)) {
        return false;
      }

      if (await notificationExistsTx(tx, toUserId, booking.id, kind)) {
        return false;
      }

      const title = kind === '24h' ? 'Booking reminder (24 hours)' : 'Booking reminder (in a few hours)';
      const normalizedDateTime = formatBookingDateTime(new Date(current.service_date));
      const rowForMessage: BookingReminderRow = {
        ...booking,
        service_date: current.service_date,
        booking_at: booking.booking_at,
      };
      const meta = buildReminderMeta(rowForMessage, kind);
      const message = `Booking on ${normalizedDateTime.booking_date} at ${normalizedDateTime.booking_time}`;

      const [notification] = await tx
        .insert(notifications)
        .values({
          toUserId,
          fromUserId,
          actorId: fromUserId,
          type: 'booking_reminder',
          title,
          message,
          relatedId: booking.id,
          targetUrl: `/bookings/${booking.id}`,
          meta,
          isRead: false,
          read: false,
        })
        .returning();

      if (notification) {
        emitToUser(toUserId, 'notification:new', notification);
        return true;
      }
      return false;
    });
  } catch (err) {
    console.error(
      '[BOOKING_REMINDER] create failed',
      JSON.stringify({
        bookingId: booking.id,
        kind,
        toUserId,
        error: (err as Error)?.message || String(err),
        ts: Date.now(),
      }),
    );
    return false;
  }
}

export async function runBookingReminderSweep(now = new Date()): Promise<{ checked: number; created: number }> {
  let created = 0;

  const twentyFourHourStart = new Date(now.getTime() + 24 * 60 * 60 * 1000 - TWENTY_FOUR_HOUR_WINDOW_MS);
  const twentyFourHourEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000 + TWENTY_FOUR_HOUR_WINDOW_MS);
  const soonStart = new Date(now.getTime() + SOON_MIN_MS);
  const soonEnd = new Date(now.getTime() + SOON_MAX_MS);

  const [daily, soon] = await Promise.all([
    fetchReminderCandidates(twentyFourHourStart, twentyFourHourEnd),
    fetchReminderCandidates(soonStart, soonEnd),
  ]);

  const jobs: Array<{ booking: BookingReminderRow; kind: ReminderKind }> = [
    ...daily.map((b) => ({ booking: b, kind: '24h' as ReminderKind })),
    ...soon.map((b) => ({ booking: b, kind: 'soon' as ReminderKind })),
  ];

  for (const job of jobs) {
    try {
      if (await createReminderNotification(job.booking.user_id, job.booking.provider_id, job.booking, job.kind)) {
        created += 1;
      }
    } catch (e) {
      console.error('[BOOKING_REMINDER] user notify failed', (e as Error)?.message || e);
    }
    try {
      if (await createReminderNotification(job.booking.provider_id, job.booking.user_id, job.booking, job.kind)) {
        created += 1;
      }
    } catch (e) {
      console.error('[BOOKING_REMINDER] provider notify failed', (e as Error)?.message || e);
    }
  }

  return { checked: jobs.length, created };
}

export function startBookingReminderScheduler(): void {
  if (reminderSchedulerStarted) return;
  reminderSchedulerStarted = true;

  const ms = intervalMs();
  const tick = () => {
    void runBookingReminderSweep(new Date())
      .then(({ checked, created }) => {
        console.log(
          '[BOOKING_REMINDER] sweep ok',
          JSON.stringify({ checked, created, intervalMs: ms, ts: Date.now() }),
        );
      })
      .catch((err) => {
        console.error('[BOOKING_REMINDER] sweep failed:', (err as Error)?.message || err);
      });
  };

  setTimeout(tick, firstTickMs());
  setInterval(tick, ms);
}
