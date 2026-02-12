# MY PUP - MVP Completion Dashboard

**Generated: February 12, 2026**

---

## MVP Completion Score: 72%

---

## Core Systems Breakdown

| # | System | % Complete | Status |
|---|--------|-----------|--------|
| 1 | Auth + Gating | 90% | Near-complete |
| 2 | Home Feed Logic | 85% | Working, minor edge case |
| 3 | Profile View + Navigation | 85% | Fixed, working |
| 4 | Posts + Full Post Modal | 85% | Fixed, working |
| 5 | Comments + Replies | 70% | Comments work, replies not persisted |
| 6 | Messaging Threads | 80% | Working, colors fixed |
| 7 | Notifications UI | 35% | Broken - column mismatch + route conflict |
| 8 | Explore + Filters | 80% | Working for guest + auth |
| 9 | Marketplace | 70% | Browsing works, payment flows need verification |
| 10 | Admin Tools | 75% | Dashboard exists, logging FK errors |

---

## Detailed System Analysis

### 1. Auth + Gating (90%)

**Done when:** Guest users can browse Explore/Marketplace. Authenticated users can access all features. Protected routes redirect unauthenticated users.

**What works:**
- `ProtectedRoute` component gates auth-required pages
- `RequireAuth` wrapper for sensitive routes (messages, profile edit)
- `ExploreRouter` shows `ExploreGuest` for unauthenticated, `ExploreAdvanced` for authenticated
- Guest browsing works for Explore and Marketplace
- Session management with Supabase Auth
- Sign in / Sign up / Forgot password flows

**What's missing:**
- Cart actions should prompt sign-in for guests (needs verification)

**Where to verify:** Visit `/explore` logged out (should see guest explore). Visit `/messages` logged out (should redirect). Click "Sign In" to authenticate.

**Known bugs:** None critical.

---

### 2. Home Feed Logic (85%)

**Done when:** Feed shows posts only from followed users, excludes current user's own posts, and shows empty state if no follows.

**What works:**
- Server route `GET /api/posts/home-feed` queries Supabase `follows` table for `following_id`
- Filters out self via `.filter((id: string) => id !== userId)`
- Returns empty array if no follows (empty state)
- Returns up to 50 posts sorted by newest first

**What's missing:**
- Empty state UI could show a "follow someone" prompt (nice-to-have)

**Where to verify:** Log in, go to Home. If following users, see their posts (not your own). If following nobody, see empty feed.

**Known bugs:**
- Supabase follows table uses `following_id` while Neon schema uses `followed_id` — these are separate tables for separate databases (by design), but could cause confusion if queried from wrong source.

---

### 3. Profile View + Navigation (85%)

**Done when:** Profile page loads for self and other users. Followers/Following counts are clickable, open modal, clicking a user navigates to their profile.

**What works:**
- Profile page renders for self (`/profile`) and others (`/profile/:userId`)
- Followers/Following modal opens with user list
- Clicking a user navigates to `/profile/:userId` (fixed in this session)
- Follow/Unfollow actions work via API
- `DialogDescription` added for accessibility (no console warnings)

**What's missing:**
- None critical

**Where to verify:** Go to `/profile`. Click Followers count. Click a user in the list — should navigate to their profile. Close modal — no console errors.

**Known bugs:** None critical.

---

### 4. Posts + Full Post Modal (85%)

**Done when:** Clicking a post image (from Home feed or Profile grid) opens a full post modal showing the image, caption, comments list, and "Add a comment" input.

**What works:**
- `FullPostModal` renders consistently from both Home feed and Profile grid
- Desktop layout: image left, comments right with scrollable area
- Mobile layout: image top, scrollable comments below
- Loading state for comments (spinner)
- Empty state ("No comments yet")
- Like button, share button, comment input
- `DialogTitle` and `DialogDescription` for accessibility

**What's missing:**
- Comment count badge on post cards (nice-to-have)

**Where to verify:** Home feed — click a post image — modal opens with comments + input. Profile grid — click a post — same behavior.

**Known bugs:** None critical.

---

### 5. Comments + Replies (70%)

**Done when:** Comments load and display correctly. Adding a comment works and appears in real-time. Reply threading works if implemented.

**What works:**
- `useComments` hook fetches from Supabase `comments` table
- Real-time subscription for new comments via Supabase channels
- Adding a comment inserts and refreshes
- UI shows Reply button and expand/collapse for threads
- `organizeComments` function handles threading via `parent_comment_id`

**What's missing:**
- **Supabase `comments` table does NOT have `parent_comment_id` column** — replies are inserted as flat comments (no threading at DB level)
- Reply notification creation references `parentCommentId` but the insert doesn't save it
- Reply UI exists but won't create actual threads since DB doesn't support it

**Where to verify:** Open a post modal. Add a comment — it should appear. Click Reply — submit — it adds as a new comment (not nested).

**Known bugs:**
- Reply button exists in UI but replies are flat (not truly threaded) — this is a known limitation, not a regression

---

### 6. Messaging Threads (80%)

**Done when:** Users can send/receive messages. Bubbles show correct colors. No 401/502 errors during normal usage. Thread loads and refreshes properly.

**What works:**
- `MessageThread` component loads conversations via Supabase
- Outgoing bubbles: blue gradient background + white text
- Incoming bubbles: white/gray background + dark text
- Real-time message subscription
- Reply-to-message functionality in UI
- Message read receipts (single/double check marks)
- No 401/502 errors in server logs during normal messaging

**What's missing:**
- Media message sending (image upload in chat) — may not be MVP

**Where to verify:** Go to `/messages`. Open a conversation. Send a message — should appear as blue bubble. Receive — should appear as white/gray. Refresh page — messages persist.

**Known bugs:** None critical in current session.

---

### 7. Notifications UI (35%) ⚠️ CRITICAL

**Done when:** Bell icon shows unread count. Clicking opens notification list. Marking as read works. Clearing works.

**What works:**
- Bell icon renders in StickyHeader for authenticated users (desktop + mobile)
- `NotificationButton` component with Popover UI
- API call signatures fixed (correct `apiRequest` format)
- `retry: false` prevents console spam

**What's BROKEN:**

1. **Route conflict:** `GET /api/notifications` is defined TWICE:
   - Line 265: `app.use('/api/notifications', notificationsRouter)` → queries Supabase with `user_id` column
   - Line 1366: `app.get('/api/notifications', ...)` → **always returns empty `[]`** (stub)
   - The stub at line 1366 may be intercepting requests

2. **Column mismatch in notifications router:** The router queries `.eq('user_id', userId)` but the Neon `notifications` table has `to_user_id`, NOT `user_id`. Supabase notifications table may have different columns too.

3. **Frontend data access mismatch:** `NotificationButton` accesses `notifications?.notifications?.filter(...)` expecting `{ notifications: [...] }` but the API returns a flat array `[...]`. This means `unreadCount` is ALWAYS 0 and the notification list NEVER renders.

4. **Missing DELETE route:** Frontend calls `DELETE /api/notifications/clear` but no such route exists — will return 404.

5. **Method mismatch:** Frontend sends `POST /api/notifications/mark-all-read` but the route is `PATCH /mark-all-read`.

6. **Mark-read column mismatch:** The route uses `.eq('recipient_id', userId)` but the Neon table has `to_user_id`.

**Where to verify:** Click bell icon — should show "No notifications yet" (even if notifications exist in DB). Try mark-all-read or clear — will fail silently.

**Known bugs:** All 6 items above are P0 bugs preventing notifications from working.

---

### 8. Explore + Filters (80%)

**Done when:** Guest users see ExploreGuest with browsable listings/content. Authenticated users see ExploreAdvanced with full filters. Search works.

**What works:**
- `ExploreRouter` properly routes guest vs authenticated
- Guest explore page with browsable content
- Advanced explore with filters (breed, price, age, location)
- Search bar in StickyHeader
- Global search with profile/listing results
- View mode toggles (grid/list)

**What's missing:**
- AI-powered search recommendations (nice-to-have, not MVP)

**Where to verify:** Visit `/explore` logged out — see guest explore. Log in — see advanced explore with filters.

**Known bugs:** None critical.

---

### 9. Marketplace (70%)

**Done when:** Users can browse marketplace tabs (Services, Pup Box, Store). Cart works. Checkout flow functions.

**What works:**
- Marketplace page with 3 tabs: Pet Services, Pup Box, Store
- `CartProvider` wraps the app
- `CartFab` floating action button
- Checkout routes exist (`/checkout/success`, `/checkout/cancel`)
- Stripe integration configured
- API routes for listings CRUD, payments, checkout

**What's missing:**
- End-to-end checkout verification needed
- Cart gating for guests (should prompt sign-in)

**Where to verify:** Go to `/marketplace`. Browse tabs. Add item to cart. Attempt checkout.

**Known bugs:**
- Checkout flow needs end-to-end testing with Stripe test keys

---

### 10. Admin Tools (75%)

**Done when:** Admin users can access `/admin` dashboard. Basic metrics display. User management accessible.

**What works:**
- Admin route protection via `is_admin` check in middleware
- Admin dashboard with metrics queries
- User management, reports, logs pages
- Provider application review system
- Navigation analytics
- `requireAdmin` middleware

**What's missing:**
- None critical for MVP

**Where to verify:** Log in as admin user. Navigate to `/admin`. Dashboard loads with metrics.

**Known bugs:**
- `system_logs` FK error: `Key (user_id)=(...) is not present in table "profiles"` — a user exists in Supabase Auth but not in Neon profiles table. This spams server logs but doesn't break admin functionality.

---

## Definition of Done (MVP) Checklist

- [x] Guest users can browse Explore and Marketplace without signing in
- [x] Authentication flow works (sign up, sign in, sign out)
- [x] Protected routes redirect unauthenticated users
- [x] Home feed shows posts from followed users only (excludes self)
- [x] Profile pages load for self and other users
- [x] Followers/Following modal navigates correctly
- [x] Full Post Modal shows comments + input from all entry points
- [x] Comments can be added and appear in real-time
- [ ] **Notifications display correctly (bell shows unread count, list renders)** ⚠️
- [ ] **Notification actions work (mark read, clear)** ⚠️
- [x] Messaging threads send/receive with correct bubble colors
- [x] Explore works for guest and authenticated users with filters
- [x] Marketplace tabs are browsable
- [ ] **Checkout flow verified end-to-end** (needs testing)
- [x] Admin dashboard accessible for admin users
- [ ] **No recurring server errors blocking core flows** (system_logs FK spam)

---

## Bug Audit + Triage

### P0 — Must Fix Before Launch

| # | Bug | Severity | Where | Root Cause | Fix | Verify |
|---|-----|----------|-------|------------|-----|--------|
| 1 | Notifications never display — frontend expects `{ notifications: [...] }` but API returns `[...]` | P0 | Bell icon → popover | `NotificationButton.tsx:86` accesses `notifications?.notifications?.` but API returns flat array | Change to `notifications?.filter(...)` or wrap API response | Click bell → see notification list |
| 2 | `GET /api/notifications` stub always returns `[]` | P0 | All notification fetches | `routes.ts:1366` overrides/conflicts with `routes/notifications.ts` router | Remove the stub at line 1366 | Check server returns actual notification data |
| 3 | Notifications router queries wrong column (`user_id`) | P0 | `routes/notifications.ts:20` | Neon table has `to_user_id`, not `user_id` | Change `.eq('user_id', ...)` to `.eq('to_user_id', ...)` | Notifications load from DB |
| 4 | Mark-all-read: method mismatch (POST vs PATCH) | P0 | `NotificationButton.tsx:53` | Frontend sends POST, route expects PATCH | Change frontend to PATCH or route to POST | Click "mark all read" → succeeds |
| 5 | Clear notifications: no DELETE route exists | P0 | `NotificationButton.tsx:79` | No `DELETE /api/notifications/clear` in server | Add DELETE route or remove clear button | Click clear → succeeds |
| 6 | Mark-read uses wrong column (`recipient_id`) | P0 | `notifications.ts:85,120` | Table has `to_user_id` not `recipient_id` | Update column references | Mark single notification as read |

### P1 — Should Fix Before Launch

| # | Bug | Severity | Where | Root Cause | Fix | Verify |
|---|-----|----------|-------|------------|-----|--------|
| 7 | `system_logs` FK error spams server logs | P1 | All API requests | User `fbee8e37-...` exists in Supabase Auth but not in Neon `profiles` | Make logging service handle missing profiles gracefully (try/catch, skip logging) | Server logs don't show FK errors |
| 8 | Comments table lacks `parent_comment_id` | P1 | Reply button in FullPostModal | Supabase schema missing column | Either add column or remove reply UI | Replies thread correctly OR reply button hidden |
| 9 | Duplicate notification GET routes may cause confusion | P1 | `routes.ts:634` — `GET /api/notifications/:userId` | Legacy route alongside router | Remove legacy route at line 634 | No route conflicts |

### P2 — Nice to Have

| # | Bug | Severity | Where | Root Cause | Fix | Verify |
|---|-----|----------|-------|------------|-----|--------|
| 10 | Cart doesn't gate guests for purchase actions | P2 | Marketplace → Add to Cart | No auth check on cart add | Add sign-in prompt for guests | Guest clicks "Add to Cart" → prompted to sign in |
| 11 | Empty home feed shows blank (no "follow someone" CTA) | P2 | Home feed when not following anyone | No empty state CTA | Add friendly empty state with follow suggestion | See prompt when feed is empty |

---

## Top 10 Remaining Tasks (Impact → Effort)

| Priority | Task | Impact | Effort |
|----------|------|--------|--------|
| P0 | Fix notifications data access (`notifications?.notifications?` → `notifications?`) in NotificationButton | Critical | 5 min |
| P0 | Remove stub `GET /api/notifications` route at line 1366 in routes.ts | Critical | 2 min |
| P0 | Fix column names in notifications router (`user_id` → `to_user_id`, `recipient_id` → `to_user_id`) | Critical | 10 min |
| P0 | Fix mark-all-read method mismatch (POST→PATCH or change route to accept POST) | Critical | 5 min |
| P0 | Add DELETE route for `/api/notifications/clear` | Critical | 10 min |
| P1 | Make logging service handle missing profiles gracefully (wrap in try/catch, don't throw) | High | 10 min |
| P1 | Remove or fix duplicate notification legacy routes (lines 634, 644) | High | 5 min |
| P1 | Hide reply button or add `parent_comment_id` to comments table | Medium | 15 min |
| P2 | Add guest gating for cart/purchase actions | Medium | 20 min |
| P2 | Add empty home feed CTA ("Follow users to see posts") | Low | 10 min |

---

## Stop Doing This (Risk Avoidance)

- **Do NOT migrate data between Supabase and Neon** — keep current architecture
- **Do NOT add new tables** — fix with existing schema
- **Do NOT refactor auth flow** — it's stable
- **Do NOT change follows logic** — home feed exclusion works correctly
- **Do NOT touch Vite config or build setup** — it works
- **Do NOT modify Stripe webhook handlers** — they're configured and working
