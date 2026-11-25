// PostgreSQL access: schema, first-run seeding and all queries.
import fs from 'fs/promises';
import path from 'path';
import { Pool } from 'pg';
import type { Site } from './core';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS site_content (
  id         SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  data       JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS site_media (
  name       TEXT PRIMARY KEY,
  type       TEXT NOT NULL,
  size       INTEGER NOT NULL,
  data       BYTEA NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS site_submissions (
  id         BIGSERIAL PRIMARY KEY,
  page_id    TEXT NOT NULL DEFAULT '',
  block_id   TEXT NOT NULL DEFAULT '',
  fields     JSONB NOT NULL,
  ip         TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS site_submissions_created ON site_submissions (created_at DESC);
`;

const MIME: Record<string, string> = {
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp',
  '.avif': 'image/avif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.webm': 'video/webm',
  '.mov': 'video/quicktime', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg', '.pdf': 'application/pdf',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf',
};
export const mimeOf = (name: string): string => MIME[path.extname(name).toLowerCase()] || 'application/octet-stream';
export const safeName = (name: string): string => path.basename(String(name || ''));

export interface MediaFile { name: string; type: string; size: number }
export interface Submission { id: string; pageId: string; blockId: string; fields: Record<string, string>; ip: string; createdAt: string }

const isLocal = (url: string) => /@(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(url);

export class Database {
  readonly pool: Pool;

  constructor(connectionString: string) {
    // Neon requires TLS; its URLs include ?sslmode=require. Add TLS if the URL doesn't say.
    const ssl = /sslmode=/.test(connectionString) || isLocal(connectionString) ? undefined : { rejectUnauthorized: true };
    this.pool = new Pool({ connectionString, ssl, max: 5, idleTimeoutMillis: 30_000 });
    this.pool.on('error', (err) => console.error('Postgres pool error:', err.message));
  }

  async migrate(): Promise<void> {
    await this.pool.query(SCHEMA);
  }

  /** On the very first start, loads content/site.json and content/media/* into the database. */
  async seed(contentDir: string): Promise<boolean> {
    const { rows } = await this.pool.query('SELECT 1 FROM site_content WHERE id = 1');
    if (rows.length) return false;
    const site = JSON.parse(await fs.readFile(path.join(contentDir, 'site.json'), 'utf8')) as Site;
    const mediaDir = path.join(contentDir, 'media');
    const names = await fs.readdir(mediaDir).catch(() => [] as string[]);
    for (const name of names) await this.putMedia(name, await fs.readFile(path.join(mediaDir, name)));
    await this.saveSite(site);
    return true;
  }

  // --- content -------------------------------------------------------------

  async loadSite(): Promise<{ site: Site; version: string } | null> {
    const { rows } = await this.pool.query('SELECT data, updated_at FROM site_content WHERE id = 1');
    return rows[0] ? { site: rows[0].data as Site, version: new Date(rows[0].updated_at).toISOString() } : null;
  }

  async contentVersion(): Promise<string | null> {
    const { rows } = await this.pool.query('SELECT updated_at FROM site_content WHERE id = 1');
    return rows[0] ? new Date(rows[0].updated_at).toISOString() : null;
  }

  async saveSite(site: Site): Promise<void> {
    await this.pool.query(
      `INSERT INTO site_content (id, data, updated_at) VALUES (1, $1, now())
       ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()`,
      [site],
    );
  }

  // --- media ---------------------------------------------------------------

  async listMedia(): Promise<MediaFile[]> {
    const { rows } = await this.pool.query('SELECT name, type, size FROM site_media ORDER BY name');
    return rows;
  }

  async getMedia(name: string): Promise<{ type: string; data: Buffer; updatedAt: Date } | null> {
    const { rows } = await this.pool.query('SELECT type, data, updated_at FROM site_media WHERE name = $1', [safeName(name)]);
    return rows[0] ? { type: rows[0].type, data: rows[0].data, updatedAt: rows[0].updated_at } : null;
  }

  async putMedia(name: string, data: Buffer, type = mimeOf(name)): Promise<void> {
    await this.pool.query(
      `INSERT INTO site_media (name, type, size, data, updated_at) VALUES ($1, $2, $3, $4, now())
       ON CONFLICT (name) DO UPDATE SET type = EXCLUDED.type, size = EXCLUDED.size, data = EXCLUDED.data, updated_at = now()`,
      [safeName(name), type, data.length, data],
    );
  }

  /** Deletes every media file whose name is not in `keep`. Returns how many were removed. */
  async pruneMedia(keep: string[]): Promise<number> {
    const { rowCount } = await this.pool.query('DELETE FROM site_media WHERE NOT (name = ANY($1::text[]))', [keep.map(safeName)]);
    return rowCount ?? 0;
  }

  // --- form submissions ----------------------------------------------------

  async addSubmission(s: { pageId: string; blockId: string; fields: Record<string, string>; ip: string }): Promise<void> {
    await this.pool.query(
      'INSERT INTO site_submissions (page_id, block_id, fields, ip) VALUES ($1, $2, $3, $4)',
      [s.pageId, s.blockId, s.fields, s.ip],
    );
  }

  async listSubmissions(limit = 500): Promise<Submission[]> {
    const { rows } = await this.pool.query(
      'SELECT id, page_id, block_id, fields, ip, created_at FROM site_submissions ORDER BY created_at DESC LIMIT $1', [limit],
    );
    return rows.map((r) => ({
      id: String(r.id), pageId: r.page_id, blockId: r.block_id, fields: r.fields, ip: r.ip, createdAt: new Date(r.created_at).toISOString(),
    }));
  }

  async deleteSubmission(id: string): Promise<void> {
    await this.pool.query('DELETE FROM site_submissions WHERE id = $1', [id]);
  }
}
