/**
 * Legal-surface regressions:
 *  - P1: internal "Owner note" drafting blocks must never render on production legal
 *    pages (they were visible to end users on /legal/shipping and /legal/returns).
 *  - P3: bare /terms, /shipping, /returns alias to the canonical /legal/* pages.
 *  - the catch-all 404 route remains for genuinely unknown routes.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const read = (rel: string) => readFileSync(path.resolve(__dirname, '..', rel), 'utf8');

/** Strip JS/JSX comments so an "Owner note" in a dev code-comment (never rendered)
 *  doesn't count; only RENDERED text matters. */
const stripComments = (src: string) =>
  src
    .replace(/\/\*[\s\S]*?\*\//g, '')          // block comments
    .split('\n')
    .map((l) => l.replace(/\/\/.*$/, ''))       // line comments
    .join('\n');

describe('P1 — no internal "Owner note" text renders on legal pages', () => {
  const legalDir = path.resolve(__dirname, '..', 'client/src/pages/legal');
  const files = readdirSync(legalDir).filter((f) => f.endsWith('.tsx'));

  it('every legal page is free of rendered "Owner note" callouts', () => {
    const offenders = files.filter((f) =>
      /owner note/i.test(stripComments(readFileSync(path.join(legalDir, f), 'utf8'))),
    );
    expect(offenders, `owner-note text still renders in: ${offenders.join(', ')}`).toEqual([]);
  });

  it('shipping/returns keep their customer-facing content', () => {
    const shipping = read('client/src/pages/legal/ShippingPolicy.tsx');
    const returns = read('client/src/pages/legal/ReturnsPolicy.tsx');
    expect(shipping).toMatch(/Shipping Policy/);
    expect(shipping).toMatch(/Order processing/);
    expect(returns).toMatch(/Returns/);
  });
});

describe('P3 — bare legal routes alias to /legal/*', () => {
  const app = read('client/src/App.tsx');
  it('redirects /terms, /shipping, /returns to their canonical pages', () => {
    expect(app).toMatch(/path="\/terms" element=\{<Navigate to="\/legal\/terms" replace \/>\}/);
    expect(app).toMatch(/path="\/shipping" element=\{<Navigate to="\/legal\/shipping" replace \/>\}/);
    expect(app).toMatch(/path="\/returns" element=\{<Navigate to="\/legal\/returns" replace \/>\}/);
  });
  it('the canonical /legal/* pages and the catch-all 404 still exist', () => {
    expect(app).toMatch(/path="\/legal\/terms"/);
    expect(app).toMatch(/path="\/legal\/shipping"/);
    expect(app).toMatch(/path="\/legal\/returns"/);
    expect(app).toMatch(/<Route path="\*" element=/);
  });
});
