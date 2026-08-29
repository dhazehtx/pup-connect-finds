/**
 * Lost & Found photo-match engine — first unit coverage.
 *
 * The comparison core (CLIP cosine similarity + score thresholds) is pure and
 * deterministic, so it is tested directly without the Hugging Face provider or a
 * DB. The route-level fixes (alert similarity floor, failure≠no-match signaling,
 * embedding-write authz) are guarded against regression at the source level,
 * matching the repo's existing wiring-guard test style.
 */
import { describe, it, expect, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { cosineSimilarity } from '../server/lib/imageEmbedding';
import {
  getAiMatchMinListingScore,
  getAiMatchMinAlertScore,
  getEmbeddingMatchNotifyMinScore,
  AI_MATCH_DEFAULT_MIN_LISTING_SCORE,
  AI_MATCH_DEFAULT_MIN_ALERT_SCORE,
  EMBEDDING_MATCH_NOTIFY_DEFAULT_MIN_SCORE,
} from '../server/lib/aiMatchConfig';

const read = (rel: string) => readFileSync(path.resolve(__dirname, '..', rel), 'utf8');

// ─────────────────────────── comparison math ───────────────────────────
describe('cosineSimilarity (CLIP score, remapped to 0–1)', () => {
  it('identical vectors → 1 (max similarity)', () => {
    expect(cosineSimilarity([1, 2, 3], [1, 2, 3])).toBe(1);
  });
  it('orthogonal vectors → 0.5 (the neutral midpoint of the (cos+1)/2 remap)', () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBe(0.5);
  });
  it('opposite vectors → 0 (min similarity)', () => {
    expect(cosineSimilarity([1, 0], [-1, 0])).toBe(0);
  });
  it('mismatched lengths → 0 (cannot compare)', () => {
    expect(cosineSimilarity([1, 2], [1, 2, 3])).toBe(0);
  });
  it('a zero vector → 0 (no direction)', () => {
    expect(cosineSimilarity([0, 0], [1, 1])).toBe(0);
  });
  it('is symmetric', () => {
    const a = [0.2, 0.9, -0.3];
    const b = [0.1, 0.8, 0.4];
    expect(cosineSimilarity(a, b)).toBe(cosineSimilarity(b, a));
  });
});

// ── positive / negative control at the gate the /ai-match alert branch uses ──
describe('alert match gate: same-dog surfaces, different-dog is filtered', () => {
  const passesAlertFloor = (a: number[], b: number[]) =>
    cosineSimilarity(a, b) >= getAiMatchMinAlertScore();

  it('POSITIVE CONTROL: near-identical embeddings clear the floor', () => {
    const dog = [0.9, 0.1, 0.42, -0.15];
    const sameDog = [0.91, 0.11, 0.41, -0.14]; // a second photo of the same dog
    expect(passesAlertFloor(dog, sameDog)).toBe(true);
  });
  it('NEGATIVE CONTROL: unrelated (orthogonal ≈0.5) embeddings do NOT clear the floor', () => {
    expect(passesAlertFloor([1, 0, 0], [0, 1, 0])).toBe(false);
  });
});

// ─────────────────────────── score thresholds ───────────────────────────
describe('AI match score thresholds', () => {
  afterEach(() => {
    delete process.env.AI_MATCH_MIN_LISTING_SCORE;
    delete process.env.AI_MATCH_MIN_ALERT_SCORE;
    delete process.env.EMBEDDING_MATCH_NOTIFY_MIN_SCORE;
  });

  it('defaults are conservative and the alert floor matches the listing floor', () => {
    expect(getAiMatchMinListingScore()).toBe(AI_MATCH_DEFAULT_MIN_LISTING_SCORE);
    expect(getAiMatchMinAlertScore()).toBe(AI_MATCH_DEFAULT_MIN_ALERT_SCORE);
    expect(AI_MATCH_DEFAULT_MIN_ALERT_SCORE).toBe(AI_MATCH_DEFAULT_MIN_LISTING_SCORE);
    expect(getEmbeddingMatchNotifyMinScore()).toBe(EMBEDDING_MATCH_NOTIFY_DEFAULT_MIN_SCORE);
  });
  it('honor env overrides', () => {
    process.env.AI_MATCH_MIN_ALERT_SCORE = '0.9';
    expect(getAiMatchMinAlertScore()).toBe(0.9);
  });
  it('clamp to [0,1] and fall back to the default on garbage', () => {
    process.env.AI_MATCH_MIN_ALERT_SCORE = '2';
    expect(getAiMatchMinAlertScore()).toBe(1);
    process.env.AI_MATCH_MIN_ALERT_SCORE = '-1';
    expect(getAiMatchMinAlertScore()).toBe(0);
    process.env.AI_MATCH_MIN_ALERT_SCORE = 'not-a-number';
    expect(getAiMatchMinAlertScore()).toBe(AI_MATCH_DEFAULT_MIN_ALERT_SCORE);
  });
});

// ─────────────────── route-level fixes (regression guards) ───────────────────
describe('/ai-match route hardening', () => {
  const routes = read('server/routes/lost-pet-alerts.ts');

  it('the alert branch is gated by a similarity floor (no 0-similarity "matches")', () => {
    expect(routes).toMatch(/const minAlertScore = getAiMatchMinAlertScore\(\)/);
    expect(routes).toMatch(/if \(matchScore < minAlertScore\) continue;/);
  });
  it('an unexpected failure signals an error, not an empty "no matches" result', () => {
    // the missing-table (pre-launch) case still degrades to a benign empty result…
    expect(routes).toMatch(/matchRanking: 'empty' as const/);
    // …but a genuine failure returns a non-2xx error the client can distinguish
    expect(routes).toMatch(/\.status\(502\)[\s\S]{0,120}matchRanking: 'error'/);
  });
});

describe('lost-dog embedding write is authenticated + ownership-gated', () => {
  const ndis = read('server/routes/lost-dog-ndis.ts');
  it('rejects unauthenticated callers and non-owners before inserting', () => {
    const ep = ndis.slice(ndis.indexOf("router.post('/embedding'"));
    const body = ep.slice(0, ep.indexOf('db.insert(dogEmbeddings)'));
    expect(body).toMatch(/status\(401\)/); // must be authenticated
    expect(body).toMatch(/status\(403\)/); // must own the alert
    expect(body).toMatch(/lostPetAlerts/); // ownership looked up against the alert
  });
});
