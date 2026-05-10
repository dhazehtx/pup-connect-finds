import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { Pool } from '@neondatabase/serverless';
import ws from 'ws';

const BASE = process.env.MESSAGING_VERIFY_BASE_URL?.replace(/\/$/, '') || 'http://127.0.0.1:5000';

function fail(msg: string): never {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
}

// @ts-expect-error neon serverless websocket binding
if (typeof globalThis.WebSocket === 'undefined') {
  (globalThis as any).WebSocket = ws;
}

async function main() {
  const dbUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!dbUrl) fail('Missing DATABASE_URL or NEON_DATABASE_URL');
  if (!supabaseUrl || !serviceKey || !anonKey) fail('Missing Supabase env');

  const suffix = `${Date.now()}`;
  const userEmail = `booking-user-${suffix}@mypup.dev`;
  const providerEmail = `booking-provider-${suffix}@mypup.dev`;
  const password = 'BookingVerify123!';

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const { data: userData, error: userErr } = await admin.auth.admin.createUser({
    email: userEmail,
    password,
    email_confirm: true,
    user_metadata: { username: `booking_user_${suffix}`, full_name: `Booking User ${suffix}` },
  });
  if (userErr || !userData.user?.id) fail(`create user: ${userErr?.message}`);

  const { data: providerData, error: providerErr } = await admin.auth.admin.createUser({
    email: providerEmail,
    password,
    email_confirm: true,
    user_metadata: { username: `booking_provider_${suffix}`, full_name: `Booking Provider ${suffix}` },
  });
  if (providerErr || !providerData.user?.id) fail(`create provider: ${providerErr?.message}`);

  const userId = userData.user.id;
  const providerUserId = providerData.user.id;

  const anon = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });
  const { data: userSession, error: signInUserErr } = await anon.auth.signInWithPassword({ email: userEmail, password });
  if (signInUserErr || !userSession.session?.access_token) fail(`signIn user: ${signInUserErr?.message}`);
  const { data: providerSession, error: signInProviderErr } = await anon.auth.signInWithPassword({ email: providerEmail, password });
  if (signInProviderErr || !providerSession.session?.access_token) fail(`signIn provider: ${signInProviderErr?.message}`);

  const userToken = userSession.session.access_token;
  const providerToken = providerSession.session.access_token;
  const hdr = (token: string) => ({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  });

  await fetch(`${BASE}/api/profiles/me`, { headers: hdr(userToken) });
  await fetch(`${BASE}/api/profiles/me`, { headers: hdr(providerToken) });

  // Seed a verified provider row because service-booking APIs use pet_service_providers.id
  const pool = new Pool({ connectionString: dbUrl });
  const serviceType = 'grooming';
  let providerId = '';
  try {
    const { rows } = await pool.query(
      `INSERT INTO pet_service_providers
        (user_id, service_type, bio, price, availability, location, is_verified, verification_status)
       VALUES
        ($1, $2, $3, $4, $5, $6, true, 'verified')
       RETURNING id`,
      [
        providerUserId,
        serviceType,
        `Booking verify provider ${suffix}`,
        '50',
        'Mon-Fri mornings',
        'Austin, TX',
      ],
    );
    if (!rows[0]?.id) fail('failed to create pet_service_providers row');
    providerId = rows[0].id as string;
  } finally {
    await pool.end();
  }

  const bookingDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
  bookingDate.setUTCHours(10, 30, 0, 0);
  const startAt = bookingDate.toISOString();

  // 1) user creates booking
  const createRes = await fetch(`${BASE}/api/services/book/${providerId}`, {
    method: 'POST',
    headers: hdr(userToken),
    body: JSON.stringify({
      serviceTypeId: serviceType,
      startAt,
      durationMinutes: 60,
      notes: 'E2E booking notes',
    }),
  });
  const created = await createRes.json();
  const bookingId = created?.data?.bookingId as string | undefined;
  if (!createRes.ok || !bookingId) fail(`create booking failed: ${createRes.status} ${JSON.stringify(created)}`);

  // 2) provider sees booking
  const providerListRes = await fetch(`${BASE}/api/services/bookings/provider/${providerUserId}`, { headers: hdr(providerToken) });
  const providerBookings = await providerListRes.json();
  if (!providerListRes.ok || !Array.isArray(providerBookings?.data)) fail(`provider list failed: ${JSON.stringify(providerBookings)}`);
  const providerSeen = providerBookings.data.find((b: any) => b.id === bookingId);
  if (!providerSeen) fail('provider does not see booking');

  // 3) provider accepts booking
  const updateRes = await fetch(`${BASE}/api/services/bookings/${bookingId}/status`, {
    method: 'PATCH',
    headers: hdr(providerToken),
    body: JSON.stringify({ status: 'accepted' }),
  });
  const updated = await updateRes.json();
  if (!updateRes.ok || updated?.data?.status !== 'accepted') fail(`provider update failed: ${JSON.stringify(updated)}`);

  // 4) user sees updated status
  const userListRes = await fetch(`${BASE}/api/services/bookings/user/${userId}`, { headers: hdr(userToken) });
  const userBookings = await userListRes.json();
  if (!userListRes.ok || !Array.isArray(userBookings?.data)) fail(`user list failed: ${JSON.stringify(userBookings)}`);
  const userSeen = userBookings.data.find((b: any) => b.id === bookingId);
  if (!userSeen) fail('user does not see booking');
  if (userSeen.status !== 'accepted') fail(`user sees wrong status: ${userSeen.status}`);

  console.log('PASS: booking E2E create -> provider -> accepted -> user refresh');
  console.log(JSON.stringify({ bookingId, userId, providerUserId, providerId, finalStatus: userSeen.status }, null, 2));
}

main().catch((e) => fail(String(e?.message || e)));
