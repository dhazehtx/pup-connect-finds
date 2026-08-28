/**
 * Regression guards for the two support P1s (closed-beta blocker removal):
 *  - P1-A: internal/owner-facing text must not render on /contact or /help-center.
 *  - P1-B: the Contact form must persist via a real backend call and only show
 *    success on acceptance — never an unconditional "Message recorded" toast.
 * Plus the server contact endpoint's validation/security shape and schema/migration.
 * Deterministic source-guards — no DB/network.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const read = (rel: string) => readFileSync(path.resolve(__dirname, '..', rel), 'utf8');
const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').split('\n').map((l) => l.replace(/\/\/.*$/, '')).join('\n');

describe('P1-A — no internal/owner text renders on support surfaces', () => {
  const contact = stripComments(read('client/src/pages/Contact.tsx'));
  const help = stripComments(read('client/src/pages/HelpCenter.tsx'));
  const forbidden = [/publish your real address/i, /owner checklist/i, /can be published at launch/i, /launch shell/i];
  it('Contact has no owner-facing wording', () => {
    for (const re of forbidden) expect(contact, `Contact.tsx matched ${re}`).not.toMatch(re);
  });
  it('HelpCenter has no owner-facing wording', () => {
    for (const re of forbidden) expect(help, `HelpCenter.tsx matched ${re}`).not.toMatch(re);
  });
  it('a support email is shown only when explicitly configured (no baked placeholder address)', () => {
    expect(contact).toMatch(/import\.meta\.env\.VITE_SUPPORT_EMAIL/);
    expect(contact).not.toMatch(/SUPPORT_EMAIL_PLACEHOLDER/);
    expect(contact).not.toMatch(/support@petadoptionwebservices\.com/);
  });
});

describe('P1-B — Contact form persists for real; no false success', () => {
  const contact = read('client/src/pages/Contact.tsx');
  it('no unconditional success toast; the old "Message recorded" is gone', () => {
    expect(contact).not.toMatch(/Message recorded/);
    // The console-only fake-submit is gone.
    expect(contact).not.toMatch(/\[contact\] message intent/);
  });
  it('submits to the real backend endpoint and awaits acceptance before success', () => {
    expect(contact).toMatch(/apiRequest\('\/api\/support\/contact',\s*\{[\s\S]*method:\s*'POST'/);
    // success toast lives after the await (in try), and a catch surfaces honest failure
    expect(contact).toMatch(/await apiRequest\('\/api\/support\/contact'/);
    expect(contact).toMatch(/setSubmitError/);
    expect(contact).toMatch(/Message not sent/);
    expect(contact).toMatch(/handleSubmit = async/);
  });
});

describe('P1-B server — /api/support/contact is guest-safe, validated, rate-limited', () => {
  const support = read('server/routes/support.ts');
  it('defines POST /contact with strict rate limiting', () => {
    expect(support).toMatch(/router\.post\('\/contact',\s*strictRateLimit/);
    expect(support).toMatch(/from '\.\.\/middleware\/rateLimiting'/);
  });
  it('validates email, category (allow-list), and message length', () => {
    expect(support).toMatch(/EMAIL_RE\.test\(email\)/);
    expect(support).toMatch(/CONTACT_CATEGORIES\.has\(category\)/);
    expect(support).toMatch(/message\.length < 10/);
    expect(support).toMatch(/status\(400\)/);
  });
  it('derives identity from session (no spoofing) and returns 201 only after insert', () => {
    expect(support).toMatch(/req\.isAuthenticated\?\.\(\)/);
    expect(support).toMatch(/db\s*\.insert\(contactMessages\)/);
    expect(support).toMatch(/status\(201\)/);
    // client cannot set stored user_id/status; server controls them
    expect(support).not.toMatch(/user_id:\s*req\.body/);
  });
  it('does not log message/email bodies (no PII in logs)', () => {
    // the success log records id + category only — never the message body or email
    expect(support).toMatch(/console\.info\('\[contact\] message stored', \{ id: row\?\.id, category \}\)/);
    // no logging of the raw message/email variables
    expect(support).not.toMatch(/console\.[a-z]+\([^)]*\bemail\b[^)]*\)/);
    expect(support).not.toMatch(/console\.[a-z]+\([^)]*,\s*\{[^}]*\bmessage\b[^}]*\}\)/);
  });
});

describe('schema + migration for contact_messages exist and are server-only', () => {
  it('Drizzle model defined with nullable user_id (guest-safe)', () => {
    const schema = read('shared/schema.ts');
    expect(schema).toMatch(/contactMessages = pgTable\('contact_messages'/);
    // user_id has no .notNull() (guests allowed)
    const block = schema.slice(schema.indexOf("contactMessages = pgTable"));
    expect(block).toMatch(/user_id:\s*uuid\('user_id'\)\.references/);
    expect(block.slice(0, 400)).not.toMatch(/user_id:[^\n]*notNull/);
  });
  it('migration creates the table with RLS default-deny + grant revokes', () => {
    const mig = read('supabase/migrations/20260828000001_contact_messages.sql');
    expect(mig).toMatch(/CREATE TABLE IF NOT EXISTS public\.contact_messages/);
    expect(mig).toMatch(/ENABLE ROW LEVEL SECURITY/);
    expect(mig).toMatch(/REVOKE ALL PRIVILEGES ON public\.contact_messages FROM anon/);
    expect(mig).toMatch(/REVOKE ALL PRIVILEGES ON public\.contact_messages FROM authenticated/);
  });
});
