/**
 * Final messaging verification: real API + DB checks.
 * Usage: from repo root, with dev server on MESSAGING_VERIFY_BASE_URL (default http://127.0.0.1:5000)
 *   npx tsx scripts/messaging-final-verify.ts
 *
 * Requires: DATABASE_URL, SUPABASE_URL (or VITE_SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY,
 *           VITE_SUPABASE_ANON_KEY (or SUPABASE_ANON_KEY)
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { Pool } from '@neondatabase/serverless';
import ws from 'ws';

// @ts-expect-error neon serverless
if (typeof globalThis.WebSocket === 'undefined') {
  (globalThis as any).WebSocket = ws;
}

const BASE =
  process.env.MESSAGING_VERIFY_BASE_URL?.replace(/\/$/, '') || 'http://127.0.0.1:5000';

function fail(msg: string): never {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
}

async function main() {
  const dbUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!dbUrl) fail('Missing DATABASE_URL or NEON_DATABASE_URL');
  if (!supabaseUrl || !serviceKey) fail('Missing SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  if (!anonKey) fail('Missing VITE_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY (needed for signInWithPassword)');

  const suffix = `${Date.now()}`;
  const emailA = `msg-verify-a-${suffix}@mypup.dev`;
  const emailB = `msg-verify-b-${suffix}@mypup.dev`;
  const password = 'MsgVerify123!';

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const { data: userA, error: errA } = await admin.auth.admin.createUser({
    email: emailA,
    password,
    email_confirm: true,
    user_metadata: {
      username: `msg_verify_a_${suffix}`,
      full_name: `Msg Verify A ${suffix}`,
    },
  });
  if (errA || !userA.user?.id) fail(`createUser A: ${errA?.message}`);

  const { data: userB, error: errB } = await admin.auth.admin.createUser({
    email: emailB,
    password,
    email_confirm: true,
    user_metadata: {
      username: `msg_verify_b_${suffix}`,
      full_name: `Msg Verify B ${suffix}`,
    },
  });
  if (errB || !userB.user?.id) fail(`createUser B: ${errB?.message}`);

  const idA = userA.user.id as string;
  const idB = userB.user.id as string;

  const anon = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });

  const { data: sessionA, error: signA } = await anon.auth.signInWithPassword({ email: emailA, password });
  if (signA || !sessionA.session?.access_token) fail(`signIn A: ${signA?.message}`);

  const { data: sessionB, error: signB } = await anon.auth.signInWithPassword({ email: emailB, password });
  if (signB || !sessionB.session?.access_token) fail(`signIn B: ${signB?.message}`);

  const tokenA = sessionA.session.access_token;
  const tokenB = sessionB.session.access_token;

  const hdr = (token: string) => ({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  });

  // Ensure Neon profiles exist (auth middleware + ensureProfile) before find-or-create checks target.
  const warmA = await fetch(`${BASE}/api/profiles/me`, { headers: hdr(tokenA) });
  if (!warmA.ok) fail(`warm profile A: ${warmA.status} ${await warmA.text()}`);
  const warmB = await fetch(`${BASE}/api/profiles/me`, { headers: hdr(tokenB) });
  if (!warmB.ok) fail(`warm profile B: ${warmB.status} ${await warmB.text()}`);

  // 1. Create conversation (A -> B)
  const foc = await fetch(`${BASE}/api/messaging/conversations/find-or-create`, {
    method: 'POST',
    headers: hdr(tokenA),
    body: JSON.stringify({ targetUserId: idB }),
  });
  const focJson = await foc.json();
  if (!foc.ok) fail(`find-or-create HTTP ${foc.status}: ${JSON.stringify(focJson)}`);
  const conversationId = focJson.conversationId || focJson.id;
  if (!conversationId) fail('find-or-create: no conversationId');

  // 2. Send first message (instant = present on POST body + immediate GET)
  const send1 = await fetch(`${BASE}/api/messaging/messages`, {
    method: 'POST',
    headers: hdr(tokenA),
    body: JSON.stringify({ conversation_id: conversationId, content: 'verify-msg-1' }),
  });
  const msg1 = await send1.json();
  if (!send1.ok) fail(`send1 HTTP ${send1.status}: ${JSON.stringify(msg1)}`);
  if (!msg1.id || msg1.content !== 'verify-msg-1') fail(`send1 bad body: ${JSON.stringify(msg1)}`);

  const getAfter1 = await fetch(`${BASE}/api/messaging/conversations/${conversationId}/messages`, {
    headers: hdr(tokenA),
  });
  const list1 = await getAfter1.json();
  if (!getAfter1.ok) fail(`get messages after1: ${getAfter1.status}`);
  if (!Array.isArray(list1) || !list1.some((m: any) => m.id === msg1.id)) {
    fail('message 1 not in GET immediately after send');
  }

  // 4. Reload (second GET — persistence)
  const getReload = await fetch(`${BASE}/api/messaging/conversations/${conversationId}/messages`, {
    headers: hdr(tokenA),
  });
  const listReload = await getReload.json();
  if (!getReload.ok || !Array.isArray(listReload) || !listReload.some((m: any) => m.id === msg1.id)) {
    fail('reload GET missing first message');
  }

  // 6. Multiple messages + order
  await fetch(`${BASE}/api/messaging/messages`, {
    method: 'POST',
    headers: hdr(tokenA),
    body: JSON.stringify({ conversation_id: conversationId, content: 'verify-msg-2' }),
  });
  await fetch(`${BASE}/api/messaging/messages`, {
    method: 'POST',
    headers: hdr(tokenA),
    body: JSON.stringify({ conversation_id: conversationId, content: 'verify-msg-3' }),
  });

  const getAll = await fetch(`${BASE}/api/messaging/conversations/${conversationId}/messages`, {
    headers: hdr(tokenA),
  });
  const all = await getAll.json();
  if (!Array.isArray(all) || all.length < 3) fail(`expected >=3 messages, got ${all?.length}`);

  const ours = all.filter((m: any) => m.content?.startsWith('verify-msg-'));
  if (ours.length < 3) fail('not all verify messages present');

  for (let i = 0; i < ours.length - 1; i++) {
    const t0 = new Date(ours[i].created_at).getTime();
    const t1 = new Date(ours[i + 1].created_at).getTime();
    if (t0 > t1) fail(`order broken: ${ours[i].content} after ${ours[i + 1].content}`);
  }

  const ids = all.map((m: any) => m.id);
  if (new Set(ids).size !== ids.length) fail('duplicate message ids in API response');

  // 8–9 Unread as B, then mark read, then unread drops
  const unreadBeforeRes = await fetch(`${BASE}/api/messaging/unread-count`, { headers: hdr(tokenB) });
  const unreadBeforeJson = await unreadBeforeRes.json();
  if (!unreadBeforeRes.ok) fail(`unread-count before: ${unreadBeforeRes.status}`);
  if (typeof unreadBeforeJson.count !== 'number') fail('unread-count shape');
  const countBefore = unreadBeforeJson.count;
  // Fresh user B: only these 3 messages from A should be unread
  if (countBefore !== 3) {
    fail(`expected exactly 3 unread for new user B, got ${countBefore}`);
  }

  const mark = await fetch(`${BASE}/api/messaging/conversations/${conversationId}/mark-read`, {
    method: 'POST',
    headers: hdr(tokenB),
  });
  if (!mark.ok) fail(`mark-read: ${mark.status} ${await mark.text()}`);

  const unreadAfterRes = await fetch(`${BASE}/api/messaging/unread-count`, { headers: hdr(tokenB) });
  const unreadAfterJson = await unreadAfterRes.json();
  if (!unreadAfterRes.ok) fail('unread-count after');
  if (typeof unreadAfterJson.count !== 'number') fail('unread after shape');
  const countAfter = unreadAfterJson.count;
  if (countAfter !== 0) {
    fail(`expected 0 unread after mark-read for B, got ${countAfter}`);
  }

  // Backend: messages table rows, timestamps, no duplicate ids in DB
  const pool = new Pool({ connectionString: dbUrl });
  try {
    const { rows } = await pool.query(
      `SELECT id, conversation_id, sender_id, content, read, created_at
       FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC`,
      [conversationId]
    );
    if (rows.length < 3) fail(`DB: expected >=3 rows, got ${rows.length}`);
    const dbIds = rows.map((r: any) => r.id);
    if (new Set(dbIds).size !== dbIds.length) fail('DB: duplicate message ids');
    for (let i = 0; i < rows.length - 1; i++) {
      const a = new Date(rows[i].created_at).getTime();
      const b = new Date(rows[i + 1].created_at).getTime();
      if (a > b) fail('DB: created_at ordering wrong');
    }
    const fromA = rows.filter((r: any) => r.sender_id === idA);
    if (fromA.length < 3) fail('DB: not enough messages from user A');
  } finally {
    await pool.end();
  }

  console.log('PASS: messaging verification (API + DB)');
  console.log(
    JSON.stringify({ conversationId, messagesChecked: all.length, unreadBefore: countBefore, unreadAfter: countAfter }, null, 2)
  );
}

main().catch((e) => {
  console.error(e);
  fail(String(e?.message || e));
});
