import 'dotenv/config';
import { Pool } from '@neondatabase/serverless';
import { runBookingReminderSweep } from '../server/lib/bookingReminderScheduler';

function fail(msg: string): never {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
}

async function main() {
  const dbUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
  if (!dbUrl) fail('Missing DATABASE_URL/NEON_DATABASE_URL');
  const pool = new Pool({ connectionString: dbUrl });

  const suffix = Date.now();
  const emailUser = `booking-rem-user-${suffix}@mypup.dev`;
  const emailProvider = `booking-rem-provider-${suffix}@mypup.dev`;

  let userId = '';
  let providerId = '';
  let b24 = '';
  let bSoon = '';

  const now = new Date();
  const dt24 = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const dtSoon = new Date(now.getTime() + Math.floor(2.5 * 60 * 60 * 1000));

  const date24 = dt24.toISOString().slice(0, 10);
  const time24 = dt24.toTimeString().slice(0, 8);
  const dateSoon = dtSoon.toISOString().slice(0, 10);
  const timeSoon = dtSoon.toTimeString().slice(0, 8);

  try {
    const u = await pool.query(
      `INSERT INTO profiles (id, email, username, full_name)
       VALUES (gen_random_uuid(), $1, $2, $3) RETURNING id`,
      [emailUser, `book_rem_u_${suffix}`, `Booking Reminder User ${suffix}`],
    );
    userId = u.rows[0].id;

    const p = await pool.query(
      `INSERT INTO profiles (id, email, username, full_name)
       VALUES (gen_random_uuid(), $1, $2, $3) RETURNING id`,
      [emailProvider, `book_rem_p_${suffix}`, `Booking Reminder Provider ${suffix}`],
    );
    providerId = p.rows[0].id;

    const r1 = await pool.query(
      `INSERT INTO bookings (user_id, provider_id, booking_date, booking_time, status, notes)
       VALUES ($1, $2, $3, $4, 'pending', '24h reminder test') RETURNING id`,
      [userId, providerId, date24, time24],
    );
    b24 = r1.rows[0].id;

    const r2 = await pool.query(
      `INSERT INTO bookings (user_id, provider_id, booking_date, booking_time, status, notes)
       VALUES ($1, $2, $3, $4, 'pending', 'soon reminder test') RETURNING id`,
      [userId, providerId, dateSoon, timeSoon],
    );
    bSoon = r2.rows[0].id;

    await runBookingReminderSweep(now);
    const nowFor24h = new Date(dt24.getTime() - 24 * 60 * 60 * 1000);
    await runBookingReminderSweep(nowFor24h);

    const first = await pool.query(
      `SELECT related_id, to_user_id, meta->>'reminder_kind' AS reminder_kind
       FROM notifications
       WHERE type = 'booking_reminder' AND related_id IN ($1, $2)`,
      [b24, bSoon],
    );
    if (first.rows.length !== 4) {
      fail(`expected 4 reminder notifications after two sweeps, got ${first.rows.length}`);
    }

    const kinds = first.rows.reduce(
      (acc: Record<string, number>, row: any) => {
        acc[row.reminder_kind || ''] = (acc[row.reminder_kind || ''] || 0) + 1;
        return acc;
      },
      {},
    );
    if (kinds['24h'] !== 2 || kinds['soon'] !== 2) {
      fail(`expected reminder_kind counts 24h=2 and soon=2; got ${JSON.stringify(kinds)}`);
    }

    await runBookingReminderSweep(now);
    await runBookingReminderSweep(nowFor24h);

    const second = await pool.query(
      `SELECT COUNT(*)::int AS c
       FROM notifications
       WHERE type = 'booking_reminder' AND related_id IN ($1, $2)`,
      [b24, bSoon],
    );
    const afterSecond = second.rows[0]?.c ?? 0;
    if (afterSecond !== 4) {
      fail(`duplicate protection failed, expected still 4 after second sweep, got ${afterSecond}`);
    }

    console.log('PASS: booking reminder scheduler');
    console.log(JSON.stringify({ createdNotifications: 4, duplicateCheck: 'ok' }, null, 2));
  } finally {
    if (b24 || bSoon) {
      await pool.query(`DELETE FROM notifications WHERE type = 'booking_reminder' AND related_id IN ($1, $2)`, [b24 || '00000000-0000-0000-0000-000000000000', bSoon || '00000000-0000-0000-0000-000000000000']);
      await pool.query(`DELETE FROM bookings WHERE id IN ($1, $2)`, [b24 || '00000000-0000-0000-0000-000000000000', bSoon || '00000000-0000-0000-0000-000000000000']);
    }
    if (userId || providerId) {
      await pool.query(`DELETE FROM profiles WHERE id IN ($1, $2)`, [userId || '00000000-0000-0000-0000-000000000000', providerId || '00000000-0000-0000-0000-000000000000']);
    }
    await pool.end();
  }
}

main().catch((e) => fail(String(e?.message || e)));
