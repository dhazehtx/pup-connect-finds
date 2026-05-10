/**
 * Image embedding for dog photo similarity (CLIP-style).
 * Uses Hugging Face Inference Providers router when HF_TOKEN is set.
 */

const HF_ROUTER = 'https://router.huggingface.co/hf-inference';
const DEFAULT_MODEL = 'google/vit-base-patch16-224';
/** Reject huge images to avoid OOM / timeouts. */
const MAX_IMAGE_BYTES = 6 * 1024 * 1024;

function getToken(): string | null {
  return process.env.HF_TOKEN ?? process.env.HUGGINGFACE_API_KEY ?? null;
}

function getModel(): string {
  return process.env.HF_IMAGE_EMBEDDING_MODEL?.trim() || DEFAULT_MODEL;
}

/** Flatten HF response to a single vector (pool mean if 2D/3D). */
function toVector(raw: unknown): number[] | null {
  if (raw && typeof raw === 'object' && 'embeddings' in (raw as Record<string, unknown>)) {
    return toVector((raw as Record<string, unknown>).embeddings);
  }
  if (Array.isArray(raw)) {
    if (raw.length === 0) return null;
    const first = raw[0];
    if (typeof first === 'number') return raw as number[];
    if (Array.isArray(first)) {
      if (first.length === 0) return null;
      if (typeof first[0] === 'number') {
        const dim = first.length;
        const pooled = new Array(dim).fill(0);
        let count = 0;
        for (const row of raw as number[][]) {
          for (let i = 0; i < dim; i++) pooled[i] += row[i];
          count++;
        }
        for (let i = 0; i < dim; i++) pooled[i] /= count;
        return pooled;
      }
      if (Array.isArray(first[0])) {
        const inner = (raw as number[][][])[0];
        const dim = inner[0]?.length ?? 0;
        if (dim === 0) return null;
        const pooled = new Array(dim).fill(0);
        let count = 0;
        for (const row of inner) {
          for (let i = 0; i < dim; i++) pooled[i] += row[i];
          count++;
        }
        for (let i = 0; i < dim; i++) pooled[i] /= count;
        return pooled;
      }
    }
  }
  return null;
}

async function requestEmbedding(
  buffer: Buffer,
  token: string,
  model: string,
  contentType: string,
): Promise<number[] | null> {
  // Prefer the vision pipeline route. Keep fallbacks for provider compatibility.
  const urls = [
    `${HF_ROUTER}/models/${model}/pipeline/image-feature-extraction`,
    `${HF_ROUTER}/models/${model}/pipeline/feature-extraction`,
    `${HF_ROUTER}/models/${model}`,
  ];
  for (const url of urls) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': contentType,
      },
      body: buffer,
      signal: AbortSignal.timeout(20000),
    });
    if (res.status === 503) return null;
    if (!res.ok) continue;
    const data = await res.json();
    const vec = toVector(data);
    if (vec) return vec;
  }
  return null;
}

/**
 * Get embedding vector for an image (base64 string, with or without data URL prefix).
 * Returns null if HF_TOKEN is not set or the API fails.
 */
export async function getImageEmbedding(imageBase64: string): Promise<number[] | null> {
  const token = getToken();
  const model = getModel();
  if (!token?.trim()) return null;

  let buffer: Buffer;
  let contentType = 'image/jpeg';
  try {
    if (imageBase64.startsWith('data:')) {
      const commaIdx = imageBase64.indexOf(',');
      if (commaIdx <= 0) return null;
      const header = imageBase64.slice(0, commaIdx);
      const match = header.match(/^data:([^;]+);base64$/);
      if (match?.[1]) contentType = match[1];
      const base64 = imageBase64.slice(commaIdx + 1);
      buffer = Buffer.from(base64, 'base64');
    } else {
      buffer = Buffer.from(imageBase64, 'base64');
    }
  } catch {
    return null;
  }
  if (buffer.length === 0 || buffer.length > MAX_IMAGE_BYTES) return null;

  try {
    return await requestEmbedding(buffer, token, model, contentType);
  } catch {
    return null;
  }
}

/**
 * Get embedding for an image from a URL (e.g. alert image_url).
 * Fetches the image then runs getImageEmbedding. Returns null on any failure.
 */
export async function getImageEmbeddingFromUrl(imageUrl: string): Promise<number[] | null> {
  const token = getToken();
  if (!token?.trim()) return null;
  if (!imageUrl?.trim() || !imageUrl.startsWith('http')) return null;

  try {
    const res = await fetch(imageUrl, {
      signal: AbortSignal.timeout(10000),
      headers: {
        // Some CDNs (e.g. Wikimedia) throttle or block requests with no User-Agent.
        'User-Agent': 'pup-connect-finds/ai-match (image fetch; +https://github.com/)',
      },
    });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > MAX_IMAGE_BYTES) return null;
    const contentType = res.headers.get('content-type')?.split(';')[0]?.trim() || 'image/jpeg';
    const base64 = `data:${contentType};base64,${buf.toString('base64')}`;
    return getImageEmbedding(base64);
  } catch {
    return null;
  }
}

/** Cosine similarity between two vectors (0–1 if normalized). */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  if (denom === 0) return 0;
  const sim = dot / denom;
  return Math.max(0, Math.min(1, (sim + 1) / 2));
}
