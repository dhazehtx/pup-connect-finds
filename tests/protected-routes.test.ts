/**
 * Regression guard: authenticated-only routes (incl. the seller routes
 * /create-listing and /my-listings) must be wrapped in an auth guard, and the
 * guard must redirect anonymous users away — never render the seller UI.
 *
 * Motivated by a production finding that logged-out /create-listing appeared to
 * render the listing form. Runtime check confirmed production redirects to
 * /greeting; these guards keep it that way. Deterministic source-guard.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const read = (rel: string) => readFileSync(path.resolve(__dirname, '..', rel), 'utf8');

describe('authenticated routes are guarded in App.tsx', () => {
  const app = read('client/src/App.tsx');
  // Extract the element JSX for a given route path and assert its guard wrapper.
  const guardFor = (routePath: string): string => {
    const re = new RegExp(`<Route path="${routePath.replace('/', '\\/')}" element=\\{([\\s\\S]{0,120})`);
    const m = app.match(re);
    return m ? m[1] : '';
  };
  for (const r of ['/create-listing', '/my-listings', '/profile', '/messages']) {
    it(`${r} is wrapped in <RequireAuth>`, () => {
      expect(guardFor(r), `${r} must be guarded by RequireAuth`).toMatch(/<RequireAuth>/);
    });
  }
  it('/admin is wrapped in an admin guard (ProtectedRoute)', () => {
    expect(guardFor('/admin')).toMatch(/<ProtectedRoute>/);
  });
});

describe('RequireAuth redirects anonymous users (does not render children)', () => {
  const ra = read('client/src/components/RequireAuth.tsx');
  it('redirects to /greeting only after auth is loaded and there is no user', () => {
    // shows a loading state until auth resolves (no premature render/redirect)
    expect(ra).toMatch(/if \(loading \|\| !loaded\)/);
    // the redirect condition is loaded && !loading && !user
    expect(ra).toMatch(/loaded && !loading && !user/);
    // anonymous users are navigated away to /greeting
    expect(ra).toMatch(/<Navigate to="\/greeting" replace \/>/);
    // children only render on the authenticated fall-through
    expect(ra).toMatch(/return children;/);
  });
});
