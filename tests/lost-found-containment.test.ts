/**
 * Lost & Found is intentionally dormant for the initial PAWS public launch:
 * feature-flagged off, backing tables not in the production migration pipeline,
 * and NOT wired into any route. These tests pin that containment (so a future
 * edit can't silently expose the unfinished feature) and guard the direction /
 * authorization invariants of the matching backend.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { FEATURES, isFeatureEnabled } from '../client/src/config/features';

const read = (rel: string) => readFileSync(path.resolve(__dirname, '..', rel), 'utf8');

// ─────────────────────────── containment ───────────────────────────
describe('Lost & Found is contained (hidden) at the default launch config', () => {
  it('the feature flag defaults OFF', () => {
    expect(FEATURES.lostAndFound).toBe(false);
    expect(isFeatureEnabled('lostAndFound')).toBe(false);
  });

  it('the app router neither routes nor imports the Lost & Found page', () => {
    const app = read('client/src/App.tsx');
    expect(app).not.toMatch(/lost-and-found/);
    expect(app).not.toMatch(/LostAndFoundPage/);
    // the flag-gated tabbed explore is not the routed explore surface either
    expect(app).not.toMatch(/ExploreTabbedPage/);
  });

  it('the LIVE explore surface renders no Lost & Found content', () => {
    // /explore → ExploreRouter → ExploreGuest / ExploreAdvanced
    for (const f of [
      'client/src/pages/ExploreRouter.tsx',
      'client/src/pages/ExploreGuest.tsx',
      'client/src/pages/ExploreAdvanced.tsx',
    ]) {
      expect(read(f)).not.toMatch(/lostAndFound|LostAndFound|lost-and-found/);
    }
  });

  it('the flag has exactly one consumer, and it is the unrouted tabbed-explore page', () => {
    // If this ever changes, whoever adds a new consumer must revisit containment.
    const tabbed = read('client/src/pages/ExploreTabbedPage.tsx');
    expect(tabbed).toMatch(/FEATURES\.lostAndFound/);
  });
});

// ─────────────── LOST ↔ FOUND direction + cross-user safety ───────────────
describe('matching direction and self/cross-user exclusion', () => {
  const notify = read('server/lib/embeddingMatchNotify.ts');
  const routes = read('server/routes/lost-pet-alerts.ts');

  it('the auto-notify compares against the OPPOSITE alert type', () => {
    expect(notify).toMatch(/alert_type === 'found' \? 'lost' : 'found'/);
    expect(notify).toMatch(/eq\(lostPetAlerts\.alert_type, oppositeType\)/);
  });

  it('the auto-notify never matches a user to their own alert', () => {
    expect(notify).toMatch(/ne\(lostPetAlerts\.user_id, alert\.user_id\)/);
  });

  it('/ai-match excludes the requesting user\'s own alerts (no self-match)', () => {
    expect(routes).toMatch(/ne\(lostPetAlerts\.user_id, viewerId\)/);
  });
});

// ─────────────────────────── privacy: status whitelist ───────────────────────────
describe('public alert listing cannot enumerate non-listable statuses', () => {
  const routes = read('server/routes/lost-pet-alerts.ts');
  it('GET / whitelists status to active/reunited', () => {
    expect(routes).toMatch(/PUBLIC_LISTABLE_STATUSES = \['active', 'reunited'\]/);
    expect(routes).toMatch(/PUBLIC_LISTABLE_STATUSES\.includes\(rawStatus\) \? rawStatus : 'active'/);
  });
});
