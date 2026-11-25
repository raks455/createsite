// Entry point: connects to PostgreSQL, loads the content on first start and
// serves the website. Pages are rendered on each request from the content in
// the database, so updates pushed from CreateSite appear without a redeploy.
import express, { type Request, type Response, type NextFunction } from 'express';
import { config } from './config';
import { Database } from './db';
import { ContentCache } from './content';
import { adminRouter } from './admin';
import { resolveRequest } from './core';

const MAX_FIELDS = 40;
const MAX_VALUE = 5000;

/** Visitor form data → stored fields. Keys starting with "_" are meta fields. */
function cleanFields(body: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(body)) {
    if (k.startsWith('_') || Object.keys(out).length >= MAX_FIELDS) continue;
    out[k.slice(0, 60)] = (Array.isArray(v) ? v.join(', ') : String(v ?? '')).slice(0, MAX_VALUE);
  }
  return out;
}

const wrap = (fn: (req: Request, res: Response) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => { fn(req, res).catch(next); };

async function main(): Promise<void> {
  const db = new Database(config.databaseUrl);
  await db.migrate();
  if (await db.seed(config.contentDir)) console.log('Loaded the exported content into the database.');
  const cache = new ContentCache(db, config.cacheSeconds * 1000);

  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', true); // Render terminates HTTPS in front of the app

  app.use('/_createsite', adminRouter(db, cache, config.adminToken));

  // Media files (images, video, PDFs…) stored in the database
  app.get('/uploads/:folder/:name', wrap(async (req, res) => {
    const file = await db.getMedia(req.params.name);
    if (!file) return res.status(404).type('text').send('Not found');
    res.set('Cache-Control', 'public, max-age=604800').set('Last-Modified', file.updatedAt.toUTCString()).type(file.type).send(file.data);
  }));

  // Contact forms
  app.post('/__form', express.urlencoded({ extended: false, limit: '1mb' }), wrap(async (req, res) => {
    const body = (req.body || {}) as Record<string, unknown>;
    if (!body._hp) {
      const fields = cleanFields(body);
      if (Object.values(fields).some((v) => v.trim())) {
        await db.addSubmission({ pageId: String(body._page || '').slice(0, 40), blockId: String(body._block || '').slice(0, 40), fields, ip: req.ip || '' });
      }
    }
    if (req.accepts(['html', 'json']) === 'json') return res.json({ ok: true });
    res.redirect(303, req.get('referer') || '/');
  }));

  // Every page, robots.txt, sitemap.xml, 404 and coming-soon mode
  app.get('*', wrap(async (req, res) => {
    const site = await cache.get();
    let path = req.path;
    try { path = decodeURIComponent(path); } catch { /* keep raw */ }
    const result = resolveRequest(site, path, { base: '', origin: `${req.protocol}://${req.get('host')}` });
    res.status(result.status).set('Cache-Control', 'no-cache').type(result.contentType).send(result.body);
  }));

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    if (!res.headersSent) res.status(500).type('text').send('Something went wrong');
  });

  app.listen(config.port, () => console.log(`Website running on http://localhost:${config.port}`));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
