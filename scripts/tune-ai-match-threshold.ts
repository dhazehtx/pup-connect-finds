import { config } from 'dotenv';

config();

/**
 * Calibrate AI_MATCH_MIN_LISTING_SCORE without hand-labeled “same dog” pairs.
 *
 * Embeds several fixed Wikimedia Commons images (multiple dog breeds + one cat) via
 * the same CLIP path as production (`getImageEmbeddingFromUrl`). Pairwise similarity
 * across *different* images approximates how high “unrelated” visual matches can score,
 * so you can set a floor above that noise.
 *
 * Requires: HF_TOKEN or HUGGINGFACE_API_KEY, and network access.
 *
 *   npm run tune:ai-match
 */

import { getImageEmbeddingFromUrl, cosineSimilarity } from '../server/lib/imageEmbedding.ts';
import { AI_MATCH_DEFAULT_MIN_LISTING_SCORE } from '../server/lib/aiMatchConfig.ts';

/** Same model as server/lib/imageEmbedding.ts */
const HF_INFERENCE_MODEL = process.env.HF_IMAGE_EMBEDDING_MODEL?.trim() || 'google/vit-base-patch16-224';
const HF_ROUTER = 'https://router.huggingface.co/hf-inference';

async function printDiagnostics(token: string): Promise<void> {
  console.error('\n--- Diagnostics (embeddings were null — checking network + HF) ---');
  const sampleUrl = REFERENCE_IMAGES[0].url;
  try {
    const imgRes = await fetch(sampleUrl, { signal: AbortSignal.timeout(20000) });
    console.error(`Wikimedia sample image: HTTP ${imgRes.status} ${imgRes.ok ? '' : '(blocked or URL changed?)'}`);
  } catch (e) {
    console.error(`Wikimedia sample image: fetch failed — ${(e as Error).message}`);
  }

  try {
    const sampleImg = await fetch(sampleUrl, { signal: AbortSignal.timeout(20000) });
    if (!sampleImg.ok) {
      console.error(`Hugging Face router check skipped: sample image fetch failed with HTTP ${sampleImg.status}`);
      console.error('---\n');
      return;
    }
    const imageBytes = Buffer.from(await sampleImg.arrayBuffer());
    const imageContentType = sampleImg.headers.get('content-type')?.split(';')[0]?.trim() || 'image/png';
    const hfRes = await fetch(
      `${HF_ROUTER}/models/${HF_INFERENCE_MODEL}/pipeline/image-feature-extraction`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token.trim()}`,
          'Content-Type': imageContentType,
        },
        body: imageBytes,
        signal: AbortSignal.timeout(45000),
      },
    );
    const text = await hfRes.text();
    if (hfRes.ok) {
      console.error(`Hugging Face Inference Providers router: HTTP ${hfRes.status} OK`);
    } else {
      console.error(`Hugging Face Inference Providers router: HTTP ${hfRes.status}`);
      console.error(`Response (truncated): ${text.slice(0, 500)}`);
      if (hfRes.status === 503) {
        console.error('Tip: Model is waking up. Wait 1–2 minutes, run npm run tune:ai-match again.');
      }
      if (hfRes.status === 401) {
        console.error('Tip: Token rejected — create a new token at huggingface.co/settings/tokens and set HF_TOKEN in .env.');
      }
    }
  } catch (e) {
    console.error(`Hugging Face request failed — ${(e as Error).message}`);
  }
  console.error('---\n');
}

/** Hugging Face–hosted samples (Wikimedia often returns 429 for automated fetches). */
const REFERENCE_IMAGES = [
  {
    label: 'hf_sample_cat_dog',
    url: 'https://huggingface.co/datasets/mishig/sample_images/resolve/main/cat-dog-music.png',
  },
  {
    label: 'hf_docs_cats',
    url: 'https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/cats.png',
  },
  {
    label: 'hf_sample_tiger',
    url: 'https://huggingface.co/datasets/mishig/sample_images/resolve/main/tiger.jpg',
  },
] as const;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return NaN;
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo]!;
  return sorted[lo]! * (hi - idx) + sorted[hi]! * (idx - lo);
}

async function main() {
  const token = process.env.HF_TOKEN ?? process.env.HUGGINGFACE_API_KEY;
  if (!token?.trim()) {
    console.error('Set HF_TOKEN (or HUGGINGFACE_API_KEY) to run this script.');
    process.exit(1);
  }

  const embeddings: (number[] | null)[] = [];
  for (const { label, url } of REFERENCE_IMAGES) {
    process.stdout.write(`Embedding ${label}… `);
    const vec = await getImageEmbeddingFromUrl(url);
    if (!vec?.length) {
      console.log('failed (null embedding)');
    } else {
      console.log(`ok (${vec.length} dims)`);
    }
    embeddings.push(vec);
    await sleep(800);
  }

  const selfSims: number[] = [];
  for (let i = 0; i < embeddings.length; i++) {
    const a = embeddings[i];
    if (!a) continue;
    selfSims.push(cosineSimilarity(a, a));
  }

  const cross: number[] = [];
  for (let i = 0; i < embeddings.length; i++) {
    const a = embeddings[i];
    if (!a) continue;
    for (let j = i + 1; j < embeddings.length; j++) {
      const b = embeddings[j];
      if (!b) continue;
      cross.push(cosineSimilarity(a, b));
    }
  }

  if (cross.length === 0) {
    console.error('No cross-pair scores; check HF API and image URLs.');
    await printDiagnostics(token);
    process.exit(1);
  }

  cross.sort((x, y) => x - y);

  console.log('\n--- Sanity (same image vs itself; expect ~1.0) ---');
  console.log(selfSims.map((s) => s.toFixed(4)).join(', ') || '(none)');

  console.log('\n--- Cross-image similarities (different reference photos) ---');
  const p50 = percentile(cross, 0.5);
  const p75 = percentile(cross, 0.75);
  const p90 = percentile(cross, 0.9);
  console.log(
    `n=${cross.length}  min=${cross[0]!.toFixed(4)}  max=${cross[cross.length - 1]!.toFixed(4)}`,
  );
  console.log(`p50=${p50.toFixed(4)}  p75=${p75.toFixed(4)}  p90=${p90.toFixed(4)}`);

  const margin = 0.03;
  let suggested = p90 + margin;
  suggested = Math.min(0.88, Math.max(0.58, Math.round(suggested * 100) / 100));

  console.log('\n--- Suggested env (heuristic) ---');
  console.log(
    `AI_MATCH_MIN_LISTING_SCORE=${suggested.toFixed(2)}  ← p90(cross) + ${margin}, clamped to [0.58, 0.88]`,
  );
  console.log(`Built-in default if env unset: ${AI_MATCH_DEFAULT_MIN_LISTING_SCORE} (server/lib/aiMatchConfig.ts)`);
  console.log(
    '\nNote: Reference images are not your users’ dogs. Use this as a starting band; raise the value if Explore matches feel noisy, lower if you miss plausible leads.',
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
