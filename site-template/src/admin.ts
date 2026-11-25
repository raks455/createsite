// /_createsite — token-protected API used by the CreateSite builder to push
// content updates, plus a small page to read form entries.
import crypto from 'crypto';
import express, { type Request, type Response, type NextFunction } from 'express';
import type { Site } from './core';
import type { Database } from './db';
import type { ContentCache } from './content';
import { ADMIN_PAGE } from './adminPage';

const sameToken = (a: string, b: string): boolean => {
  const x = crypto.createHash('sha256').update(a).digest();
  const y = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(x, y);
};

const isSite = (v: any): v is Site =>
  v && typeof v === 'object' && typeof v.id === 'string' && v.settings && typeof v.settings === 'object' && Array.isArray(v.pages);

export function adminRouter(db: Database, cache: ContentCache, adminToken: string): express.Router {
  const r = express.Router();

  r.get('/health', (_req, res) => { res.json({ ok: true }); });
  r.get('/', (_req, res) => { res.type('html').send(ADMIN_PAGE); });

  r.use((req: Request, res: Response, next: NextFunction) => {
    if (!adminToken) return res.status(503).json({ error: 'ADMIN_TOKEN is not set on this server' });
    const header = String(req.headers.authorization || '');
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token || !sameToken(token, adminToken)) return res.status(401).json({ error: 'Invalid token' });
    next();
  });

  /** What is deployed right now: content version and media files. */
  r.get('/status', async (_req, res) => {
    const row = await db.loadSite();
    res.json({
      name: row?.site.settings?.general?.name ?? null,
      contentVersion: row?.version ?? null,
      media: await db.listMedia(),
    });
  });

  /** Upload one media file (raw body). */
  r.put('/media/:name', express.raw({ type: () => true, limit: '60mb' }), async (req, res) => {
    const body = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
    await db.putMedia(req.params.name, body, req.get('content-type') || undefined);
    res.json({ ok: true, size: body.length });
  });

  /** Replace the site content. `keepMedia` lists files still in use; others are deleted. */
  r.put('/content', express.json({ limit: '20mb' }), async (req, res) => {
    const { site, keepMedia } = req.body || {};
    if (!isSite(site)) return res.status(400).json({ error: 'Body must be { site, keepMedia }' });
    await db.saveSite(site);
    const removed = Array.isArray(keepMedia) ? await db.pruneMedia(keepMedia.map(String)) : 0;
    cache.invalidate();
    res.json({ ok: true, removedMedia: removed });
  });

  r.get('/submissions', async (_req, res) => { res.json(await db.listSubmissions()); });
  r.delete('/submissions/:id', async (req, res) => {
    await db.deleteSubmission(req.params.id);
    res.json({ ok: true });
  });

  return r;
}
