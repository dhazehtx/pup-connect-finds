import fs from 'fs';
import os from 'os';
import path from 'path';

/** 1×1 PNG bytes (same as lost-and-found e2e). */
const TINY_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

let cachedPath: string | null = null;

/** Writable path to a tiny PNG for setInputFiles. */
export function getTinyPngPath(): string {
  if (cachedPath && fs.existsSync(cachedPath)) return cachedPath;
  const p = path.join(os.tmpdir(), `e2e-tiny-${process.pid}.png`);
  fs.writeFileSync(p, Buffer.from(TINY_PNG_BASE64, 'base64'));
  cachedPath = p;
  return p;
}
