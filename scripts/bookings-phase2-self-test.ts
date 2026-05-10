import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const BASE = process.env.BOOKINGS_VERIFY_BASE_URL?.replace(/\/$/, '') || 'http://127.0.0.1:5000';

function fail(msg: string): never {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
}

function assert(condition: unknown, msg: string) {
  if (!condition) fail(msg);
}

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !serviceKey || !anonKey) fail('Missing Supabase env');

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const anon = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });

  const suffix = `${Date.now()}`;
  const userEmail = `phase2-book-user-${suffix}@mypup.dev`;
  const providerEmail = `phase2-book-provider-${suffix}@mypup.dev`;
  const password = 'BookingPhase2!123';

  const { data: userData, error: userErr } = await admin.auth.admin.createUser({
    email: userEmail,
    password,
    email_confirm: true,
    user_metadata: { username: `phase2_user_${suffix}`, full_name: `Phase2 User ${suffix}` },
  });
  if (userErr || !userData.user?.id) fail(`create user failed: ${userErr?.message}`);

  const { data: providerData, error: providerErr } = await admin.auth.admin.createUser({
    email: providerEmail,
    password,
    email_confirm: true,
    user_metadata: { username: `phase2_provider_${suffix}`, full_name: `Phase2 Provider ${suffix}` },
  });
  if (providerErr || !providerData.user?.id) fail(`create provider failed: ${providerErr?.message}`);

  const userId = userData.user.id;
  const providerUserId = providerData.user.id;

  const { data: providerRow, error: providerInsertErr } = await admin
    .from('pet_service_providers')
    .insert({
      user_id: providerUserId,
      service_type: 'walking',
      bio: 'Phase 2 verified provider',
      price: '25.00',
      availability: 'calendar-managed',
      location: 'Test City',
      is_verified: true,
      is_active: true,
      verification_status: 'verified',
    })
    .select('id,user_id,service_type')
    .single();
  if (providerInsertErr || !providerRow?.id) fail(`insert provider row failed: ${providerInsertErr?.message}`);
  const providerId = providerRow.id as string;

  const { data: userSession, error: userSignInErr } = await anon.auth.signInWithPassword({
    email: userEmail,
    password,
  });
  if (userSignInErr || !userSession.session?.access_token) fail(`signIn user failed: ${userSignInErr?.message}`);

  const userToken = userSession.session.access_token;
  const hdr = (token: string) => ({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  });

  const targetDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const slotsRes = await fetch(
    `${BASE}/api/services/provider/${providerId}/available-slots?date=${targetDate}&durationMinutes=60`,
    { headers: { Accept: 'application/json' } },
  );
  const slotsBody = await slotsRes.json();
  assert(slotsRes.ok, `available slots failed: ${JSON.stringify(slotsBody)}`);
  assert(Array.isArray(slotsBody?.data?.slots), 'available slots response missing slots');
  const firstAvailable = (slotsBody.data.slots as Array<{ startAt: string; available: boolean }>).find((s) => s.available);
  assert(firstAvailable?.startAt, 'no available slot found for test provider');

  const createPayload = {
    serviceTypeId: 'walking',
    startAt: firstAvailable.startAt,
    durationMinutes: 60,
    notes: 'phase2 booking request',
  };

  const bookingRes = await fetch(`${BASE}/api/services/book/${providerId}`, {
    method: 'POST',
    headers: hdr(userToken),
    body: JSON.stringify(createPayload),
  });
  const bookingBody = await bookingRes.json();
  assert(bookingRes.ok, `booking create failed: ${JSON.stringify(bookingBody)}`);
  assert(bookingBody?.data?.bookingId, 'bookingId missing on successful booking');

  const conflictRes = await fetch(`${BASE}/api/services/book/${providerId}`, {
    method: 'POST',
    headers: hdr(userToken),
    body: JSON.stringify(createPayload),
  });
  const conflictBody = await conflictRes.json();
  assert(conflictRes.status === 409, `expected 409 conflict, got ${conflictRes.status}`);
  assert(conflictBody?.code === 'slot_unavailable', `expected slot_unavailable, got ${JSON.stringify(conflictBody)}`);

  const invalidRes = await fetch(`${BASE}/api/services/book/${providerId}`, {
    method: 'POST',
    headers: hdr(userToken),
    body: JSON.stringify({
      serviceTypeId: 'walking',
      startAt: firstAvailable.startAt,
      durationMinutes: 5,
    }),
  });
  const invalidBody = await invalidRes.json();
  assert(invalidRes.status === 400, `expected 400 validation, got ${invalidRes.status}`);
  assert(invalidBody?.code === 'validation_error', `expected validation_error, got ${JSON.stringify(invalidBody)}`);

  const missingProviderRes = await fetch(`${BASE}/api/services/provider/00000000-0000-0000-0000-000000000000/available-slots?date=${targetDate}&durationMinutes=60`);
  const missingProviderBody = await missingProviderRes.json();
  assert(missingProviderRes.status === 404, `expected 404 provider missing, got ${missingProviderRes.status}`);
  assert(missingProviderBody?.code === 'provider_not_found', `expected provider_not_found, got ${JSON.stringify(missingProviderBody)}`);

  console.log('PASS: bookings phase2 self-test');
  console.log(
    JSON.stringify(
      {
        providerId,
        userId,
        bookingId: bookingBody.data.bookingId,
        checks: ['success', '409_conflict', '400_validation', '404_provider_not_found'],
      },
      null,
      2,
    ),
  );
}

main().catch((e) => fail(String(e?.message || e)));
