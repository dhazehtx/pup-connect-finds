/**
 * Live checks: reply + message + system notifications (API payloads + routable URLs).
 * npx tsx scripts/notifications-launch-verify.ts
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { Pool } from '@neondatabase/serverless';
import ws from 'ws';

// @ts-expect-error neon
if (typeof globalThis.WebSocket === 'undefined') {
  (globalThis as any).WebSocket = ws;
}

const BASE = process.env.MESSAGING_VERIFY_BASE_URL?.replace(/\/$/, '') || 'http://127.0.0.1:5000';

function fail(msg: string): never {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
}

function expectedUrl(n: any): string {
  const direct = n?.targetUrl?.trim?.();
  if (direct && /^(\/|https?:\/\/)/.test(direct)) return direct;
  const postId = n.post_id ?? n.postId;
  const commentId = n.comment_id ?? n.commentId;
  const convId = n.related_id ?? n.relatedId;
  switch (n.type) {
    case 'reply':
      if (postId && commentId) return `/post/${postId}?comment=${commentId}`;
      return postId ? `/post/${postId}` : '/home';
    case 'comment':
      if (postId && commentId) return `/post/${postId}?comment=${commentId}`;
      return postId ? `/post/${postId}` : '/home';
    case 'message':
      if (convId) return `/messages/${convId}`;
      return '/messages';
    case 'system':
      return '/notifications';
    default:
      return '/home';
  }
}

async function main() {
  const dbUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!dbUrl || !supabaseUrl || !serviceKey || !anonKey) fail('Missing env (DB + Supabase)');

  const suffix = `${Date.now()}`;
  const emailA = `notif-a-${suffix}@mypup.dev`;
  const emailB = `notif-b-${suffix}@mypup.dev`;
  const password = 'NotifVerify123!';

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const { data: uA, error: eA } = await admin.auth.admin.createUser({
    email: emailA,
    password,
    email_confirm: true,
    user_metadata: { username: `notif_a_${suffix}`, full_name: `Notif A ${suffix}` },
  });
  const { data: uB, error: eB } = await admin.auth.admin.createUser({
    email: emailB,
    password,
    email_confirm: true,
    user_metadata: { username: `notif_b_${suffix}`, full_name: `Notif B ${suffix}` },
  });
  if (eA || !uA.user?.id) fail(`user A: ${eA?.message}`);
  if (eB || !uB.user?.id) fail(`user B: ${eB?.message}`);
  const idA = uA.user.id as string;
  const idB = uB.user.id as string;

  const anon = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });
  const { data: sA } = await anon.auth.signInWithPassword({ email: emailA, password });
  const { data: sB } = await anon.auth.signInWithPassword({ email: emailB, password });
  if (!sA.session?.access_token || !sB.session?.access_token) fail('signIn');
  const tokenA = sA.session.access_token;
  const tokenB = sB.session.access_token;

  const hdr = (t: string) => ({
    Authorization: `Bearer ${t}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  });

  for (const [name, t] of [
    ['A', tokenA],
    ['B', tokenB],
  ] as const) {
    const w = await fetch(`${BASE}/api/profiles/me`, { headers: hdr(t) });
    if (!w.ok) fail(`profile warm ${name}: ${w.status}`);
  }

  // --- Comment: B comments on A's post → A gets type=comment ---
  const postRes = await fetch(`${BASE}/api/posts`, {
    method: 'POST',
    headers: hdr(tokenA),
    body: JSON.stringify({ content: 'launch-verify-post', user_id: idA }),
  });
  const post = await postRes.json();
  if (!postRes.ok || !post?.id) fail(`create post: ${postRes.status} ${JSON.stringify(post)}`);
  const postId = post.id as string;

  const cParent = await fetch(`${BASE}/api/comments`, {
    method: 'POST',
    headers: hdr(tokenB),
    body: JSON.stringify({
      post_id: postId,
      user_id: idB,
      content: 'parent comment',
    }),
  });
  const parentJson = await cParent.json();
  if (!cParent.ok || !parentJson?.id) fail(`parent comment: ${JSON.stringify(parentJson)}`);
  const parentId = parentJson.id as string;

  await new Promise((r) => setTimeout(r, 500));

  const listA = await fetch(`${BASE}/api/notifications`, { headers: hdr(tokenA) });
  const notifsA = await listA.json();
  if (!Array.isArray(notifsA)) fail('notifications not array');
  const commentN = notifsA.find((n: any) => n.type === 'comment' && (n.post_id || n.postId) === postId);
  if (!commentN) fail('no comment notification for A');
  if (!(commentN.post_id || commentN.postId) || !(commentN.comment_id || commentN.commentId)) {
    fail('comment notification missing post_id or comment_id');
  }
  const urlComment = expectedUrl(commentN);
  if (!urlComment.includes(`/post/${postId}`) || !urlComment.includes('comment=')) {
    fail(`comment URL mismatch: ${urlComment}`);
  }

  // --- Message path sanity: conversation + send should succeed ---
  const foc = await fetch(`${BASE}/api/messaging/conversations/find-or-create`, {
    method: 'POST',
    headers: hdr(tokenA),
    body: JSON.stringify({ targetUserId: idB }),
  });
  const focJ = await foc.json();
  if (!foc.ok) fail(`find-or-create: ${JSON.stringify(focJ)}`);
  const convId = focJ.conversationId || focJ.id;

  await fetch(`${BASE}/api/messaging/messages`, {
    method: 'POST',
    headers: hdr(tokenA),
    body: JSON.stringify({ conversation_id: convId, content: 'notif-verify-dm' }),
  });
  const unreadB = await fetch(`${BASE}/api/messaging/unread-count`, { headers: hdr(tokenB) });
  const unreadBJson = await unreadB.json();
  if (!unreadB.ok || typeof unreadBJson.count !== 'number' || unreadBJson.count < 1) {
    fail(`message unread-count check failed: ${unreadB.status} ${JSON.stringify(unreadBJson)}`);
  }

  // --- System: insert row for B, GET and verify routable URL ---
  const pool = new Pool({ connectionString: dbUrl });
  let sysId: string;
  try {
    const { rows } = await pool.query(
      `INSERT INTO notifications (to_user_id, from_user_id, type, title, message, is_read, read, target_url)
       VALUES ($1, $2, 'system', 'System check', 'Launch verify system row', false, false, NULL)
       RETURNING id`,
      [idB, idA]
    );
    sysId = rows[0].id;
  } finally {
    await pool.end();
  }

  const listB3 = await fetch(`${BASE}/api/notifications`, { headers: hdr(tokenB) });
  const notifsB3 = await listB3.json();
  const sysN = notifsB3.find((n: any) => n.id === sysId);
  if (!sysN || sysN.type !== 'system') fail('system notification not returned');
  const urlSys = expectedUrl(sysN);
  if (urlSys !== '/notifications' && !String(sysN.targetUrl || '').startsWith('/')) {
    fail(`system URL: ${urlSys}`);
  }

  console.log('PASS: notifications (comment + system) + messaging unread signal');
  console.log(JSON.stringify({ commentUrl: urlComment, systemUrl: urlSys, unreadForB: unreadBJson.count }, null, 2));
}

main().catch((e) => {
  console.error(e);
  fail(String(e?.message || e));
});
