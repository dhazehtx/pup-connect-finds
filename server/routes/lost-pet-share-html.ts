// @ts-nocheck
import type { Express, Request, Response } from 'express';
import { db } from '../db';
import { lostPetAlerts } from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Crawler-friendly HTML with Open Graph tags for shared lost/found links.
 * Redirects humans to the SPA with ?alert=
 */
export function registerLostPetShareHtml(app: Express): void {
  app.get('/share/lost-pet/:id', async (req: Request, res: Response) => {
    const id = req.params.id;
    let title = 'Lost & Found — My Pup';
    let description = 'View lost and found dog listings on My Pup.';
    let image = '';
    try {
      const [a] = await db.select().from(lostPetAlerts).where(eq(lostPetAlerts.id, id)).limit(1);
      if (a) {
        const kind = a.alert_type === 'lost' ? 'Lost' : 'Found';
        title = `${kind} dog${a.pet_name ? `: ${a.pet_name}` : ''} — My Pup`;
        const parts = [a.breed, a.last_seen_address || a.city].filter(Boolean);
        description = parts.length ? parts.join(' · ') : description;
        image = (a.image_url || '').trim();
      }
    } catch {
      // fall through with defaults
    }

    const host = req.get('host') || 'localhost';
    const proto = req.protocol || 'https';
    const base = process.env.APP_BASE_URL || `${proto}://${host}`;
    const pageUrl = `${base}/lost-and-found?alert=${encodeURIComponent(id)}`;
    const ogImage =
      image && (image.startsWith('http://') || image.startsWith('https://')) ? image : `${base}/favicon.ico`;

    const esc = (s: string) =>
      s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/"/g, '&quot;');

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:image" content="${esc(ogImage)}" />
  <meta property="og:url" content="${esc(pageUrl)}" />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta http-equiv="refresh" content="0;url=${esc(pageUrl)}" />
  <link rel="canonical" href="${esc(pageUrl)}" />
</head>
<body>
  <p><a href="${esc(pageUrl)}">Continue to My Pup — Lost &amp; Found</a></p>
</body>
</html>`);
  });
}
